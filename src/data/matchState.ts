import { getCachedMatchStates, loadMatchStates, saveMatchState } from '../services/database'
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

export { loadMatchStates }

export function getMatchLiveState(matchId: string): MatchLiveState | null {
  return getCachedMatchStates()[matchId] || null
}

export function setMatchLiveState(matchId: string, state: MatchLiveState) {
  const payload = { ...state, updatedAt: new Date().toISOString() }
  saveMatchState(matchId, payload).catch(err => console.error('match_states save:', err))
}

export function getAllMatchLiveStates(): Record<string, MatchLiveState> {
  return getCachedMatchStates()
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
