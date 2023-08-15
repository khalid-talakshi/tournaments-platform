import { Express } from "express";
import { prisma } from "../prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { ErrorCode, VerificationStatus } from "../types";
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
      // only update password or team name
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader!);
      const { teamName, oldPassword, newPassword, confirmPassword } = req.body;
      const teamManager = await prisma.teamManager.findUnique({
        where: {
          userId,
        },
      });
      if (!teamManager) {
        throw new Error("noTeamManager");
      }
      const dataToUpdate = {} as any;

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

      if (teamName) {
        dataToUpdate.teamName = teamName;
      }
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("passwordsDoNotMatch");
        }
        if (!oldPassword) {
          throw new Error("oldPasswordRequired");
        }
        const valid = await bcrypt.compare(oldPassword, team!.password!);
        if (!valid) {
          throw new Error("invalidOldPassword");
        }

        dataToUpdate.password = await bcrypt.hash(newPassword, 10);
      }

      team = await prisma.team.update({
        where: {
          id: Number(req.params.id),
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
      } else if (e.message === "passwordsDoNotMatch") {
        res.status(400).json({
          code: ErrorCode.TEAM_PASSWORDS_DO_NOT_MATCH,
          message: "New passwords do not match",
        } as UserError);
      } else if (e.message === "oldPasswordRequired") {
        res.status(400).json({
          code: ErrorCode.TEAM_OLD_PASSWORD_REQUIRED,
          message: "Old password is required",
        } as UserError);
      } else if (e.message === "invalidOldPassword") {
        res.status(400).json({
          code: ErrorCode.TEAM_INVALID_OLD_PASSWORD,
          message: "Old password is invalid",
        } as UserError);
      } else {
        console.log(e);
        res.status(400).json({
          code: ErrorCode.UNKWON_ERROR,
          message: e.message,
        } as UserError);
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

  app.get("/teams/:id/status", async (req, res) => {
    // gets the status of a team and the requirements they have meant
    // TODO update category table to include requirements
    try {
      const minNumberPlayers = 6;
      const maxNumberPlayers = 14;
      const minNumberCoaches = 1;
      const maxNumberCoaches = 3;
      const verificationObject = {};
      // get team by id
      const { id } = req.params;
      const team = await prisma.team.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          Players: {
            include: {
              Participant: {
                include: {
                  Verification: true,
                },
              },
            },
          },
          Coaches: {
            include: {
              Participant: {
                include: {
                  Verification: true,
                },
              },
            },
          },
        },
      });
      // check if they have the minimum number of players
      if (team?.Players.length < minNumberPlayers) {
        verificationObject["minPlayers"] = false;
      } else {
        verificationObject["minPlayers"] = true;
      }
      // check if they have the minimum number of coaches
      if (team?.Coaches.length < minNumberCoaches) {
        verificationObject["minCoaches"] = false;
      } else {
        verificationObject["minCoaches"] = true;
      }
      // check if they are over the number of maximum players
      console.log(team?.Players.length, maxNumberPlayers);
      if (team?.Players.length > maxNumberPlayers) {
        verificationObject["maxPlayers"] = false;
      } else {
        verificationObject["maxPlayers"] = true;
      }
      // check if they are over the number of maximum coaches
      if (team?.Coaches.length > maxNumberCoaches) {
        verificationObject["maxCoaches"] = false;
      } else {
        verificationObject["maxCoaches"] = true;
      }
      // check if every player is verified
      const unverifiedPlayers = team?.Players.filter((player) => {
        return !(
          player.Participant.Verification.status === VerificationStatus.VERIFIED
        );
      });
      if (unverifiedPlayers?.length) {
        verificationObject["playersVerified"] = false;
      } else {
        verificationObject["playersVerified"] = true;
      }
      // check if every coach is verified
      const unverifiedCoaches = team?.Coaches.filter((coach) => {
        return !(
          coach.Participant.Verification.status === VerificationStatus.VERIFIED
        );
      });
      if (unverifiedCoaches?.length) {
        verificationObject["coachesVerified"] = false;
      } else {
        verificationObject["coachesVerified"] = true;
      }
      res.status(200).json(verificationObject);
    } catch (e) {
      console.log(e);
      res.status(400).json({ error: e.message });
    }
  });
};
