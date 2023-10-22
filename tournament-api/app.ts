import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authenticate } from "./middleware/authentication";
import {
  loginRoutes,
  participantRoutes,
  registerRoutes,
  teamManagerRoutes,
  teamsRoutes,
  playersRoutes,
  categoryRoutes,
  coachesRoutes,
  imageRoutes,
} from "./routes";
import { prisma } from "./prisma";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticate);

loginRoutes(app);
registerRoutes(app);
participantRoutes(app);
teamManagerRoutes(app);
teamsRoutes(app);
playersRoutes(app);
categoryRoutes(app);
coachesRoutes(app);
imageRoutes(app);

app.get("/health-check", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.get("/db-health-check", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ message: "Database is connected" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await prisma.$disconnect();
  }
});

// app.get("/match/:id", async (req, res) => {
//   try {
//     const matchId = req.params.id;
//     const match = await prisma.match.findUnique({
//       where: {
//         id: parseInt(matchId),
//       },
//       include: {
//         HomeTeam: true,
//         AwayTeam: true,
//       },
//     });
//     res.status(200).json(match);
//   } catch (e) {
//     res.status(401).json({ error: e.message });
//   }
// });

// app.get("/match/:matchId/team/:teamId", async (req, res) => {
//   try {
//     const matchId = req.params.matchId;
//     const teamId = parseInt(req.params.teamId);
//     const match = await prisma.match.findUnique({
//       where: {
//         id: parseInt(matchId),
//       },
//       include: {
//         HomeTeam: true,
//         AwayTeam: true,
//       },
//     });
//     if (match.HomeTeam.id !== teamId && match.AwayTeam.id !== teamId) {
//       res.status(401).json({
//         error: `Team id ${teamId} does not belong to any team in match ${matchId}`,
//       });
//       return;
//     }
//     const team = await prisma.team.findUnique({
//       where: {
//         id: teamId,
//       },
//       include: {
//         Players: {
//           include: {
//             Participant: true,
//           },
//         },
//         Coaches: {
//           include: {
//             Participant: true,
//           },
//         },
//       },
//     });
//     res.status(200).json(team);
//   } catch (e) {
//     console.log(e);
//     res.status(401).json({ error: e.message });
//   }
// });

// app.get("/participant/:id/matches", async (req: any, res) => {
//   try {
//     const participantId = parseInt(req.params.id);
//     const currentMatch = parseInt(req.query.currentMatch);
//     const filteredMatches = await getAllMatches(participantId, currentMatch);
//     res.status(200).json(filteredMatches);
//   } catch (e) {
//     console.log(e);
//     res.status(401).json({ error: e.message });
//   }
// });

export default app;
