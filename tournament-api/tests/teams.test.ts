import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { prisma } from "../prisma/client";
import request from "supertest";
import app from "../app";
import bcrypt from "bcryptjs";
import { ErrorCode, TeamCategory } from "../types";

describe("Teams Test", () => {
  let token: string;
  let userId: number;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        username: "teamTest",
        password: bcrypt.hashSync("teamTest", 10),
        permission: "USER",
      },
    });
    const response = await request(app).post("/login").send({
      username: "teamTest",
      password: "teamTest",
    });
    token = response.body.token;
    userId = user.id;
  });

  describe("POST /teams", () => {
    let teamManagerId: number;
    it("fails to create a team if user has no TeamManager", async () => {
      const response = await request(app)
        .post("/teams")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "teamTest",
          category: TeamCategory.M01,
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe(ErrorCode.NO_TEAM_MANAGER);
      expect(response.body.message).toBe("User has no TeamManager");
    });

    it("returns a 200 status code when a valid team is provided", async () => {
      const tm = await prisma.teamManager.create({
        data: {
          firstName: "teamTest",
          lastName: "teamTest",
          dob: new Date("2000-01-01"),
          userId,
        },
      });
      teamManagerId = tm.id;

      const response = await request(app)
        .post("/teams")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "testTeam",
          category: TeamCategory.M01,
        });
      expect(response.statusCode).toBe(201);
      expect(response.body.teamName).toBe("testTeam");
      expect(response.body.category).toBe(TeamCategory.M01);
    });

    it("returns a 400 error when a team is created with a duplicate name in the same category", async () => {
      const response = await request(app)
        .post("/teams")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "testTeam",
          category: TeamCategory.M01,
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe(ErrorCode.TEAM_DUPLICATE_NAME);
      expect(response.body.message).toBe(
        "A team in this category already has this name"
      );
    });

    it("returns a 400 error when no name is provided", async () => {
      const response = await request(app)
        .post("/teams")
        .set("Authorization", `Bearer ${token}`)
        .send({
          category: TeamCategory.M01,
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("teamName is a required field");
      expect(response.body.code).toBe(ErrorCode.TEAM_NAME_INVALID);
    });

    it("returns a 400 when teamName is empty", async () => {
      const response = await request(app)
        .post("/teams")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "",
          category: TeamCategory.M01,
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("teamName is a required field");
      expect(response.body.code).toBe(ErrorCode.TEAM_NAME_INVALID);
    });

    it("returns a 400 error when no category is provided", async () => {
      const response = await request(app)
        .post("/teams")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "testTeam",
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("category is a required field");
      expect(response.body.code).toBe(ErrorCode.TEAM_CATEGORY_INVALID);
    });

    it("returns a 400 error when category is empty", async () => {
      const response = await request(app)
        .post("/teams")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "testTeam",
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("category is a required field");
      expect(response.body.code).toBe(ErrorCode.TEAM_CATEGORY_INVALID);
    });

    afterAll(async () => {
      await prisma.team.deleteMany({
        where: {
          teamManagerId: teamManagerId,
        },
      });
      await prisma.teamManager.delete({
        where: {
          id: teamManagerId,
        },
      });
    });
  });

  describe("GET /teams", () => {
    let teamManagerId: number;

    it("returns an error when there is no team manager", async () => {
      const response = await request(app)
        .get("/teams")
        .set("Authorization", `Bearer ${token}`);
      expect(response.statusCode).toBe(401);
      expect(response.body.code).toBe(ErrorCode.NO_TEAM_MANAGER);
      expect(response.body.message).toBe("User has no TeamManager");
    });

    it("returns all the teams for a user when they have a team manager", async () => {
      const tm = await prisma.teamManager.create({
        data: {
          firstName: "teamTest",
          lastName: "teamTest",
          dob: new Date("2000-01-01"),
          userId,
        },
      });
      teamManagerId = tm.id;

      const teams = await prisma.team.createMany({
        data: [
          {
            teamName: "testTeam1",
            category: TeamCategory.M01,
            teamManagerId,
          },
          {
            teamName: "testTeam2",
            category: TeamCategory.M01,
            teamManagerId,
          },
        ],
      });

      const response = await request(app)
        .get("/teams")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].teamName).toBe("testTeam1");
      expect(response.body[1].teamName).toBe("testTeam2");
    });

    afterAll(async () => {
      await prisma.team.deleteMany({
        where: {
          teamManagerId: teamManagerId,
        },
      });
      await prisma.teamManager.delete({
        where: {
          id: teamManagerId,
        },
      });
    });
  });

  describe("GET /teams/:id", () => {
    let teamManagerId: number;
    let teamId: number;
    let otherUserId: number;
    let otherUserTeamManagerId: number;

    it("returns an error when there is no team manager", async () => {
      const response = await request(app)
        .get("/teams/1")
        .set("Authorization", `Bearer ${token}`);
      expect(response.statusCode).toBe(401);
      expect(response.body.code).toBe(ErrorCode.NO_TEAM_MANAGER);
      expect(response.body.message).toBe("User has no TeamManager");
    });

    it("returns a 404 error when the team does not exist", async () => {
      const tm = await prisma.teamManager.create({
        data: {
          firstName: "teamTest",
          lastName: "teamTest",
          dob: new Date("2000-01-01"),
          userId,
        },
      });
      teamManagerId = tm.id;
      const response = await request(app)
        .get("/teams/1")
        .set("Authorization", `Bearer ${token}`);
      expect(response.statusCode).toBe(404);
      expect(response.body.code).toBe(ErrorCode.TEAM_NOT_FOUND);
      expect(response.body.message).toBe("Team not found");
    });

    it("returns a team when it exists", async () => {
      const team = await prisma.team.create({
        data: {
          teamName: "testTeam",
          category: TeamCategory.M01,
          teamManagerId,
        },
      });
      teamId = team.id;

      const response = await request(app)
        .get(`/teams/${teamId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.teamName).toBe("testTeam");
      expect(response.body.category).toBe(TeamCategory.M01);
    });

    it("returns a 404 error when the team does not belong to the user", async () => {
      const otherUser = await prisma.user.create({
        data: {
          username: "otherUserOnTeamTest",
          password: "password",
        },
      });
      otherUserId = otherUser.id;

      const otherUserTeamManager = await prisma.teamManager.create({
        data: {
          firstName: "otherUserTeamManager",
          lastName: "otherUserTeamManager",
          dob: new Date("2000-01-01"),
          userId: otherUserId,
        },
      });

      otherUserTeamManagerId = otherUserTeamManager.id;

      const otherUserTeam = await prisma.team.create({
        data: {
          teamName: "otherUserTeam",
          category: TeamCategory.M01,
          teamManagerId: otherUserTeamManagerId,
        },
      });

      const response = await request(app)
        .get(`/teams/${otherUserTeam.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.code).toBe(ErrorCode.TEAM_NOT_FOUND);
      expect(response.body.message).toBe("Team not found");
    });

    afterAll(async () => {
      await prisma.team.deleteMany({
        where: {
          teamManagerId: teamManagerId,
        },
      });
      await prisma.teamManager.delete({
        where: {
          id: teamManagerId,
        },
      });
      await prisma.team.deleteMany({
        where: {
          teamManagerId: otherUserTeamManagerId,
        },
      });
      await prisma.teamManager.delete({
        where: {
          id: otherUserTeamManagerId,
        },
      });
      await prisma.user.delete({
        where: {
          id: otherUserId,
        },
      });
    });
  });

  describe("PUT /teams/:id", () => {
    let teamManagerId: number;
    let teamId: number;
    let otherUserId: number;
    let otherUserTeamManagerId: number;

    beforeAll(async () => {
      const tm = await prisma.teamManager.create({
        data: {
          firstName: "teamTest",
          lastName: "teamTest",
          dob: new Date("2000-01-01"),
          userId,
        },
      });
      teamManagerId = tm.id;

      const team = await prisma.team.create({
        data: {
          teamName: "testTeam",
          category: TeamCategory.M01,
          teamManagerId,
        },
      });
      teamId = team.id;

      const otherUser = await prisma.user.create({
        data: {
          username: "otherUserOnTeamTest",
          password: "password",
        },
      });
      otherUserId = otherUser.id;

      const otherUserTeamManager = await prisma.teamManager.create({
        data: {
          firstName: "otherUserTeamManager",
          lastName: "otherUserTeamManager",
          dob: new Date("2000-01-01"),
          userId: otherUserId,
        },
      });

      otherUserTeamManagerId = otherUserTeamManager.id;

      const otherUserTeam = await prisma.team.create({
        data: {
          teamName: "otherUserTeam",
          category: TeamCategory.M01,
          teamManagerId: otherUserTeamManagerId,
        },
      });
    });

    it("updates a team", async () => {
      const response = await request(app)
        .put(`/teams/${teamId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          teamName: "updatedTeamName",
          category: TeamCategory.M02,
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.teamName).toBe("updatedTeamName");
      expect(response.body.category).toBe(TeamCategory.M02);
    });

    it("returns a 404 error when the team does not exist", async () => {
      const response = await request(app)
        .put("/teams/1")
        .set("Authorization", `Bearer ${token}`)
        .send({
          teamName: "updatedTeamName",
          category: TeamCategory.M02,
        });
      expect(response.statusCode).toBe(404);
      expect(response.body.code).toBe(ErrorCode.TEAM_NOT_FOUND);
      expect(response.body.message).toBe("Team not found");
    });

    it("returns a 404 error when the team does not belong to the user", async () => {
      const response = await request(app)
        .put(`/teams/${otherUserTeamManagerId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          teamName: "updatedTeamName",
          category: TeamCategory.M02,
        });
      expect(response.statusCode).toBe(404);
      expect(response.body.code).toBe(ErrorCode.TEAM_NOT_FOUND);
      expect(response.body.message).toBe("Team not found");
    });

    it("only updates the teamName when the teamName is provided", async () => {
      const response = await request(app)
        .put(`/teams/${teamId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          teamName: "updatedTeamName2",
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.teamName).toBe("updatedTeamName2");
      expect(response.body.category).toBe(TeamCategory.M02);
    });

    it("only updates the category when the category is provided", async () => {
      const response = await request(app)
        .put(`/teams/${teamId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          category: TeamCategory.M01,
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.teamName).toBe("updatedTeamName2");
      expect(response.body.category).toBe(TeamCategory.M01);
    });

    afterAll(async () => {
      await prisma.team.deleteMany({
        where: {
          teamManagerId: teamManagerId,
        },
      });
      await prisma.teamManager.delete({
        where: {
          id: teamManagerId,
        },
      });
      await prisma.team.deleteMany({
        where: {
          teamManagerId: otherUserTeamManagerId,
        },
      });
      await prisma.teamManager.delete({
        where: {
          id: otherUserTeamManagerId,
        },
      });
      await prisma.user.delete({
        where: {
          id: otherUserId,
        },
      });
    });
  });

  describe("DELETE /teams/:id", () => {
    let teamManagerId: number;
    let teamId: number;
    let otherUserId: number;
    let otherUserTeamManagerId: number;

    beforeAll(async () => {
      const tm = await prisma.teamManager.create({
        data: {
          firstName: "teamTest",
          lastName: "teamTest",
          dob: new Date("2000-01-01"),
          userId,
        },
      });
      teamManagerId = tm.id;

      const team = await prisma.team.create({
        data: {
          teamName: "testTeam",
          category: TeamCategory.M01,
          teamManagerId,
        },
      });
      teamId = team.id;

      const otherUser = await prisma.user.create({
        data: {
          username: "otherUserOnTeamTest",
          password: "password",
        },
      });
      otherUserId = otherUser.id;

      const otherUserTeamManager = await prisma.teamManager.create({
        data: {
          firstName: "otherUserTeamManager",
          lastName: "otherUserTeamManager",
          dob: new Date("2000-01-01"),
          userId: otherUserId,
        },
      });

      otherUserTeamManagerId = otherUserTeamManager.id;

      const otherUserTeam = await prisma.team.create({
        data: {
          teamName: "otherUserTeam",
          category: TeamCategory.M01,
          teamManagerId: otherUserTeamManagerId,
        },
      });
    });

    it("deletes a team", async () => {
      const response = await request(app)
        .delete(`/teams/${teamId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.teamName).toBe("testTeam");
      expect(response.body.category).toBe(TeamCategory.M01);
    });

    it("returns a 404 error when the team does not exist", async () => {
      const response = await request(app)
        .delete("/teams/1")
        .set("Authorization", `Bearer ${token}`);
      expect(response.statusCode).toBe(404);
      expect(response.body.code).toBe(ErrorCode.TEAM_NOT_FOUND);
      expect(response.body.message).toBe("Team not found");
    });

    it("returns a 404 error when the team does not belong to the user", async () => {
      const response = await request(app)
        .delete(`/teams/${otherUserTeamManagerId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(response.statusCode).toBe(404);
      expect(response.body.code).toBe(ErrorCode.TEAM_NOT_FOUND);
      expect(response.body.message).toBe("Team not found");
    });

    afterAll(async () => {
      await prisma.team.deleteMany({
        where: {
          teamManagerId: teamManagerId,
        },
      });
      await prisma.teamManager.delete({
        where: {
          id: teamManagerId,
        },
      });
      await prisma.team.deleteMany({
        where: {
          teamManagerId: otherUserTeamManagerId,
        },
      });
      await prisma.teamManager.delete({
        where: {
          id: otherUserTeamManagerId,
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
