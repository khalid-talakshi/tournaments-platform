import { Express } from "express";
import { prisma } from "../prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { ErrorCode } from "../types";
import { decodeToken } from "../helpers";
import { UserError } from "aws-sdk/clients/chime";
import bcrypt from "bcryptjs";

export const teamsRoutes = (app: Express) => {
  app.post("/teams", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader!);
      const { teamName, category, password } = req.body;
      const teamManager = await prisma.teamManager.findUnique({
        where: {
          userId,
        },
      });
      if (!teamManager) {
        throw new Error("noTeamManager");
      } else if (!teamName) {
        throw new Error("invalidTeamName");
      } else if (!category) {
        throw new Error("invalidCategory");
      }
      const hashedPassword = await bcrypt.hash(
        password || `${teamName}-${category}`,
        10
      );
      console.log(category);
      const categoryEntry = await prisma.category.findFirst({
        where: {
          code: category,
        },
      });

      if (!categoryEntry) {
        throw new Error("invalidCategory");
      }

      console.log(categoryEntry);
      const team = await prisma.team.create({
        data: {
          teamName: teamName,
          teamManagerId: teamManager!.id,
          password: hashedPassword,
          categoryId: categoryEntry!.id,
        },
        include: {
          Category: true,
        },
      });
      res.status(201).json(team);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          res.status(400).json({
            code: ErrorCode.TEAM_DUPLICATE_NAME,
            message: "A team in this category already has this name",
          } as UserError);
        }
      } else if (e.message === "noTeamManager") {
        res.status(401).json({
          code: ErrorCode.NO_TEAM_MANAGER,
          message: "User has no TeamManager",
        } as UserError);
      } else if (e.message === "invalidTeamName") {
        res.status(400).json({
          code: ErrorCode.TEAM_NAME_INVALID,
          message: "teamName is a required field",
        } as UserError);
      } else if (e.message === "invalidCategory") {
        res.status(400).json({
          code: ErrorCode.TEAM_CATEGORY_INVALID,
          message: "category is a required field",
        } as UserError);
      } else {
        console.log(e);
        res.status(400).json({ error: e.message });
      }
    }
  });

  app.get("/teams", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader!);
      const { includeCategory } = req.query;
      const teamManager = await prisma.teamManager.findUnique({
        where: {
          userId,
        },
      });
      if (!teamManager) {
        throw new Error("noTeamManager");
      }
      const teams = await prisma.team.findMany({
        where: {
          TeamManager: {
            id: teamManager!.id,
          },
        },
        include: {
          Category: includeCategory === "true",
        },
      });
      res.status(200).json(teams);
    } catch (e) {
      if (e.message === "noTeamManager") {
        res.status(200).json({
          code: ErrorCode.NO_TEAM_MANAGER,
          message: "User has no TeamManager",
        } as UserError);
      } else {
        console.log(e);
        res.status(400).json({ error: e.message });
      }
    }
  });

  app.get("/teams/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader!);
      const {
        includePlayers,
        includeCoaches,
        includeParticipants,
        includeVerification,
      } = req.query;
      const teamManager = await prisma.teamManager.findUnique({
        where: {
          userId,
        },
      });
      if (!teamManager) {
        throw new Error("noTeamManager");
      }
      const team = await prisma.team.findUnique({
        where: {
          id: Number(req.params.id),
        },
        include: {
          Players:
            includePlayers === "true"
              ? {
                  include: {
                    Participant:
                      includeParticipants === "true"
                        ? {
                            include: {
                              Verification: includeVerification === "true",
                            },
                          }
                        : false,
                  },
                }
              : false,
          Coaches:
            includeCoaches === "true"
              ? {
                  include: {
                    Participant:
                      includeParticipants === "true"
                        ? {
                            include: {
                              Verification: includeVerification === "true",
                            },
                          }
                        : false,
                  },
                }
              : false,
        },
      });
      if (!team) {
        throw new Error("noTeam");
      }
      res.status(200).json(team);
    } catch (e) {
      if (e.message === "noTeamManager") {
        res.status(401).json({
          code: ErrorCode.NO_TEAM_MANAGER,
          message: "User has no Team Manager",
        } as UserError);
      } else if (e.message === "noTeam") {
        res.status(404).json({
          code: ErrorCode.TEAM_NOT_FOUND,
          message:
            "Team not found. It is possible you don't own this team or it doesn't exist",
        } as UserError);
      } else {
        console.log(e);
        res.status(400).json({ error: e.message });
      }
    }
  });

  app.put("/teams/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader!);
      const { teamName, category, password } = req.body;
      console.log(teamName, category);
      const teamManager = await prisma.teamManager.findUnique({
        where: {
          userId,
        },
      });
      if (!teamManager) {
        throw new Error("noTeamManager");
      }
      const dataToUpdate = {} as any;
      if (teamName) {
        dataToUpdate.teamName = teamName;
      }
      if (category) {
        dataToUpdate.category = category;
      }
      if (password) {
        dataToUpdate.password = await bcrypt.hash(password, 10);
      }

      const teamPlayers = await prisma.team.findUnique({
        where: {
          id: Number(req.params.id),
        },
        include: {
          Players: true,
        },
      });

      if (teamPlayers?.Players.length && dataToUpdate.category) {
        throw new Error("teamHasPlayers");
      }

      const team = await prisma.team.update({
        where: {
          id: Number(req.params.id),
          teamManagerId: teamManager!.id,
        },
        data: dataToUpdate,
      });
      if (!team) {
        throw new Error("noTeam");
      }
      res.status(200).json(team);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          res.status(404).json({
            code: ErrorCode.TEAM_NOT_FOUND,
            message: "Team not found",
          } as UserError);
        }
      } else if (e.message === "noTeamManager") {
        res.status(401).json({
          code: ErrorCode.NO_TEAM_MANAGER,
          message: "User has no TeamManager",
        } as UserError);
      } else if (e.message === "noTeam") {
        res.status(404).json({
          code: ErrorCode.TEAM_NOT_FOUND,
          message: "Team not found",
        } as UserError);
      } else if (e.message === "teamHasPlayers") {
        res.status(400).json({
          code: ErrorCode.TEAM_HAS_PLAYERS,
          message: "This team has players, you cannot change the category.",
        } as UserError);
      } else {
        console.log(e);
        res.status(400).json({ error: e.message });
      }
    }
  });

  app.delete("/teams/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader!);
      const teamManager = await prisma.teamManager.findUnique({
        where: {
          userId,
        },
      });
      if (!teamManager) {
        throw new Error("noTeamManager");
      }
      let team = await prisma.team.findUnique({
        where: {
          id: Number(req.params.id),
        },
      });

      if (!team) {
        throw new Error("noTeam");
      }

      if (team.teamManagerId !== teamManager.id) {
        throw new Error("notTeamManager");
      }

      team = await prisma.team.delete({
        where: {
          id: Number(req.params.id),
        },
      });
      if (!team) {
        throw new Error("noTeam");
      }
      res.status(200).json(team);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          res.status(404).json({
            code: ErrorCode.TEAM_NOT_FOUND,
            message: "Team not found",
          } as UserError);
        }
      } else if (e.message === "noTeamManager") {
        res.status(401).json({
          code: ErrorCode.NO_TEAM_MANAGER,
          message: "User has no TeamManager",
        } as UserError);
      } else if (e.message === "noTeam") {
        res.status(404).json({
          code: ErrorCode.TEAM_NOT_FOUND,
          message: "Team not found",
        } as UserError);
      } else {
        console.log(e);
        res.status(400).json({ error: e.message });
      }
    }
  });

  app.get("/teams/category/:category", async (req, res) => {
    try {
      const teams = await prisma.team.findMany({
        where: {
          Category: {
            name: req.params.category,
          },
        },
      });
      res.status(200).json(teams);
    } catch (e) {
      console.log(e);
      res.status(400).json({ error: e.message });
    }
  });
};
