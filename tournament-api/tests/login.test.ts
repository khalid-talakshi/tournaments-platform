import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { prisma } from "../prisma/client";
import request from "supertest";
import app from "../app";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ErrorCode } from "../types";

let userId: number;

beforeAll(async () => {
  let user = await prisma.user.findUnique({
    where: {
      username: "test",
    },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: "test",
        password: bcrypt.hashSync("test", 10),
        permission: "ADMIN",
      },
    });
  }
  userId = user.id;
});

describe("Login Test", () => {
  it("returns a 200 status code when correct credentials are provided", async () => {
    const response = await request(app).post("/login").send({
      username: "test",
      password: "test",
    });
    expect(response.statusCode).toBe(200);
  });

  it("retrusn a 401 status code when incorrect username is provided", async () => {
    const response = await request(app).post("/login").send({
      username: "tst",
      password: "test",
    });
    expect(response.statusCode).toBe(401);
    expect(response.body.code).toBe(ErrorCode.NO_USER_FOUND);
    expect(response.body.message).toBe("No User Found");
  });

  it("retrusn a 401 status code when incorrect password is provided", async () => {
    const response = await request(app).post("/login").send({
      username: "test",
      password: "tst",
    });
    expect(response.statusCode).toBe(401);
    expect(response.body.code).toBe(ErrorCode.INVALID_PASSWORD);
    expect(response.body.message).toBe("Invalid password");
  });

  it("constructs a payload with the right fields when login is successful", async () => {
    const response = await request(app).post("/login").send({
      username: "test",
      password: "test",
    });
    expect(response.statusCode).toBe(200);
    const token = response.body.token;
    const payload = jwt.verify(token, <string>process.env.APP_SECRET) as {
      userId: number;
      permission: string;
    };
    expect(payload.userId).toBe(userId);
    expect(payload.permission).toBe("ADMIN");
  });
});

afterAll(async () => {
  await prisma.user.delete({
    where: {
      id: userId,
    },
  });
});
