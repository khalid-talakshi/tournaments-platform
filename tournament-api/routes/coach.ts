import { Express } from "express";
import { prisma } from "../prisma";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";
import { emailRegex, ErrorCode, UserError } from "../types";
import { decodeToken, getAge } from "../helpers";
import bcrypt from "bcryptjs";

export const coachesRoutes = (app: Express) => {
  app.post("/coaches", async (req, res) => {
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

      if (!teamId) {
        throw Error("noTeamId");
      }

      const team = await prisma.team.findUnique({
        where: {
          id: teamId,
        },
        include: {
          Category: true,
        },
      });

      if (!team) {
        throw Error("invalidTeamId");
      }

      const passwordRes = bcrypt.compare(teamPassword, team.password);

      if (!passwordRes) {
        throw Error("invalidTeamPassword");
      }

      const coach = await prisma.coach.create({
        data: {
          TeamId: teamId,
          participantId: participantId,
        },
      });

      res.status(201).json(coach);
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
      } else if (e.message === "noTeamId") {
        const error: UserError = {
          code: ErrorCode.MISSING_PLAYER_TEAM_ID,
          message: `No Team ID provided`,
        };
        res.status(400).json(error);
        return;
      } else if (e.message === "invalidTeamId") {
        const error: UserError = {
          code: ErrorCode.INVALID_PLAYER_TEAM_ID,
          message: `Invalid Team ID. Either this team doesn't exist or you don't have permission to add players to this team.`,
        };
        res.status(400).json(error);
        return;
      } else if (e.message === "invalidParticipantAge") {
        const error: UserError = {
          code: ErrorCode.INVALID_PLAYER_PARTICIPANT_AGE,
          message: `Participant age is not within the age range of the team.`,
        };
        res.status(400).json(error);
        return;
      } else if (e.message === "invalidParticipantGender") {
        const error: UserError = {
          code: ErrorCode.INVALID_PLAYER_PARTICIPANT_GENDER,
          message: `Participants for this category must be female.`,
        };
        res.status(400).json(error);
        return;
      } else if (e.message === "invalidTeamPassword") {
        const error: UserError = {
          code: ErrorCode.INVALID_PLAYER_TEAM_PASSWORD,
          message: `Invalid Team Password`,
        };
        res.status(400).json(error);
        return;
      } else if (e.message === "duplicateJerseyNumber") {
        const error: UserError = {
          code: ErrorCode.DUPLICATE_PLAYER_JERSEY_NUMBER,
          message: `This jersey number is already taken.`,
        };
        res.status(400).json(error);
        return;
      }
    }
  });

  app.get("/coaches", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader!);
      const { includeParticipant, includeTeam, includeCategory } = req.query;
      const coaches = await prisma.coach.findMany({
        where: {
          Participant: {
            userId,
          },
        },
        include: {
          Team:
            includeTeam === "true" || includeCategory === "true"
              ? {
                  include: {
                    Category: includeCategory === "true",
                  },
                }
              : false,
          Participant: includeParticipant === "true",
        },
      });
      res.status(200).json(coaches);
    } catch (e) {}
  });

  app.get("/coaches/:id", async (req, res) => {
    try {
      const coachId = req.params.id;
      const { includeParticipant, includeTeam, includeCategory } = req.query;
      const coach = await prisma.coach.findUnique({
        where: {
          id: parseInt(coachId),
        },
        include: {
          Participant: includeParticipant === "true",
          Team:
            includeTeam === "true" || includeCategory === "true"
              ? {
                  include: {
                    Category: includeCategory === "true",
                  },
                }
              : false,
        },
      });
      res.json(coach);
    } catch (e) {
      console.log(e);
      res.status(401).json({ error: e.message });
    }
  });

  app.delete("/coaches/:id", async (req, res) => {
    try {
      const coachId = req.params.id;
      const { userId } = decodeToken(req.headers.authorization!);
      const coach = await prisma.coach.delete({
        where: {
          id: parseInt(coachId),
          Participant: {
            userId,
          },
        },
      });
      res.status(200).json(coach);
    } catch (e) {
      console.log(e);
      res.status(401).json({ error: e.message });
    }
  });
};
