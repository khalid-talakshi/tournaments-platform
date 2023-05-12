import math
teams = [i + 1 for i in range(16)]


def numPlayInGames(numTeams):
    return numTeams - 2**(math.floor(math.log(numTeams, 2)))


def numRounds(numTeams):
    return math.floor(math.log(numTeams, 2))


def generateMatchups(teams):
    matchups = []
    while (len(teams) > 0):
        matchups.append((teams.pop(0), teams.pop()))
    return matchups


def generatePlayInGames(teams):
    numGames = numPlayInGames(len(teams))
    numTeamsForGames = 2 * numGames
    # assume teams is sorted by seed
    playInTeams = []
    for i in range(numTeamsForGames):
        playInTeams.append(teams.pop())
    playInTeams.reverse()
    teams.extend(generateMatchups(playInTeams))
    return teams


def generateBracket(teams):
    # generate play in games first
    teams = generatePlayInGames(teams)
    current_stack = teams
    next_stack = []
    while (len(current_stack) > 0):
        matchup = (current_stack.pop(0), current_stack.pop())
        next_stack.append(matchup)
    if (len(next_stack) > 1):
        return generateBracket(next_stack)
    return next_stack


print(generateBracket(teams)[0])
