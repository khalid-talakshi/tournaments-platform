import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { prisma } from "../prisma/client";
import request from "supertest";
import app from "../app";
import bcrypt from "bcryptjs";
import { ErrorCode } from "../types";

describe("Team Manager", () => {
  let token: string;
  let userId: number;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        username: "teamManagerTest",
        password: await bcrypt.hash("teamManagerTest", 10),
        permission: "USER",
      },
    });

    const response = await request(app).post("/login").send({
      username: "teamManagerTest",
      password: "teamManagerTest",
    });
    token = response.body.token;
    userId = user.id;
  });

  describe("POST /team-manager", () => {
    it("Should create a team manager if no team manager exists", async () => {
      const response = await request(app)
        .post("/team-manager")
        .set("Authorization", `Bearer ${token}`)
        .field("firstName", "Test")
        .field("lastName", "TM")
        .field("dob", "2000-06-19")
        .attach("headshot", "tests/assets/gc-logo.png")
        .set("Content-Type", "multipart/form-data")
        .then((response) => {
          expect(response.status).toBe(201);
          expect(response.body).toEqual({
            id: expect.any(Number),
            userId,
            firstName: "Test",
            lastName: "TM",
            dob: new Date("2000-06-19").toISOString(),
            Teams: expect.arrayContaining([]),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            headshot: "Test-TM-TM-HEADSHOT.png",
          });
        });
    });

    it("Should return an error if a team manager already exists", async () => {
      const response = await request(app)
        .post("/team-manager")
        .set("Authorization", `Bearer ${token}`)
        .field("firstName", "Test")
        .field("lastName", "TM")
        .field("dob", "2000-06-19")
        .attach("headshot", "tests/assets/gc-logo.png")
        .set("Content-Type", "multipart/form-data")
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            code: ErrorCode.TEAM_MANAGER_ALREADY_EXISTS,
            message: "Team manager already exists",
          });
        });
    });

    it("Should return an error if firstName is not provided", async () => {
      const response = await request(app)
        .post("/team-manager")
        .set("Authorization", `Bearer ${token}`)
        .send({
          lastName: "",
          dob: new Date("2000-06-19"),
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: ErrorCode.TM_INVALID_FIRST_NAME,
        message: "First name is required and cannot be empty",
      });
    });

    it("Should return an error if firstName is empty", async () => {
      const response = await request(app)
        .post("/team-manager")
        .set("Authorization", `Bearer ${token}`)
        .send({
          firstName: "",
          lastName: "",
          dob: "2000-06-19",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: ErrorCode.TM_INVALID_FIRST_NAME,
        message: "First name is required and cannot be empty",
      });
    });

    it("Should return an error if lastName is not provided", async () => {
      const response = await request(app)
        .post("/team-manager")
        .set("Authorization", `Bearer ${token}`)
        .send({
          firstName: "Test",
          dob: "2000-06-19",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: ErrorCode.TM_INVALID_LAST_NAME,
        message: "Last name is required and cannot be empty",
      });
    });

    it("Should return an error if lastName is empty", async () => {
      const response = await request(app)
        .post("/team-manager")
        .set("Authorization", `Bearer ${token}`)
        .send({
          firstName: "Test",
          lastName: "",
          dob: "2000-06-19",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: ErrorCode.TM_INVALID_LAST_NAME,
        message: "Last name is required and cannot be empty",
      });
    });

    it("Should return an error if dob is not provided", async () => {
      const response = await request(app)
        .post("/team-manager")
        .set("Authorization", `Bearer ${token}`)
        .send({
          firstName: "Test",
          lastName: "TM",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: ErrorCode.TM_INVALID_DOB,
        message: "Date of birth is required and cannot be empty",
      });
    });

    it("Should return an error if dob is empty", async () => {
      const response = await request(app)
        .post("/team-manager")
        .set("Authorization", `Bearer ${token}`)
        .send({
          firstName: "Test",
          lastName: "TM",
          dob: "",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: ErrorCode.TM_INVALID_DOB,
        message: "Date of birth is required and cannot be empty",
      });
    });

    afterAll(async () => {
      await prisma.teamManager.delete({
        where: {
          userId,
        },
      });
    });
  });

  describe("GET /team-manager", () => {
    let teamManagerId: number;
    beforeAll(async () => {
      const tm = await prisma.teamManager.create({
        data: {
          userId,
          firstName: "Test",
          lastName: "TM",
          dob: new Date("2000-06-19"),
          headshot: "Test-TM-TM-HEADSHOT.png",
        },
      });
      teamManagerId = tm.id;
    });

    it("Should return the team manager", async () => {
      const response = await request(app)
        .get("/team-manager")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: expect.any(Number),
        userId,
        firstName: "Test",
        lastName: "TM",
        dob: new Date("2000-06-19").toISOString(),
        Teams: expect.arrayContaining([]),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        headshot: "Test-TM-TM-HEADSHOT.png",
      });
    });

    afterAll(async () => {
      await prisma.teamManager.delete({ where: { id: teamManagerId } });
    });
  });

  describe("PUT /team-manager", () => {
    let teamManagerId: number;

    beforeAll(async () => {
      const tm = await prisma.teamManager.create({
        data: {
          userId,
          firstName: "Participant",
          lastName: "TM",
          dob: new Date("2000-06-19"),
        },
      });
      teamManagerId = tm.id;
    });

    it("Should update the team manager", async () => {
      const response = await request(app)
        .put("/team-manager")
        .set("Authorization", `Bearer ${token}`)
        .field("firstName", "Test2")
        .field("lastName", "TM2")
        .field("dob", "2000-06-20")
        .attach("headshot", "tests/assets/gc-logo.png")
        .set("Content-Type", "multipart/form-data")
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            id: teamManagerId,
            userId,
            firstName: "Test2",
            lastName: "TM2",
            dob: new Date("2000-06-20").toISOString(),
            Teams: expect.arrayContaining([]),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            headshot: "Test2-TM2-TM-HEADSHOT.png", //TODO: Fix this
          });
        });
    });

    it("Should return an error if the team manager does not exist", async () => {
      await prisma.teamManager.delete({ where: { userId } });
      const response = await request(app)
        .put("/team-manager")
        .set("Authorization", `Bearer ${token}`)
        .field("firstName", "Test2")
        .field("lastName", "TM2")
        .field("dob", "2000-06-20")
        .attach("headshot", "tests/assets/gc-logo.png")
        .set("Content-Type", "multipart/form-data");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: ErrorCode.TEAM_MANAGER_DOES_NOT_EXIST,
        message: "Team manager does not exist",
      });
    });

    it("Should only update firstName if provided", async () => {
      const tm = await prisma.teamManager.create({
        data: {
          userId,
          firstName: "Test2",
          lastName: "TM2",
          dob: new Date("2000-06-20"),
        },
      });
      teamManagerId = tm.id;
      const response = await request(app)
        .put("/team-manager")
        .set("Authorization", `Bearer ${token}`)
        .field("firstName", "Test3")
        .set("Content-Type", "multipart/form-data");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: teamManagerId,
        userId,
        firstName: "Test3",
        lastName: "TM2",
        dob: new Date("2000-06-20").toISOString(),
        Teams: expect.arrayContaining([]),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        headshot: null, //TODO: Fix this
      });
    });

    it("Should only update lastName if provided", async () => {
      const response = await request(app)
        .put("/team-manager")
        .set("Authorization", `Bearer ${token}`)
        .field("lastName", "TM3");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: teamManagerId,
        userId,
        firstName: "Test3",
        lastName: "TM3",
        dob: new Date("2000-06-20").toISOString(),
        Teams: expect.arrayContaining([]),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        headshot: null, //TODO: Fix this
      });
    });

    it("Should only update lastName if provided", async () => {
      const response = await request(app)
        .put("/team-manager")
        .set("Authorization", `Bearer ${token}`)
        .field("dob", "2000-06-21");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: teamManagerId,
        userId,
        firstName: "Test3",
        lastName: "TM3",
        dob: new Date("2000-06-21").toISOString(),
        Teams: expect.arrayContaining([]),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        headshot: null, //TODO: Fix this
      });
    });

    it("Should only update headshot if provided", async () => {
      const response = await request(app)
        .put("/team-manager")
        .set("Authorization", `Bearer ${token}`)
        .attach("headshot", "tests/assets/gc-logo.png");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: teamManagerId,
        userId,
        firstName: "Test3",
        lastName: "TM3",
        dob: new Date("2000-06-21").toISOString(),
        Teams: expect.arrayContaining([]),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        headshot: null, //TODO: Fix this
      });
    });

    afterAll(async () => {
      await prisma.teamManager.delete({ where: { userId } });
    });
  });

  describe("DELETE /team-manager", () => {
    let teamManagerId: number;

    beforeAll(async () => {
      const tm = await prisma.teamManager.create({
        data: {
          userId,
          firstName: "Test",
          lastName: "TM",
          dob: new Date("2000-06-19"),
        },
      });
      teamManagerId = tm.id;
    });

    it("Should delete the team manager", async () => {
      const response = await request(app)
        .delete("/team-manager")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: teamManagerId,
        userId,
        firstName: "Test",
        lastName: "TM",
        dob: new Date("2000-06-19").toISOString(),
        Teams: expect.arrayContaining([]),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        headshot: null, //TODO: Fix this
      });
    });

    it("Should return an error if the team manager does not exist", async () => {
      const response = await request(app)
        .delete("/team-manager")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: ErrorCode.TEAM_MANAGER_DOES_NOT_EXIST,
        message: "Team manager does not exist",
      });
    });
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } });
  });
});
