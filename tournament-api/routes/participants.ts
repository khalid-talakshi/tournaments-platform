import { Express } from "express";
import { prisma } from "../prisma";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";
import { emailRegex, ErrorCode, UserError, VerificationStatus } from "../types";
import {
  decodeToken,
  getAge,
  upload,
  getExtension,
  uploadObject,
  deleteObject,
} from "../helpers";
import { authenticateAdmin } from "../middleware";

export const participantRoutes = (app: Express) => {
  app.post(
    "/participant",
    upload.fields([
      { name: "headshot", maxCount: 1 },
      { name: "photoId", maxCount: 1 },
      { name: "waiver", maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const { name, dob, phoneNumber, email, parentEmail, gender } = req.body;
        const headshot = req.files["headshot"][0];
        const photoId = req.files["photoId"][0];
        const waiver = req.files["waiver"][0];
        const authHeader = req.headers.authorization;
        const { userId } = decodeToken(authHeader!);
        if (name === "") {
          throw Error("noName");
        }
        console.log("phoneNumber", phoneNumber);
        if (phoneNumber && phoneNumber === "") {
          throw Error("noPhoneNumber");
        }
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
            phoneNumber: phoneNumber || null,
            email,
            parentEmail,
            gender,
            User: {
              connect: {
                id: userId,
              },
            },
          },
        });

        console.log("created participant");

        const headshotKey = `${participant.id}-headshot.${getExtension(
          headshot
        )}`;
        const photoIdKey = `${participant.id}-photoId.${getExtension(photoId)}`;
        const waiverKey = `${participant.id}-waiver.${getExtension(waiver)}`;

        await uploadObject(headshotKey, headshot.buffer);
        await uploadObject(photoIdKey, photoId.buffer);
        await uploadObject(waiverKey, waiver.buffer);

        const verificationEntry = await prisma.verification.create({
          data: {
            participantId: participant.id,
            status: VerificationStatus.PENDING,
          },
        });

        const updatedParticipant = await prisma.participant.update({
          where: {
            id: participant.id,
          },
          data: {
            headshotKey: headshotKey,
            photoIdKey: photoIdKey,
            waiverKey: waiverKey,
            verificationId: verificationEntry.id,
          },
          include: {
            User: true,
          },
        });

        res.status(201).json(updatedParticipant);
      } catch (e) {
        console.log(e);
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
    const { includeVerification } = req.query;
    const { userId } = decodeToken(authHeader);
    const participants = await prisma.participant.findMany({
      where: {
        userId,
      },
      include: {
        Verification: includeVerification === "true",
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
      { name: "waiver", maxCount: 1 },
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

        const dataToUpdate: any = {};

        console.log("req.files", req.files);

        const headshot = req.files["headshot"]?.[0];
        const photoId = req.files["photoId"]?.[0];
        const waiver = req.files["waiver"]?.[0];

        if (name) {
          dataToUpdate["name"] = name;
        }

        if (dob) {
          dataToUpdate["dob"] = new Date(dob);
        }

        if (phoneNumber) {
          dataToUpdate["phoneNumber"] = phoneNumber;
        }

        if (email) {
          dataToUpdate["email"] = email;
        }

        if (parentEmail) {
          dataToUpdate["parentEmail"] = parentEmail;
        }

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

        if (waiver) {
          await uploadObject(
            `${participantId}-waiver.${getExtension(waiver)}`,
            waiver.buffer
          );
        }

        const participant = await prisma.participant.update({
          where: {
            id: parseInt(participantId),
          },
          data: {
            ...dataToUpdate,
            VerificationStatus: {
              update: {
                status: VerificationStatus.PENDING,
              },
            },
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
      const participantId = parseInt(req.params.id);

      let participant = await prisma.participant.findUnique({
        where: {
          id: participantId,
        },
      });

      if (!participant) {
        throw Error("noParticipant");
      }

      if (participant.userId !== userId) {
        throw Error("notAuthorized");
      }

      participant = await prisma.participant.delete({
        where: {
          id: participantId,
        },
      });

      await deleteObject(participant.headshotKey);
      await deleteObject(participant.photoIdKey);
      await deleteObject(participant.waiverKey);
      res.status(200).send(participant);
    } catch (e) {
      console.log(e);
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          const error: UserError = {
            code: ErrorCode.PARTICIPANT_NOT_FOUND,
            message: "Participant not found for user",
          };
          res.status(401).json(error);
          return;
        } else {
          console.log(e);
          res.status(401).json({ error: e.message });
        }
      } else {
        console.log(e);
        res.status(401).json({ error: e.message });
      }
    }
  });

  app.get("/participant/:id/players", async (req, res) => {
    try {
      const participantId = parseInt(req.params.id);
      const players = await prisma.participant.findUnique({
        where: {
          id: participantId,
        },
        select: {
          Players: true,
        },
      });
      res.status(200).json(players.Players);
    } catch (e) {
      console.log(e);
      res.status(401).json({ error: e.message });
    }
  });

  app.get("/participant/:id/coaches", async (req, res) => {
    try {
      const participantId = parseInt(req.params.id);
      const coaches = await prisma.participant.findUnique({
        where: {
          id: participantId,
        },
        select: {
          Coaches: true,
        },
      });
      res.status(200).json(coaches.Coaches);
    } catch (e) {
      console.log(e);
      res.status(401).json({ error: e.message });
    }
  });

  app.put("/participant/:id/verify", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const participantId = parseInt(id);
      const verification = await prisma.verification.update({
        where: {
          participantId,
        },
        data: {
          status,
          reason,
        },
      });
      res.status(200).json(verification);
    } catch (e) {
      console.log(e);
      res.json({ error: e.message });
    }
  });

  app.get("/participants/all", authenticateAdmin, async (req, res) => {
    const { verified, pending, denied } = req.query;

    const verificationFilters = [];

    if (verified === "true") {
      verificationFilters.push(VerificationStatus.VERIFIED);
    }

    if (pending === "true") {
      verificationFilters.push(VerificationStatus.PENDING);
    }

    if (denied === "true") {
      verificationFilters.push(VerificationStatus.DENIED);
    }

    const participants = await prisma.participant.findMany({
      select: {
        id: true,
        name: true,
        Verification: { select: { status: true } },
        updatedAt: true,
      },
      where: {
        Verification: {
          status: {
            in: verificationFilters,
          },
        },
      },
    });
    res.status(200).json(participants);
  });

  app.get("/admin/participant/:id", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const participantId = parseInt(id);
    const participant = await prisma.participant.findUnique({
      where: {
        id: participantId,
      },
      include: {
        Verification: true,
      },
    });
    res.status(200).json(participant);
  });

  app.get(
    "/admin/participant/:id/attachments",
    authenticateAdmin,
    async (req, res) => {
      const { id } = req.params;
      const participantId = parseInt(id);
      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId,
        },
      });
      // attachments for now will be photoId and waiver
      const attachmentKeys = [
        { name: "Photo ID", key: participant.photoIdKey },
        { name: "Waiver", key: participant.waiverKey },
      ];

      return res.status(200).json(attachmentKeys);
    }
  );
};
