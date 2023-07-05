import { Express } from "express";
import { prisma } from "../prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { ErrorCode, UserError } from "../types";
import { decodeToken, getExtension } from "../helpers";
import { s3, bucketParams, upload } from "../helpers";
import { TeamManager } from "@prisma/client";

export const teamManagerRoutes = (app: Express) => {
  app.post("/team-manager", upload.single("headshot"), async (req, res) => {
    try {
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
      const dateDob = new Date(dob);
      let tm: TeamManager | null = null;
      s3.upload(
        {
          ...bucketParams,
          Body: headshot.buffer,
          Key: `${firstName}-${lastName}-TM-HEADSHOT.${getExtension(headshot)}`,
        },
        async (err, data) => {
          if (err) {
            throw new Error("awsS3UploadError");
          }
          try {
            tm = await prisma.teamManager.create({
              data: {
                firstName,
                lastName,
                dob: dateDob,
                headshot: data.Key,
                userId,
              },
            });
            res.status(201).send(tm);
          } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
              if (error.code === "P2002") {
                const error: UserError = {
                  code: ErrorCode.TEAM_MANAGER_ALREADY_EXISTS,
                  message: "Team manager already exists",
                };
                res.status(400).send(error);
              }
            }
          }
        }
      );
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
      let key = "";
      if (headshot) {
        s3.upload(
          {
            ...bucketParams,
            Body: headshot.buffer,
            Key: `${firstName}-${lastName}-TM-HEADSHOT.${getExtension(
              headshot
            )}`,
          },
          async (err, data) => {
            try {
              if (err) {
                throw new Error("awsS3UploadError");
              }
              console.log(data);
              key = data.Key;
              dataToUpdate["headshot"] = key;
              const tm = await prisma.teamManager.update({
                where: {
                  userId,
                },
                data: dataToUpdate,
              });
              res.status(200).send(tm);
            } catch (error) {
              if (error.message === "awsS3UploadError") {
                const error: UserError = {
                  code: ErrorCode.AWS_S3_UPLOAD_ERROR,
                  message:
                    "There was an error uploading the headshot to AWS S3",
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
          }
        );
      } else {
        const tm = await prisma.teamManager.update({
          where: {
            userId,
          },
          data: dataToUpdate,
        });
        res.status(200).send(tm);
      }
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

  app.delete("/team-manager", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader);
      const tm = await prisma.teamManager.delete({
        where: {
          userId,
        },
      });
      s3.deleteObject({ ...bucketParams, Key: tm.headshot }, (err, data) => {
        if (err) {
          console.log(err);
          throw new Error("awsS3DeleteError");
        }
      });
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
