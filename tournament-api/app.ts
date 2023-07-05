import express from "express";
import cors from "cors";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import { prisma } from "./prisma";
import { parseSchedule, parseCsv, getAllMatches, upload } from "./helpers";
import { authenticate } from "./middleware/authentication";
import {
  loginRoutes,
  participantRoutes,
  registerRoutes,
  teamManagerRoutes,
  teamsRoutes,
  playersRoutes,
} from "./routes";

dotenv.config();

const port = 8080;

const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticate);

AWS.config.update({ region: "ca-central-1" });

const bucketParams = {
  Bucket: "goldcup-2020-public",
};

const s3 = new AWS.S3();

app.get("/get-image", async (req, res) => {
  try {
    const ssid = req.query.ssid;
    const playerId = req.query.playerId;
    const role = req.query.role;
    s3.listObjectsV2(bucketParams, (err, data) => {
      if (err) {
        console.log(err);
        res.status(401).json({ error: err });
        return;
      } else {
        const cleanedData = data.Contents.map((item) => {
          return item.Key;
        });
        const filteredObjects = cleanedData.filter((item) => {
          return item.includes(`${ssid}-${role}${playerId}-headshot`);
        });
        const objectKey = filteredObjects[0];
        s3.getObject({ ...bucketParams, Key: objectKey }, (err, data) => {
          if (err) {
            res.status(401).json({ error: err });
          } else {
            res.status(200).json({ data: data });
          }
        });
      }
    });
  } catch (error) {
    res.status(401).json({ error: error });
  }
});

app.get("/match/:id", async (req, res) => {
  try {
    const matchId = req.params.id;
    const match = await prisma.match.findUnique({
      where: {
        id: parseInt(matchId),
      },
      include: {
        HomeTeam: true,
        AwayTeam: true,
      },
    });
    res.status(200).json(match);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

app.get("/match/:matchId/team/:teamId", async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const teamId = parseInt(req.params.teamId);
    const match = await prisma.match.findUnique({
      where: {
        id: parseInt(matchId),
      },
      include: {
        HomeTeam: true,
        AwayTeam: true,
      },
    });
    if (match.HomeTeam.id !== teamId && match.AwayTeam.id !== teamId) {
      res.status(401).json({
        error: `Team id ${teamId} does not belong to any team in match ${matchId}`,
      });
      return;
    }
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        Players: {
          include: {
            Participant: true,
          },
        },
        Coaches: {
          include: {
            Participant: true,
          },
        },
      },
    });
    res.status(200).json(team);
  } catch (e) {
    console.log(e);
    res.status(401).json({ error: e.message });
  }
});

// app.post("/check-in", async (req: any, res) => {
//   try {
//     const participantId = parseInt(req.query.participantId);
//     const matchId = parseInt(req.query.matchId);
//     const teamId = parseInt(req.query.teamId);
//     const checkInStatus = req.query.status;

//     // check if match has team involved
//     const match = await prisma.match.findUnique({
//       where: {
//         id: matchId,
//       },
//       include: {
//         HomeTeam: true,
//         AwayTeam: true,
//       },
//     });
//     if (match.homeTeamId !== teamId && match.awayTeamId !== teamId) {
//       res.status(401).json({
//         error: `match id ${matchId} doesn't have team id ${teamId} involved in it.`,
//       });
//       return;
//     }

//     // check if player is on team
//     const players = await prisma.player.findMany({
//       where: {
//         participantId: participantId,
//         TeamId: teamId,
//       },
//       include: {
//         Team: true,
//       },
//     });

//     if (players.length === 0) {
//       res.status(401).json({
//         error: `participant id ${participantId} doesn't belong to team id ${teamId}`,
//       });
//       return;
//     }

//     const checkInRecord = await prisma.checkIn.upsert({
//       where: {
//         match_participant_team: {
//           participantId: participantId,
//           matchId: matchId,
//           teamId: teamId,
//         },
//       },
//       update: {
//         status: checkInStatus,
//       },
//       create: {
//         participantId: participantId,
//         matchId: matchId,
//         teamId: teamId,
//         status: checkInStatus,
//       },
//     });

//     const created = checkInRecord.createdAt === checkInRecord.updatedAt;
//     if (created) {
//       res.status(201).json(checkInRecord);
//       return;
//     } else {
//       res.status(200).json(checkInRecord);
//       return;
//     }
//   } catch (e) {
//     console.log(e);
//     res.status(401).json({
//       error: e.message,
//     });
//   }
// });

