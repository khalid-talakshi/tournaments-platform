import { Express } from "express";
import { prisma } from "../prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ErrorCode, UserError, UserTokenPayload } from "../types";

export const loginRoutes = (app: Express) => {
  app.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await prisma.user.findUnique({
        where: {
          username: username,
        },
      });
      if (!user) {
        res.status(401).json({
          message: "No User Found",
          code: ErrorCode.NO_USER_FOUND,
        } as UserError);
        return;
      }
      const valid = await bcrypt.compare(password, user!.password!);
      if (!valid) {
        res.status(401).json({
          message: "Invalid password",
          code: ErrorCode.INVALID_PASSWORD,
        } as UserError);
        return;
      }
      const token = jwt.sign(
        { userId: user.id, permission: user.permission },
        <string>process.env.APP_SECRET
      );
      res.status(200).json({ token });
    } catch (e) {
      console.log(e);
      res.status(401).json({ error: e.message });
    }
  });

  app.post("/admin/verify", async (req, res) => {
    try {
      const { token } = req.body;
      const { permission } = jwt.verify(
        token,
        <string>process.env.APP_SECRET
      ) as UserTokenPayload;
      if (permission !== "ADMIN") {
        throw Error("No Admin Permissions");
      }
      res.status(200).json({ verified: true });
    } catch (e) {
      console.log(e);
      res.status(401).json({ error: e.message });
    }
  });
};
