import { Express } from "express";
import { prisma } from "../prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ErrorCode, UserError } from "../types";

export const registerRoutes = (app: Express) => {
  app.post("/register", async (req, res) => {
    try {
      const username = req.body.username;
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const existingUser = await prisma.user.findUnique({
        where: {
          username: username,
        },
      });
      if (existingUser) {
        res
          .status(401)
          .json({
            message: "username already taken",
            code: ErrorCode.USER_ALREADY_EXISTS,
          } as UserError);
        return;
      }
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          permission: "USER",
        },
      });
      const token = jwt.sign(
        { userId: user.id, permission: user.permission },
        <string>process.env.APP_SECRET
      );
      res.status(200).json({ token });
      return;
    } catch (e) {
      console.log(e);
      res.status(401).json({ error: e.message });
      return;
    }
  });
};
