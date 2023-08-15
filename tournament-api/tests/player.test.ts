import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { prisma } from "../prisma/client";
import request from "supertest";
import app from "../app";
import bcrypt from "bcryptjs";
import { ErrorCode } from "../types";

describe("Player", () => {
  let userId: number;
  let token: string;

  beforeAll(async () => {
    const testUser = await prisma.user.create({
      data: {
        username: "playerTest",
        password: await bcrypt.hash("password", 10),
        permission: "USER",
      },
    });

    userId = testUser.id;

    const response = await request(app).post("/login").send({
      username: "playerTest",
      password: "password",
    });

    token = response.body.token;
  });

  describe("POST /players", () => {
    let participantId: number;
    let otherUserId: number;
    let otherParticipantId: number;
    beforeAll(async () => {
      const testParticipant = await prisma.participant.create({
        data: {
          userId: userId,
          name: "Test Participant",
          dob: new Date("2000-06-19"),
          phoneNumber: "1234567890",
          email: "test@test.com",
        },
      });
      participantId = testParticipant.id;

      const otherUser = await prisma.user.create({
        data: {
          username: "otherUser",
          password: await bcrypt.hash("password", 10),
          permission: "USER",
        },
      });

      otherUserId = otherUser.id;

      const otherParticipant = await prisma.participant.create({
        data: {
          userId: otherUserId,
          name: "Other Participant",
          dob: new Date("2000-06-19"),
          phoneNumber: "1234567890",
          email: "test@test.com",
        },
      });

      otherParticipantId = otherParticipant.id;
    });

    it("should create a new player", async () => {
      const response = await request(app)
        .post("/players")
        .set("Authorization", `Bearer ${token}`)
        .send({
          participantId: participantId,
        });
    });

    it('should return an error if "participantId" is not provided', async () => {
      const response = await request(app)
        .post("/players")
        .set("Authorization", `Bearer ${token}`)
        .send({
          participantId: null,
        });
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ErrorCode.MISSING_PLAYER_PARTICIPANT_ID);
    });

    it("should return an error if participant does not belong to user", async () => {
      const response = await request(app)
        .post("/players")
        .set("Authorization", `Bearer ${token}`)
        .send({
          participantId: 1,
        });
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(ErrorCode.INVALID_PLAYER_PARTICIPANT_ID);
    });

    afterAll(async () => {
      await prisma.player.deleteMany({
        where: {
          participantId: participantId,
        },
      });

      await prisma.participant.delete({
        where: {
          id: participantId,
        },
      });

      await prisma.player.deleteMany({
        where: {
          participantId: otherParticipantId,
        },
      });

      await prisma.participant.delete({
        where: {
          id: otherParticipantId,
        },
      });

      await prisma.user.delete({
        where: {
          id: otherUserId,
        },
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
});
