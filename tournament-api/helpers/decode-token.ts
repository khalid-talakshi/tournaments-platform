import { UserTokenPayload } from "../types";
import jwt from "jsonwebtoken";

export const decodeToken = (authHeader: string): UserTokenPayload => {
  try {
    const token = authHeader.replace("Bearer ", "");
    return jwt.verify(token, process.env.APP_SECRET) as UserTokenPayload;
  } catch (e) {
    throw Error("Invalid token");
  }
};
