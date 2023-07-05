import fs from "fs";
import Papa from "papaparse";
import { prisma } from "../prisma/client";

export const parseDate = (dateString) => {
  const dateFields = dateString.split("-");
  const year = parseInt(dateFields[0]);
  const month = parseInt(dateFields[1]);
  const day = parseInt(dateFields[2]);
  return new Date(year, month - 1, day);
};

export const findOrCreateTeam = async (teamName, category) => {
  try {
    let team = await prisma.team.findUnique({
      where: {
        category_teamName: {
          category: category,
          teamName: teamName,
        },
      },
    });
    if (!team) {
      team = await prisma.team.create({
        data: {
          teamName: teamName,
          category: category,
        },
      });
      console.log(`Created team ${teamName}`);
    } else {
      console.log(`Found team ${teamName}`);
    }
    return team;
  } catch (error) {
    console.log(error);
  }
};

export const findOrCreateParticipant = async (
  participantName,
  dob,
  phoneNumber
) => {
  try {
    let participant = await prisma.participant.findFirst({
      where: {
        name: participantName,
        dob: parseDate(dob),
      },
    });
    if (!participant) {
      participant = await prisma.participant.create({
        data: {
          name: participantName,
          dob: parseDate(dob),
          phoneNumber: phoneNumber,
          userId: 0,
          email: "",
        },
      });
      console.log(`Created participant ${participantName}`);
    } else {
      console.log(`Found participant ${participantName}`);
    }
    return participant;
  } catch (error) {
    console.log(error);
  }
};

export const parseCsv = async (csv) => {
  try {
    const dataString = fs.readFileSync(csv.path, "utf8");
    const data = Papa.parse(dataString, {
      header: true,
    }).data;
    for (const item of <any[]>data) {
      const role = item.role;
      const participantName = item.name;
      const dob = item.dob;
      const jerseyNumber = parseInt(item.jersey);
      const certification = item.certification;
      const teamName = item.teamName;
      const category = item.category;
      const regNumber = parseInt(item.number);
      const phoneNumber = 0;

      const team = await findOrCreateTeam(teamName, category);
      const participant = await findOrCreateParticipant(
        participantName,
        dob,
        phoneNumber
      );

      if (role === "Coach" || role === "TM") {
        await prisma.coach.create({
          data: {
            participantId: participant.id,
            TeamId: team.id,
            certification,
            regNumber: regNumber || null,
          },
        });
        console.log("Created Coach", participantName, teamName);
      } else {
        await prisma.player.create({
          data: {
            participantId: participant.id,
            TeamId: team.id,
            number: jerseyNumber || null,
            regNumber: regNumber || null,
          },
        });
        console.log("Created Player", participantName, teamName);
      }
    }
  } catch (error) {
    console.log(error);
  }
};