app.get("/player/:id", async (req, res) => {
  try {
    const playerId = req.params.id;
    const includeParticipant = req.query.includeParticipant;
    const player = await prisma.player.findUnique({
      where: {
        id: parseInt(playerId),
      },
      include: {
        Participant: includeParticipant === "true",
      },
    });
    res.json(player);
  } catch (e) {
    console.log(e);
    res.status(401).json({ error: e.message });
  }
});

app.get("/coach/:id", async (req, res) => {
  try {
    const coachId = req.params.id;
    const includeParticipant = req.query.includeParticipant;
    const coach = await prisma.coach.findUnique({
      where: {
        id: parseInt(coachId),
      },
      include: {
        Participant: includeParticipant === "true",
      },
    });
    res.json(coach);
  } catch (e) {
    console.log(e);
    res.status(401).json({ error: e.message });
  }
});

// app.get("/check-in", async (req: any, res) => {
//   try {
//     const participantId = parseInt(req.query.participantId);
//     const matchId = parseInt(req.query.matchId);
//     const teamId = parseInt(req.query.teamId);

//     const checkInData = await prisma.checkIn.findUnique({
//       where: {
//         match_participant_team: {
//           participantId: participantId,
//           matchId: matchId,
//           teamId: teamId,
//         },
//       },
//     });
//     res.status(200).json(checkInData);
//   } catch (e) {
//     console.log(e);
//     res.status(401).json({ error: e.message });
//   }
// });

app.get("/participant/:id/players", async (req, res) => {
  try {
    const participantId = parseInt(req.params.id);
    const players = await prisma.participant.findUnique({
      where: {
        id: participantId,
      },
      select: {
        Players: true,
      },
    });
    res.status(200).json(players.Players);
  } catch (e) {
    console.log(e);
    res.status(401).json({ error: e.message });
  }
});

app.get("/participant/:id/coaches", async (req, res) => {
  try {
    const participantId = parseInt(req.params.id);
    const coaches = await prisma.participant.findUnique({
      where: {
        id: participantId,
      },
      select: {
        Coaches: true,
      },
    });
    res.status(200).json(coaches.Coaches);
  } catch (e) {
    console.log(e);
    res.status(401).json({ error: e.message });
  }
});

app.post("/parse-data", upload.single("data"), async (req, res) => {
  try {
    const dataFile = req.file;
    parseCsv(dataFile);
    fs.unlink(dataFile.path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    res.status(200).json({ message: "success" });
  } catch (e) {
    console.log(e);
    res.status(401).json({ error: e.message });
  }
});

loginRoutes(app);
registerRoutes(app);
participantRoutes(app);
teamManagerRoutes(app);
teamsRoutes(app);
playersRoutes(app);

app.get("/participant/:id/matches", async (req: any, res) => {
  try {
    const participantId = parseInt(req.params.id);
    const currentMatch = parseInt(req.query.currentMatch);
    const filteredMatches = await getAllMatches(participantId, currentMatch);
    res.status(200).json(filteredMatches);
  } catch (e) {
    console.log(e);
    res.status(401).json({ error: e.message });
  }
});

// app.post("/red-card", async (req, res) => {
//   try {
//     const { participantId, matchId } = req.body;
//     const participant = parseInt(participantId);
//     const match = parseInt(matchId);
//     const matches = await getAllMatches(participant, match);
//     const nextMatch = matches[0];
//     const teamId = nextMatch.teamId;
//     const checkInStatus = "ban";
//     const checkInRecord = await prisma.checkIn.upsert({
//       where: {
//         match_participant_team: {
//           participantId: participant,
//           matchId: nextMatch.id,
//           teamId: teamId,
//         },
//       },
//       update: {
//         status: checkInStatus,
//       },
//       create: {
//         status: checkInStatus,
//         matchId: nextMatch.id,
//         participantId: participant,
//         teamId: teamId,
//       },
//     });
//     res.status(200).json(checkInRecord);
//   } catch (e) {
//     console.log(e);
//     res.status(401).json({ error: e.message });
//   }
// });

app.post("/parse-schedule", upload.single("data"), async (req, res) => {
  try {
    const dataFile = req.file;
    await parseSchedule(dataFile);
    fs.unlink(dataFile.path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    res.json({ message: "success" });
  } catch (e) {
    console.log(e);
    res.status(401).json({ error: e.message });
  }
});

app.get("/teams/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const teams = await prisma.team.findMany({
      where: {
        category: category,
      },
      select: {
        id: true,
        teamName: true,
      },
    });
    res.status(200).json(teams);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

export default app;
