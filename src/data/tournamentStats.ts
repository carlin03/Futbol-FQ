/** Estadísticas por partido — se rellenan al finalizar cada encuentro */
export interface MatchEventStats {
  matchId: string
  group: string
  homeAbbr: string
  awayAbbr: string
  calendarDay: number
  goalsHome: number
  goalsAway: number
  yellowCards: number
  redCards: number
  fouls: number
  corners: number
  offsides: number
  shotsHome: number
  shotsAway: number
  possessionHome: number
  possessionAway: number
}

export interface TournamentEventStats {
  goals: number
  yellowCards: number
  redCards: number
  fouls: number
  corners: number
  offsides: number
  cleanSheets: number
}

export interface PlayerEventStat {
  name: string
  team: string
  flag: string
  value: number
}

export const TOURNAMENT_STATS: TournamentEventStats = {
  goals: 0,
  yellowCards: 0,
  redCards: 0,
  fouls: 0,
  corners: 0,
  offsides: 0,
  cleanSheets: 0,
}

export const TOP_GOALSCORERS: PlayerEventStat[] = []

/** Plantilla vacía por partido — Stats muestra estructura lista para datos en vivo */
export function createEmptyMatchStats(
  matchId: string,
  group: string,
  homeAbbr: string,
  awayAbbr: string,
  calendarDay: number
): MatchEventStats {
  return {
    matchId, group, homeAbbr, awayAbbr, calendarDay,
    goalsHome: 0, goalsAway: 0,
    yellowCards: 0, redCards: 0, fouls: 0, corners: 0, offsides: 0,
    shotsHome: 0, shotsAway: 0,
    possessionHome: 50, possessionAway: 50,
  }
}

export function getEventStatsSummary() {
  return {
    ...TOURNAMENT_STATS,
    avgGoalsPerMatch: 0,
    avgCardsPerMatch: 0,
    avgFoulsPerMatch: 0,
    avgCornersPerMatch: 0,
  }
}
