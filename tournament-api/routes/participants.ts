import { Express } from "express";
import { prisma } from "../prisma";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";
import { emailRegex, ErrorCode, UserError } from "../types";
import {
  decodeToken,
  getAge,
  upload,
  s3,
  bucketParams,
  getExtension,
  uploadObject,
  deleteObject,
} from "../helpers";

export const participantRoutes = (app: Express) => {
  app.post(
    "/participant",
    upload.fields([
      { name: "headshot", maxCount: 1 },
      { name: "photoId", maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const { name, dob, phoneNumber, email, parentEmail } = req.body;
        const headshot = req.files["headshot"][0];
        const photoId = req.files["photoId"][0];
        const authHeader = req.headers.authorization;
        const { userId } = decodeToken(authHeader!);
        if (name === "") {
          throw Error("noName");
        }
        if (phoneNumber === "") {
          throw Error("noPhoneNumber");
        }
        console.log(emailRegex.test(email));
        if (emailRegex.test(email) === false) {
          throw Error("invalidEmail");
        }

        const formattedDob = dob.split("-").join("/");

        const age = getAge(formattedDob);
        if (age < 18 && !parentEmail) {
          throw Error("noParentEmail");
        } else if (age < 18 && emailRegex.test(parentEmail) === false) {
          throw Error("invalidParentEmail");
        }

        const participant = await prisma.participant.create({
          data: {
            name,
            dob: new Date(formattedDob),
            userId,
            phoneNumber,
            email,
            parentEmail,
          },
          include: {
            User: true,
          },
        });

        await uploadObject(
          `${participant.id}-headshot.${getExtension(headshot)}`,
          headshot.buffer
        );
        await uploadObject(
          `${participant.id}-photoId.${getExtension(photoId)}`,
          photoId.buffer
        );

        res.status(201).json(participant);
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          if (
            e.code === "P2002" &&
            e.meta?.target === "Participant_name_userId_key"
          ) {
            const error: UserError = {
              code: ErrorCode.PARTICIPANT_EXISTS_FOR_USER,
              message: `Participant already exists on User`,
            };
            res.status(401).json(error);
            return;
          }
        } else if (e instanceof PrismaClientValidationError) {
          const error: UserError = {
            code: ErrorCode.PARTICIPANT_MISSING_FIELD,
            message: e.message,
          };
          res.status(401).json(error);
          return;
        } else if (e.message === "noName") {
          const error: UserError = {
            code: ErrorCode.PARTICIPANT_MISSING_FIELD,
            message: "name missing from participant",
          };
          res.status(401).json(error);
        } else if (e.message === "noPhoneNumber") {
          const error: UserError = {
            code: ErrorCode.PARTICIPANT_MISSING_FIELD,
            message: "phone number missing from participant",
          };
          res.status(401).json(error);
        } else if (e.message === "noParentEmail") {
          const error: UserError = {
            code: ErrorCode.PARTICIPANT_MISSING_PARENT_EMAIL,
            message: "You are under 18, please provide a parent email",
          };
          res.status(401).json(error);
        } else if (e.message === "Invalid Token") {
          const error: UserError = {
            code: ErrorCode.INVALID_TOKEN,
            message: "Invalid Token",
          };
          res.status(401).json(error);
        } else if (e.message === "invalidEmail") {
          const error: UserError = {
            code: ErrorCode.PARTICIPANT_INVALID_EMAIL,
            message: "Invalid email",
          };
          res.status(401).json(error);
        } else if (e.message === "invalidParentEmail") {
          const error: UserError = {
            code: ErrorCode.PARTICIPANT_INVALID_PARENT_EMAIL,
            message: "Invalid parent email",
          };
          res.status(401).json(error);
        } else if (e.message === "uploadError") {
          const error: UserError = {
            code: ErrorCode.AWS_S3_UPLOAD_ERROR,
            message: "Error uploading files",
          };
          res.status(401).json(error);
        } else {
          console.log(e);
          res.status(401).json({ error: e.message });
          return;
        }
      }
    }
  );

  app.get("/participants", async (req, res) => {
    const authHeader = req.headers.authorization;
    const { userId } = decodeToken(authHeader);
    const participants = await prisma.participant.findMany({
      where: {
        userId,
      },
    });
    res.status(200).json(participants);
  });

  app.get("/participant/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader);
      const participantId = req.params.id;
      const participant = await prisma.participant.findFirst({
        where: {
          id: parseInt(participantId),
          userId: userId,
        },
      });
      if (!participant) {
        throw Error("noParticipant");
      }
      res.json(participant);
    } catch (e) {
      if (e.message === "noParticipant") {
        const error: UserError = {
          code: ErrorCode.PARTICIPANT_NOT_FOUND,
          message: "Participant not found for user",
        };
        res.status(401).json(error);
      } else {
        console.log(e);
        res.status(401).json({ error: e.message });
      }
    }
  });

  app.put(
    "/participant/:id",
    upload.fields([
      { name: "headshot", maxCount: 1 },
      { name: "photoId", maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const authHeader = req.headers.authorization;
        const { userId } = decodeToken(authHeader);
        const participantId = req.params.id;
        const { name, dob, phoneNumber, email, parentEmail } = req.body;
        const age = getAge(dob);
        if (age < 18 && parentEmail != null && parentEmail.length === 0) {
          throw Error("noParentEmail");
        }

        console.log("req.files", req.files);

        const headshot = req.files["headshot"]?.[0];
        const photoId = req.files["photoId"]?.[0];

        if (headshot) {
          console.log("headshot", headshot);
          await uploadObject(
            `${participantId}-headshot.${getExtension(headshot)}`,
            headshot.buffer
          );
        }

        if (photoId) {
          await uploadObject(
            `${participantId}-photoId.${getExtension(photoId)}`,
            photoId.buffer
          );
        }

        const participant = await prisma.participant.update({
          where: {
            id: parseInt(participantId),
            userId: userId,
          },
          data: {
            name,
            dob,
            phoneNumber,
            email,
            parentEmail,
          },
        });
        res.json(participant);
      } catch (e) {
        if (e.message === "noParentEmail") {
          const error: UserError = {
            code: ErrorCode.PARTICIPANT_MISSING_PARENT_EMAIL,
            message: "You are under 18, please provide a parent email",
          };
          res.status(401).json(error);
        } else if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === "P2025") {
            const error: UserError = {
              code: ErrorCode.PARTICIPANT_NOT_FOUND,
              message: "Participant not found for user",
            };
            res.status(401).json(error);
            return;
          }
        } else {
          console.log(e);
          res.status(401).json({ error: e.message });
        }
      }
    }
  );

  app.delete("/participant/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader);
      const participantId = req.params.id;

      await deleteObject(`${participantId}-headshot`);
      await deleteObject(`${participantId}-photoId`);

      const participant = await prisma.participant.delete({
        where: {
          id: parseInt(participantId),
          userId: userId,
        },
      });
      res.json(participant);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          const error: UserError = {
            code: ErrorCode.PARTICIPANT_NOT_FOUND,
            message: "Participant not found for user",
          };
          res.status(401).json(error);
          return;
        }
      } else {
        console.log(e);
        res.status(401).json({ error: e.message });
      }
    }
  });
};
