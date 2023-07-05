import { Express } from "express";
import { prisma } from "../prisma";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";
import { emailRegex, ErrorCode, UserError } from "../types";
import { decodeToken, getAge } from "../helpers";

export const playersRoutes = (app: Express) => {
  app.post("/players", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { userId } = decodeToken(authHeader!);
      const { participantId } = req.body;
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
      const player = await prisma.player.create({
        data: {
          participantId,
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
};
