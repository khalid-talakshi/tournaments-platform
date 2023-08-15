import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { prisma } from "../prisma/client";
import request from "supertest";
import app from "../app";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ErrorCode } from "../types";

let userId: number;

describe("Register Test", () => {
  it("returns a 200 status code when unique user is provided", async () => {
    const response = await request(app).post("/register").send({
      username: "testUnique",
      password: "test",
    });
    expect(response.statusCode).toBe(200);
    const token = response.body.token;
    const payload = jwt.verify(token, <string>process.env.APP_SECRET) as {
      userId: number;
      permission: string;
    };
    expect(payload.permission).toBe("USER");
    userId = payload.userId;
  });

  it("returns an error when trying to use a username that already exists", async () => {
    const response = await request(app).post("/register").send({
      username: "testUnique",
      password: "test",
    });
    expect(response.statusCode).toBe(401);
    expect(response.body).toStrictEqual({
      message: "username already taken",
      code: ErrorCode.USER_ALREADY_EXISTS,
    });
  });
});

afterAll(async () => {
  await prisma.user.delete({
    where: {
      id: userId,
    },
  });
});
