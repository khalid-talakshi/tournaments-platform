import { Express } from "express";
import { prisma } from "../prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { ErrorCode, UserError } from "../types";
import {
  decodeToken,
  getExtension,
  uploadObject,
  upload,
  deleteObject,
} from "../helpers";

export const teamManagerRoutes = (app: Express) => {
  app.post("/team-manager", upload.single("headshot"), async (req, res) => {
    const authHeader = req.headers.authorization;
    const headshot = req.file;
    const { userId } = decodeToken(authHeader);
    const { firstName, lastName, dob } = req.body;
    if (!firstName) {
      throw new Error("noFirstName");
    } else if (!lastName) {
      throw new Error("noLastName");
    } else if (!dob) {
      throw new Error("noDOB");
    }
    const dateDob = new Date(dob.split("-").join("/"));

    try {
      const tm = await prisma.teamManager.create({
        data: {
          firstName,
          lastName,
          dob: dateDob,
          userId,
        },
      });

      const extension = getExtension(headshot);
      const key = `${tm.id}-tm-headshot.${extension}`;
      await uploadObject(key, headshot.buffer);

      const updatedTM = await prisma.teamManager.update({
        where: {
          id: tm.id,
        },
        data: {
          headshot: key,
        },
      });
      res.status(201).send(updatedTM);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const error: UserError = {
            code: ErrorCode.TEAM_MANAGER_ALREADY_EXISTS,
            message: "Team manager already exists",
          };
          res.status(400).send(error);
        }
      } else if (error.message === "noFirstName") {
        const error: UserError = {
          code: ErrorCode.TM_INVALID_FIRST_NAME,
          message: "First name is required and cannot be empty",
        };
        res.status(400).send(error);
      } else if (error.message === "noLastName") {
        const error: UserError = {
          code: ErrorCode.TM_INVALID_LAST_NAME,
          message: "Last name is required and cannot be empty",
        };
        res.status(400).send(error);
      } else if (error.message === "noDOB") {
        const error: UserError = {
          code: ErrorCode.TM_INVALID_DOB,
          message: "Date of birth is required and cannot be empty",
        };
        res.status(400).send(error);
      } else if (error.message === "awsS3UploadError") {
        const error: UserError = {
          code: ErrorCode.AWS_S3_UPLOAD_ERROR,
          message: "There was an error uploading the headshot to AWS S3",
        };
        res.status(400).send(error);
      } else {
        res.status(400).send({ message: error.message } as UserError);
      }
    }
  });

  app.get("/team-manager", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader);
      const tm = await prisma.teamManager.findUnique({
        where: {
          userId,
        },
      });
      res.status(200).send(tm || {});
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  });

  app.put("/team-manager", upload.single("headshot"), async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader);
      const { firstName, lastName, dob } = req.body;
      const headshot = req.file;
      const dataToUpdate = {};
      if (firstName) {
        dataToUpdate["firstName"] = firstName;
      }
      if (lastName) {
        dataToUpdate["lastName"] = lastName;
      }
      if (dob) {
        dataToUpdate["dob"] = new Date(dob);
      }
      if (headshot) {
        console.log("uplaoding new headshot");
        const extension = getExtension(headshot);
        const key = `${userId}-tm-headshot.${extension}`;
        await uploadObject(key, headshot.buffer);
      }

      const tm = await prisma.teamManager.update({
        where: {
          userId,
        },
        data: dataToUpdate,
      });

      res.json(tm);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          const error: UserError = {
            code: ErrorCode.TEAM_MANAGER_DOES_NOT_EXIST,
            message: "Team manager does not exist",
          };
          res.status(400).send(error);
        }
      } else if (error.message === "awsS3UploadError") {
        const error: UserError = {
          code: ErrorCode.AWS_S3_UPLOAD_ERROR,
          message: "There was an error uploading the headshot to AWS S3",
        };
        res.status(400).send(error);
      } else if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          const error: UserError = {
            code: ErrorCode.TEAM_MANAGER_DOES_NOT_EXIST,
            message: "Team manager does not exist",
          };
          res.status(400).send(error);
        }
      } else {
        res.status(400).send({ message: error.message } as UserError);
      }
    }
  });

  app.delete("/team-manager", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader);

      const tm = await prisma.teamManager.delete({
        where: {
          userId,
        },
      });

      await deleteObject(tm.headshot);

      res.status(200).send(tm);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          const error: UserError = {
            code: ErrorCode.TEAM_MANAGER_DOES_NOT_EXIST,
            message: "Team manager does not exist",
          };
          res.status(400).send(error);
        }
      } else {
        res.status(400).send({ message: error.message });
      }
    }
  });
};
