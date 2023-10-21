import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nonSecurePaths = [
      "/login",
      "/register",
      "/parse-data",
      "/health-check",
    ];
    if (nonSecurePaths.includes(req.path)) return next();
    const appSecret = process.env.APP_SECRET;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      if (token) {
        try {
          const { permission } = jwt.verify(token, appSecret) as any;
          if (
            permission === "ADMIN" ||
            permission === "VOLUNTEER" ||
            permission === "USER"
          ) {
            next();
          } else {
            res.status(401).json({ error: "Invalid Permission" });
          }
        } catch (err) {
          console.log(err);
          res.status(401).json({ error: "Not authorized" });
        }
      } else {
        res.status(401);
      }
    } else {
      res.status(401).json({ error: "No Token Provided" });
    }
  } catch (e) {
    res.send(401).json({ error: e.message });
  }
};
