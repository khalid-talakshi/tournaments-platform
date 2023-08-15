import { Express } from "express";
import { prisma } from "../prisma";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";
import { emailRegex, ErrorCode, UserError } from "../types";
import { decodeToken, getAge, getObjectByKey } from "../helpers";
import bcrypt from "bcryptjs";

export const imageRoutes = (app: Express) => {
  app.get("/image/:key", async (req, res) => {
    const { key } = req.params;
    try {
      const image = await getObjectByKey(key);
      res.status(200).json(image);
    } catch (e) {
      res.status(401).json({ error: e.message });
    }
  });
};
