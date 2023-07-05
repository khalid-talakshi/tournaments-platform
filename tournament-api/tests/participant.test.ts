import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { prisma } from "../prisma/client";
import request from "supertest";
import app from "../app";
import bcrypt from "bcryptjs";
import { ErrorCode } from "../types";

let token: string;
let userId: number;

describe("Participant", () => {
  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        username: "participantTest",
        password: bcrypt.hashSync("participantPassword", 10),
        permission: "USER",
      },
    });
    const response = await request(app).post("/login").send({
      username: "participantTest",
      password: "participantPassword",
    });
    token = response.body.token;
    userId = user.id;
  });

  describe("POST /participant", () => {
    it("expect participant to be returned when created", async () => {
      const date = new Date(2000, 5, 19, 0);
      const response = await request(app)
        .post("/participant")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Participant",
          dob: date,
          email: "test@test.com",
          phoneNumber: "123-456-7890",
        });
      const body = response.body;
      expect(body.name).toBe("Test Participant");
      expect(body.dob).toBe("2000-06-19T00:00:00.000Z");
      expect(body.User.id).toBe(userId);
    });

    it("returns an error when the unique constraint fails on [userId, name]", async () => {
      const date = new Date(2001, 6, 14, 0);
      const response = await request(app)
        .post("/participant")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Participant",
          dob: date,
          email: "test@test.com",
          phoneNumber: "123-456-7890",
        });
      const body = response.body;
      expect(response.statusCode).toBe(401);
      expect(body.code).toBe(ErrorCode.PARTICIPANT_EXISTS_FOR_USER);
      expect(body.message).toBe("Participant already exists on User");
    });

    it("returns a PARTICIPANT_MISSING_FIELD error when no name is provided", async () => {
      const date = new Date(2001, 6, 14, 0);
      const response = await request(app)
        .post("/participant")
        .set("Authorization", `Bearer ${token}`)
        .send({
          dob: date,
          email: "test@test.com",
          phoneNumber: "123-456-7890",
        });
      const body = response.body;
      expect(response.statusCode).toBe(401);
      expect(body.code).toBe(ErrorCode.PARTICIPANT_MISSING_FIELD);
    });

    it("returns a PARTICIPANT_MISSING_FIELD error when name is empty", async () => {
      const date = new Date(2001, 6, 14, 0);
      const response = await request(app)
        .post("/participant")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "",
          dob: date,
          email: "test@test.com",
          phoneNumber: "123-456-7890",
        });
      const body = response.body;
      expect(response.statusCode).toBe(401);
      expect(body.code).toBe(ErrorCode.PARTICIPANT_MISSING_FIELD);
    });

    it("returns a PARTICIPANT_MISSING_FIELD error when no phone number is provided", async () => {
      const date = new Date(2001, 6, 14, 0);
      const response = await request(app)
        .post("/participant")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Participant 2",
          dob: date,
          email: "test@test.com",
        });
      const body = response.body;
      expect(response.statusCode).toBe(401);
      expect(body.code).toBe(ErrorCode.PARTICIPANT_MISSING_FIELD);
    });

    it("returns a PARTICIPANT_MISSING_FIELD error when phone number is empty", async () => {
      const date = new Date(2001, 6, 14, 0);
      const response = await request(app)
        .post("/participant")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Participant 3",
          dob: date,
          phoneNumber: "",
          email: "test@test.com",
        });
      const body = response.body;
      expect(response.statusCode).toBe(401);
      expect(body.code).toBe(ErrorCode.PARTICIPANT_MISSING_FIELD);
    });

    it("returns a PARTICIPANT_MISSING_FIELD error when no date of birthday is provided", async () => {
      const date = new Date(2001, 6, 14, 0);
      const response = await request(app)
        .post("/participant")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Participant 3",
          phoneNumber: "123-456-7890",
          email: "test@test.com",
        });
      const body = response.body;
      expect(response.statusCode).toBe(401);
      expect(body.code).toBe(ErrorCode.PARTICIPANT_MISSING_FIELD);
    });

    it("returns a PARTICIPANT_MISSING_FIELD error when birthday is empty", async () => {
      const date = new Date(2001, 6, 14, 0);
      const response = await request(app)
        .post("/participant")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Participant 3",
          phoneNumber: "123-456-7890",
          email: "test@test.com",
          dob: "",
        });
      const body = response.body;
      expect(response.statusCode).toBe(401);
      expect(body.code).toBe(ErrorCode.PARTICIPANT_MISSING_FIELD);
    });

    it("returns a PARTICIPANT_INVALID_EMAIL error when no email is provided", async () => {
      const date = new Date(2001, 6, 14, 0);
      const response = await request(app)
        .post("/participant")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Participant 3",
          phoneNumber: "123-456-7890",
          dob: date,
        });
      const body = response.body;
      expect(response.statusCode).toBe(401);
      expect(body.code).toBe(ErrorCode.PARTICIPANT_INVALID_EMAIL);
    });

    it("returns a PARTICIPANT_INVALID_EMAIL error when email is empty", async () => {
      const date = new Date(2001, 6, 14, 0);
      const response = await request(app)
        .post("/participant")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Participant 3",
          phoneNumber: "123-456-7890",
          dob: date,
          email: "",
        });
      const body = response.body;
      expect(response.statusCode).toBe(401);
      expect(body.code).toBe(ErrorCode.PARTICIPANT_INVALID_EMAIL);
    });

    it("returns a PARTICIPANT_MISSING_PARENT_EMAIL error when no parent email is provided for participant under 18", async () => {
      const date = new Date(2007, 6, 14, 0);
      const response = await request(app)
        .post("/participant")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Participant 3",
          phoneNumber: "123-456-7890",
          dob: date,
          email: "test@test.com",
        });
      const body = response.body;
      expect(response.statusCode).toBe(401);
      expect(body.code).toBe(ErrorCode.PARTICIPANT_MISSING_PARENT_EMAIL);
    });

    it("returns a PARTICIPANT_MALFORMED_EMAIL when the email is not formed correctly", async () => {
      const date = new Date(2001, 6, 14, 0);
      const response = await request(app)
        .post("/participant")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Participant 3",
          phoneNumber: "123-456-7890",
          dob: date,
          email: "test",
        });
      const body = response.body;
      expect(response.statusCode).toBe(401);
      expect(body.code).toBe(ErrorCode.PARTICIPANT_INVALID_EMAIL);
    });

    it("returns a PARTICIPANT_INVALID_PARENT_EMAIL when the email is not formed correctly", async () => {
      const date = new Date(2008, 6, 14, 0);
      const response = await request(app)
        .post("/participant")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Participant 3",
          phoneNumber: "123-456-7890",
          dob: date,
          email: "test@test.com",
          parentEmail: "test",
        });
      const body = response.body;
      expect(response.statusCode).toBe(401);
      expect(body.code).toBe(ErrorCode.PARTICIPANT_INVALID_PARENT_EMAIL);
    });
  });

  describe("GET /participants", () => {
    beforeAll(async () => {
      await prisma.participant.deleteMany({
        where: {
          userId: userId,
        },
      });
      await prisma.participant.createMany({
        data: [
          {
            name: "Test Participant 1",
            dob: new Date(2001, 6, 14, 0),
            email: "test1@test.com",
            phoneNumber: "123-456-7890",
            userId: userId,
          },
          {
            name: "Test Participant 2",
            dob: new Date(2001, 6, 14, 0),
            email: "test1@test.com",
            phoneNumber: "123-456-7890",
            userId: userId,
          },
          {
            name: "Test Participant 3",
            dob: new Date(2001, 6, 14, 0),
            email: "test1@test.com",
            phoneNumber: "123-456-7890",
            userId: userId,
          },
        ],
      });
    });

    it("returns all participants for a given user", async () => {
      const response = await request(app)
        .get("/participants")
        .set("Authorization", `Bearer ${token}`);
      const body = response.body;
      expect(response.statusCode).toBe(200);
      expect(body.length).toBe(3);
    });
  });

  describe("GET /participant/:id", () => {
    let participantId: number;
    let otherParticipantId: number;
    let otherUserId: number;

    beforeAll(async () => {
      const otherUser = await prisma.user.create({
        data: {
          username: "participantIdTest",
          password: bcrypt.hashSync("participantPassword", 10),
          permission: "USER",
        },
      });

      otherUserId = otherUser.id;

      const otherUserParticipant = await prisma.participant.create({
        data: {
          name: "Not logged in user's participant",
          dob: new Date(2001, 6, 14, 0),
          email: "test@test.com",
          phoneNumber: "123-456-7890",
          userId: otherUserId,
        },
      });

      const participantIdTestParticipant = await prisma.participant.create({
        data: {
          name: "Logged in user's participant",
          dob: new Date(2001, 6, 14, 0),
          email: "test@test.com",
          phoneNumber: "123-456-7890",
          userId: userId,
        },
      });

      otherParticipantId = otherUserParticipant.id;
      participantId = participantIdTestParticipant.id;
    });

    it("returns a participant for a given id if the participant belongs to the logged in user", async () => {
      const response = await request(app)
        .get(`/participant/${participantId}`)
        .set("Authorization", `Bearer ${token}`);
      const body = response.body;
      expect(response.statusCode).toBe(200);
      expect(body.id).toBe(participantId);
    });

    it("returns a 401 error if the participant does not belong to the logged in user", async () => {
      const response = await request(app)
        .get(`/participant/${otherParticipantId}`)
        .set("Authorization", `Bearer ${token}`);
      const body = response.body;
      expect(response.statusCode).toBe(401);
      expect(body.code).toBe(ErrorCode.PARTICIPANT_NOT_FOUND);
    });

    afterAll(async () => {
      await prisma.participant.deleteMany({
        where: {
          userId: otherUserId,
        },
      });

      await prisma.user.delete({
        where: {
          id: otherUserId,
        },
      });
    });
  });

  describe("PUT /participant/:id", () => {
    let participantId: number;
    let otherParticipantId: number;
    let otherUserId: number;

    beforeAll(async () => {
      const otherUser = await prisma.user.create({
        data: {
          username: "participantIdPutTest",
          password: bcrypt.hashSync("participantPassword", 10),
          permission: "USER",
        },
      });

      otherUserId = otherUser.id;

      const otherUserParticipant = await prisma.participant.create({
        data: {
          name: "Not logged in user's participant put test",
          dob: new Date(2001, 6, 14, 0),
          email: "test@test.com",
          phoneNumber: "123-456-7890",
          userId: otherUserId,
        },
      });

      otherParticipantId = otherUserParticipant.id;

      const participantIdTestParticipant = await prisma.participant.create({
        data: {
          name: "Logged in user's participant put test",
          dob: new Date(2001, 6, 14, 0),
          email: "test@test.com",
          phoneNumber: "123-456-7890",
          userId: userId,
        },
      });

      participantId = participantIdTestParticipant.id;
    });

    it("updates a participant for a given id if the participant belongs to the logged in user", async () => {
      const response = await request(app)
        .put(`/participant/${participantId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Updated Participant",
          dob: new Date(2001, 6, 14, 0),
          email: "test@test.com",
          phoneNumber: "123-456-7890",
        });
      const body = response.body;
      expect(response.statusCode).toBe(200);
      expect(body.id).toBe(participantId);
      expect(body.name).toBe("Updated Participant");
    });

    it("returns a 401 error if the participant does not belong to the logged in user", async () => {
      const response = await request(app)
        .put(`/participant/${otherParticipantId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Updated Participant for not logged in user",
          dob: new Date(2001, 6, 14, 0),
          email: "test@test.com",
          phoneNumber: "123-456-7890",
        });
      const body = response.body;
      expect(response.statusCode).toBe(401);
      expect(body.code).toBe(ErrorCode.PARTICIPANT_NOT_FOUND);
    });

    afterAll(async () => {
      await prisma.participant.deleteMany({
        where: {
          userId: otherUserId,
        },
      });

      await prisma.user.delete({
        where: {
          id: otherUserId,
        },
      });
    });
  });

  describe("DELETE /participant/:id", () => {
    let participantId: number;
    let otherParticipantId: number;
    let otherUserId: number;

    beforeAll(async () => {
      const otherUser = await prisma.user.create({
        data: {
          username: "participantIdPutTest",
          password: bcrypt.hashSync("participantPassword", 10),
          permission: "USER",
        },
      });

      otherUserId = otherUser.id;

      const otherUserParticipant = await prisma.participant.create({
        data: {
          name: "Not logged in user's participant put test",
          dob: new Date(2001, 6, 14, 0),
          email: "test@test.com",
          phoneNumber: "123-456-7890",
          userId: otherUserId,
        },
      });

      otherParticipantId = otherUserParticipant.id;

      const participantIdTestParticipant = await prisma.participant.create({
        data: {
          name: "Logged in user's participant delete test",
          dob: new Date(2001, 6, 14, 0),
          email: "test@test.com",
          phoneNumber: "123-456-7890",
          userId: userId,
        },
      });

      participantId = participantIdTestParticipant.id;
    });

    it("deletes a participant for a given id if the participant belongs to the logged in user", async () => {
      const response = await request(app)
        .delete(`/participant/${participantId}`)
        .set("Authorization", `Bearer ${token}`);
      const body = response.body;
      expect(response.statusCode).toBe(200);
      expect(body.id).toBe(participantId);
    });

    it("returns a 401 error if the participant does not belong to the logged in user", async () => {
      const response = await request(app)
        .delete(`/participant/${otherParticipantId}`)
        .set("Authorization", `Bearer ${token}`);
      const body = response.body;
      expect(response.statusCode).toBe(401);
      expect(body.code).toBe(ErrorCode.PARTICIPANT_NOT_FOUND);
    });

    afterAll(async () => {
      await prisma.participant.deleteMany({
        where: {
          userId: otherUserId,
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
    await prisma.participant.deleteMany({
      where: {
        userId: userId,
      },
    });
    await prisma.user.delete({
      where: {
        username: "participantTest",
      },
    });
  });
});
