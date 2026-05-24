import type { Match } from './worldcup'

export interface MatchEvent {
  minute: number
  type: 'goal' | 'yellow' | 'red' | 'sub' | 'kickoff' | 'halftime' | 'fulltime'
  team: 'home' | 'away'
  player?: string
  detail?: string
}

export interface MatchLiveState {
  status: 'upcoming' | 'live' | 'finished'
  result?: { h: number; a: number }
  minute?: number
  events?: MatchEvent[]
  updatedAt?: string
}

const KEY = 'wc_match_states'

function readAll(): Record<string, MatchLiveState> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

function writeAll(data: Record<string, MatchLiveState>) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getMatchLiveState(matchId: string): MatchLiveState | null {
  return readAll()[matchId] || null
}

export function setMatchLiveState(matchId: string, state: MatchLiveState) {
  const all = readAll()
  all[matchId] = { ...state, updatedAt: new Date().toISOString() }
  writeAll(all)
}

export function getAllMatchLiveStates(): Record<string, MatchLiveState> {
  return readAll()
}

export function applyMatchOverride(match: Match): Match {
  const s = getMatchLiveState(match.id)
  if (!s) return match
  return {
    ...match,
    status: s.status,
    result: s.result ?? match.result,
  }
}
