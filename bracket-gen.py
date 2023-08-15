import math

def numPlayInGames(numTeams):
    return numTeams - 2**(math.floor(math.log(numTeams, 2)))

def numRounds(numTeams):
    return math.floor(math.log(numTeams, 2))

def generateMatchups(teams):
    matchups = []
    while(len(teams) > 0):
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



print(generatePlayInGames(teams))
