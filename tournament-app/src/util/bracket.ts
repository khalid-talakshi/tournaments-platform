/* eslint-disable @typescript-eslint/no-explicit-any */
// interface MatchType {
//   id: number;
//   nextMatchId: number | null;
//   startTime: string;
//   state: string;
//   participants: Array<any>;
// }

export const numPlayInRounds = (teams: Array<any>): number => {
  return teams.length - Math.pow(2, Math.floor(Math.log2(teams.length)));
};

export const createPlayInGames = (teams: Array<any>): Array<any> => {
  // n = number of play in games
  // take bottom 2 * n teams and create matchups
  const numPlayInGames = numPlayInRounds(teams);
  const numTeamsToMatchup = 2 * numPlayInGames;
  const startPoint = teams.length - numTeamsToMatchup;
  const matchUpTeams = teams.splice(startPoint, numTeamsToMatchup);
  const matchups: Array<any> = [];
  while (matchUpTeams.length > 0) {
    const team1 = matchUpTeams.shift();
    const team2 = matchUpTeams.pop();
    matchups.push([team1, team2]);
  }
  return teams.concat(matchups);
};

export const createBracket = (teams: Array<any>): Array<any> => {
  const playIns = createPlayInGames(teams);
  const currentStack = playIns;
  const nextStack: Array<any> = [];
  while (currentStack.length > 0) {
    const team1 = currentStack.shift();
    const team2 = currentStack.pop();
    nextStack.push([team1, team2]);
  }
  if (nextStack.length > 1) {
    return createBracket(nextStack);
  }
  return nextStack[0];
};

export const createParticipants = (teams: Array<any>) => {
  return teams.map((team, idx) => {
    return {
      id: idx,
      name: team,
    };
  });
};

// 1. create play in games
// 2. create match or walk in game for each play in game (walk out for teams with byes)
// 3. use bracket algorithim to create flattened list of matches, along with bracket
// 3a. for each match
// 3ai. pop front and back match
// 3ai1 if both are walk in matches, create match based on particpants
// 3ai2. if one is walk in match, create match where walk in is determined but other is tbd
// 3ai3. if both are matches, create match where both are tbd
// 3aii. create matchup for those matches
// 3aiii. push matchu to next stack
// 3aiv. if next stack is greater than 1, repeat 3a
// 4. maintain a stack of matches including created matches (flat list)
// 5. return flat match list

export const createRoundOne = (matches: Array<any>): Array<any> => {
  // assume matches are either single participants or a match (array of participants)
  return matches.map((match, idx) => {
    if (Array.isArray(match)) {
      const team1 = match[0];
      const team2 = match[1];
      const newMatch = {
        id: idx,
        nextMatchId: null,
        startTime: "",
        state: "SCHEDULED",
        participants: [team1, team2],
        tournamentRoundText: `1`,
      };
      return newMatch;
    } else {
      const newMatch = {
        id: idx,
        nextMatchId: null,
        startTime: "",
        state: "WALK_OVER",
        participants: [match],
      };
      return newMatch;
    }
  });
};

export const createBracketDS2 = (
  roundOne: Array<any>,
  res: Array<any> = [],
  roundNum = 2
): Array<any> => {
  const currentStack = roundOne;
  const nextStack: Array<any> = [];
  res = res.concat(currentStack);
  let maxId = res.length;
  while (currentStack.length > 0) {
    const initialMatch = {
      id: maxId,
      nextMatchId: null,
      startTime: "",
      state: "SCHEDULED",
      participants: [],
      tournamentRoundText: `${roundNum}`,
    };
    const match1 = currentStack.shift();
    const match2 = currentStack.pop();
    match1.nextMatchId = initialMatch.id;
    match2.nextMatchId = initialMatch.id;
    if (match1.state === "WALK_OVER") {
      initialMatch.participants.push(match1.participants[0]);
    }
    if (match2.state === "WALK_OVER") {
      initialMatch.participants.push(match2.participants[0]);
    }
    nextStack.push(initialMatch);
    maxId++;
  }
  if (nextStack.length > 1) {
    return createBracketDS2(nextStack, res, roundNum + 1);
  }
  res.push(nextStack[0]);
  return res;
};
