import fs from "fs";
import Papa from "papaparse";
import { prisma } from "../prisma/client";

const findTeam = async (category, teamName) => {
  const team = await prisma.team.findUnique({
    where: {
      category_teamName: {
        category,
        teamName,
      },
    },
    select: {
      id: true,
    },
  });
  return team.id || null;
};

export const parseSchedule = async (csv) => {
  const dataString = fs.readFileSync(csv.path, "utf8");
  const data = Papa.parse(dataString, {
    header: true,
  }).data;
  const cleanedData = [];
  for (const item of <any[]>data) {
    const matchId = parseInt(item.game);
    const category = item.category;
    const homeTeam = item.homeTeam;
    const awayTeam = item.awayTeam;
    const venue = item.venue;
    const gameType = item.gameType;
    const field = item.field;

    const homeTeamId = await findTeam(category, homeTeam);
    const awayTeamId = await findTeam(category, awayTeam);

    cleanedData.push({
      matchId,
      category,
      homeTeamId,
      awayTeamId,
      venue,
      gameType,
      field,
    });
  }

  for (const regMatch of cleanedData) {
    const match = await prisma.match.findUnique({
      where: {
        id: regMatch.matchId,
      },
    });
    if (!match) {
      await prisma.match.create({
        data: {
          id: regMatch.matchId,
          category: regMatch.category,
          homeTeamId: regMatch.homeTeamId,
          awayTeamId: regMatch.awayTeamId,
          venue: regMatch.venue,
          gameType: regMatch.gameType,
          field: regMatch.field,
        },
      });
      console.log("created match", regMatch.matchId);
    } else {
      console.log("match already exists", regMatch.matchId);
    }
  }
};
