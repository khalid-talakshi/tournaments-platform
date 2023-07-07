import { Express } from "express";
import { prisma } from "../prisma";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";
import { emailRegex, ErrorCode, UserError } from "../types";
import { decodeToken, getAge } from "../helpers";
import bcrypt from "bcryptjs";

export const playersRoutes = (app: Express) => {
  app.post("/players", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader!);
      const { participantId, teamId, teamPassword } = req.body;
      if (!participantId) {
        throw Error("noParticipantId");
      }
      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId,
          userId,
        },
      });
      if (!participant) {
        throw Error("invalidParticipantId");
      }
      console.log("found participant");

      if (!teamId) {
        throw Error("noTeamId");
      }

      console.log("has team id");

      const team = await prisma.team.findUnique({
        where: {
          id: teamId,
        },
      });

      if (!team) {
        throw Error("invalidTeamId");
      }

      console.log("found team");

      if (bcrypt.compareSync(teamPassword, team.password) === false) {
        throw Error("invalidTeamPassword");
      }

      console.log("valid team password");

      const player = await prisma.player.create({
        data: {
          participantId,
          teamId: teamId,
        },
      });
      res.status(201).json(player);
    } catch (e) {
      if (e.message === "noParticipantId") {
        const error: UserError = {
          code: ErrorCode.MISSING_PLAYER_PARTICIPANT_ID,
          message: `No Participant ID`,
        };
        res.status(400).json(error);
        return;
      } else if (e.message === "invalidParticipantId") {
        const error: UserError = {
          code: ErrorCode.INVALID_PLAYER_PARTICIPANT_ID,
          message: `Invalid Participant ID`,
        };
        res.status(400).json(error);
        return;
      }
    }
  });

  app.get("/players", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const params = req.query;
      const { userId } = decodeToken(authHeader!);
      const players = await prisma.player.findMany({
        where: {
          Participant: {
            userId,
          },
        },
        include: {
          Participant:
            params.includeParticipant === "true"
              ? {
                  include: {
                    User: params.includeUser === "true",
                  },
                }
              : false,
          Team: params.includeTeam === "true",
        },
      });
      res.status(200).json(players);
    } catch (e) {
      res.status(500).json(e);
    }
  });

  app.get("/players/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader!);
      const { id } = req.params;
      const params = req.query;
      const player = await prisma.player.findUnique({
        where: {
          id: parseInt(id),
          Participant: {
            userId,
          },
        },
        include: {
          Participant:
            params.includeParticipant === "true"
              ? {
                  include: {
                    User: params.includeUser === "true",
                  },
                }
              : false,
          Team: params.includeTeam === "true",
        },
      });
      if (!player) {
        throw Error("invalidPlayerId");
      }
      res.status(200).json(player);
    } catch (e) {
      if (e.message === "invalidPlayerId") {
        const error: UserError = {
          code: ErrorCode.INVALID_PLAYER_ID,
          message: `Player cannot be found. This could be because either the player doesn't exist or the player doesn't belong to you.`,
        };
        res.status(400).json(error);
        return;
      }
      res.status(500).json(e);
    }
  });

  app.put("/players/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader!);
      const { id } = req.params;
      const { participantId, teamId } = req.body;
      const player = await prisma.player.findUnique({
        where: {
          id: parseInt(id),
          Participant: {
            userId,
          },
        },
      });

      if (!player) {
        throw Error("invalidPlayerId");
      }

      const dataToUpdate: any = {};

      if (participantId) {
        const participant = await prisma.participant.findUnique({
          where: {
            id: participantId,
          },
        });
        if (!participant) {
          throw Error("invalidParticipantId");
        }
        dataToUpdate.participantId = participantId;
      }

      if (teamId) {
        const team = await prisma.team.findUnique({
          where: {
            id: teamId,
          },
        });
        if (!team) {
          throw Error("invalidTeamId");
        }
        dataToUpdate.teamId = teamId;
      }

      const updatedPlayer = await prisma.player.update({
        where: {
          id: parseInt(id),
        },
        data: {
          participantId,
          teamId,
        },
      });
      res.status(200).json(updatedPlayer);
    } catch (e) {
      if (e.message === "invalidPlayerId") {
        const error: UserError = {
          code: ErrorCode.INVALID_PLAYER_ID,
          message: `Player cannot be found. This could be because either the player doesn't exist or the player doesn't belong to you.`,
        };
        res.status(400).json(error);
        return;
      }
      res.status(500).json(e);
    }
  });
};
