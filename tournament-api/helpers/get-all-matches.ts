import { prisma } from "../prisma/client";
export const getAllMatches = async (participantId, currentMatch = null) => {
  // Fetch all matches for participant
  try {
    const matches = await prisma.participant.findUnique({
      where: {
        id: participantId,
      },
      select: {
        Players: {
          select: {
            Team: {
              select: {
                id: true,
                HomeMatches: currentMatch
                  ? { where: { id: { gt: currentMatch } } }
                  : true,
                AwayMatches: currentMatch
                  ? { where: { id: { gt: currentMatch } } }
                  : true,
              },
            },
          },
        },
        Coaches: {
          select: {
            Team: {
              select: {
                id: true,
                HomeMatches: currentMatch
                  ? { where: { id: { gt: currentMatch } } }
                  : true,
                AwayMatches: currentMatch
                  ? { where: { id: { gt: currentMatch } } }
                  : true,
              },
            },
          },
        },
      },
    });

    // add team id to all player matches
    const playerMatchesWithTeamId = matches.Players.map((player) => {
      const teamId = player.Team.id;
      const homeMatches = player.Team.HomeMatches.map((match) => {
        return { ...match, teamId };
      });
      const awayMatches = player.Team.AwayMatches.map((match) => {
        return { ...match, teamId };
      });
      return [...homeMatches, ...awayMatches];
    });

    // add team id to all coach matches
    const coachMatchesWithTeamId = matches.Coaches.map((coach) => {
      const teamId = coach.Team.id;
      const homeMatches = coach.Team.HomeMatches.map((match) => {
        return { ...match, teamId };
      });
      const awayMatches = coach.Team.AwayMatches.map((match) => {
        return { ...match, teamId };
      });
      return [...homeMatches, ...awayMatches];
    });

    // flatten all arrays
    const flattenPlayerMatches = playerMatchesWithTeamId.flat();
    const flattenCoachMatches = coachMatchesWithTeamId.flat();

    // combine them
    const flattenAllMatches = [
      ...flattenPlayerMatches,
      ...flattenCoachMatches,
    ].sort((a, b) => a.id - b.id);

    // remove duplicates
    const filteredMatches = [flattenAllMatches[0]];
    const restOfMatches = flattenAllMatches.slice(1);

    for (let match of restOfMatches) {
      let equal = false;
      for (let filteredMatch of filteredMatches) {
        if (match.id === filteredMatch.id) {
          equal = true;
        }
      }
      if (!equal) {
        filteredMatches.push(match);
      }
    }
    return filteredMatches;
  } catch (error) {
    throw error;
  }
};
