import type { MatchLineup, LineupPlayer } from '../data/worldcup'
import { getFullSquad } from '../data/squadsIndex'

const FORMATION = '4-3-3'

function pickLineup(abbr: string): MatchLineup {
  const squad = getFullSquad(abbr)
  const byPos = { gk: [] as typeof squad, def: [] as typeof squad, mid: [] as typeof squad, fwd: [] as typeof squad }
  squad.forEach(p => byPos[p.pos].push(p))
  Object.values(byPos).forEach(arr => arr.sort((a, b) => b.r - a.r))

  const starters: LineupPlayer[] = [
    ...byPos.gk.slice(0, 1),
    ...byPos.def.slice(0, 4),
    ...byPos.mid.slice(0, 3),
    ...byPos.fwd.slice(0, 3),
  ].map((p, i) => ({ name: p.name, number: i + 1, pos: p.pos }))

  const used = new Set(starters.map(s => s.name))
  const rest = squad.filter(p => !used.has(p.name))
  const subs: LineupPlayer[] = [
    ...rest.filter(p => p.pos === 'gk').slice(0, 1),
    ...rest.filter(p => p.pos === 'def').slice(0, 2),
    ...rest.filter(p => p.pos === 'mid').slice(0, 2),
    ...rest.filter(p => p.pos === 'fwd').slice(0, 2),
  ].map((p, i) => ({ name: p.name, number: 12 + i, pos: p.pos }))

  return { formation: FORMATION, starters, subs }
}

export function buildMatchLineup(homeAbbr: string, awayAbbr: string) {
  return { home: pickLineup(homeAbbr), away: pickLineup(awayAbbr) }
}

export function buildTeamLineup(abbr: string): MatchLineup {
  return pickLineup(abbr)
}
