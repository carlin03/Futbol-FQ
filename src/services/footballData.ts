import type { MatchEvent, MatchLiveState } from '../data/matchState'

const COMP = import.meta.env.VITE_FOOTBALL_DATA_COMP || 'WC'
const SEASON = Number(import.meta.env.VITE_FOOTBALL_DATA_SEASON || 2026)

export interface FdTeam {
  id: number
  name: string
  shortName: string
  tla: string
  crest?: string
}

export interface FdMatch {
  id: number
  utcDate: string
  status: string
  matchday: number | null
  stage: string
  group: string | null
  homeTeam: FdTeam
  awayTeam: FdTeam
  score: {
    winner: string | null
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
  }
  goals?: Array<{
    minute: number
    injuryTime?: number | null
    type: string
    team: { id: number; name: string }
    scorer: { id?: number; name: string }
    assist?: { id?: number; name: string } | null
  }>
  bookings?: Array<{
    minute: number
    team: { id: number; name: string }
    player: { id?: number; name: string }
    card: string
  }>
}

export interface FdStandingRow {
  position: number
  team: FdTeam
  playedGames: number
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

export interface FdStandingGroup {
  type: string
  group: string
  table: FdStandingRow[]
}

export interface FdScorer {
  player: { id: number; name: string; nationality?: string }
  team: FdTeam
  goals: number
  assists?: number | null
  penalties?: number | null
}

export interface FdSyncMeta {
  lastSync: string | null
  lastError: string | null
  matchesUpdated: number
  mappedCount: number
  finishedCount: number
  standingsLoaded: boolean
  scorersLoaded: boolean
  configured: boolean
}

const META_KEY = 'wc_fd_meta'
const STANDINGS_KEY = 'wc_fd_standings'
const SCORERS_KEY = 'wc_fd_scorers'
const MAP_KEY = 'wc_fd_match_map'

function getBaseUrl() {
  return import.meta.env.DEV ? '/api/football-data' : '/api/football-data'
}

export function isFdConfigured(): boolean {
  return import.meta.env.VITE_FOOTBALL_DATA_ENABLED === 'true'
    || Boolean(import.meta.env.VITE_FOOTBALL_DATA_TOKEN)
}

async function fdFetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  if (!isFdConfigured()) throw new Error('Falta VITE_FOOTBALL_DATA_TOKEN en .env')

  const url = new URL(`${getBaseUrl()}${path}`, window.location.origin)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))

  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } })
  if (res.status === 429) throw new Error('Límite de peticiones football-data.org (10/min). Espera un momento.')
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`football-data ${res.status}: ${text.slice(0, 100) || res.statusText}`)
  }
  return res.json() as Promise<T>
}

export async function fetchWcMatches(): Promise<FdMatch[]> {
  const data = await fdFetch<{ matches: FdMatch[] }>(`/competitions/${COMP}/matches`, {
    season: SEASON,
  })
  return data.matches || []
}

export async function fetchWcStandings(): Promise<FdStandingGroup[]> {
  const data = await fdFetch<{ standings: FdStandingGroup[] }>(`/competitions/${COMP}/standings`, {
    season: SEASON,
  })
  return data.standings || []
}

export async function fetchWcScorers(): Promise<FdScorer[]> {
  try {
    const data = await fdFetch<{ scorers: FdScorer[] }>(`/competitions/${COMP}/scorers`, {
      season: SEASON,
      limit: 30,
    })
    return data.scorers || []
  } catch {
    return []
  }
}

export function mapFdStatus(status: string): MatchLiveState['status'] {
  if (['LIVE', 'IN_PLAY', 'PAUSED'].includes(status)) return 'live'
  if (['FINISHED', 'AWARDED'].includes(status)) return 'finished'
  return 'upcoming'
}

export function fdMatchToLiveState(fd: FdMatch): MatchLiveState {
  const status = mapFdStatus(fd.status)
  const h = fd.score.fullTime.home
  const a = fd.score.fullTime.away
  const events: MatchEvent[] = []

  fd.goals?.forEach(g => {
    events.push({
      minute: g.minute + (g.injuryTime || 0),
      type: 'goal',
      team: g.team.id === fd.homeTeam.id ? 'home' : 'away',
      player: g.scorer.name,
      detail: g.type === 'PENALTY' ? 'Penalti' : g.type === 'OWN' ? 'PP' : undefined,
    })
  })

  fd.bookings?.forEach(b => {
    events.push({
      minute: b.minute,
      type: b.card.includes('RED') ? 'red' : 'yellow',
      team: b.team.id === fd.homeTeam.id ? 'home' : 'away',
      player: b.player.name,
    })
  })

  events.sort((a, b) => a.minute - b.minute)

  return {
    status,
    result: h != null && a != null ? { h, a } : undefined,
    minute: status === 'live' ? undefined : undefined,
    events,
    updatedAt: new Date().toISOString(),
  }
}

export function readFdMeta(): FdSyncMeta {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || 'null') || defaultFdMeta()
  } catch {
    return defaultFdMeta()
  }
}

export function writeFdMeta(partial: Partial<FdSyncMeta>) {
  localStorage.setItem(META_KEY, JSON.stringify({ ...readFdMeta(), ...partial }))
}

function defaultFdMeta(): FdSyncMeta {
  return {
    lastSync: null,
    lastError: null,
    matchesUpdated: 0,
    mappedCount: 0,
    finishedCount: 0,
    standingsLoaded: false,
    scorersLoaded: false,
    configured: isFdConfigured(),
  }
}

export function readFdStandings(): FdStandingGroup[] {
  try {
    return JSON.parse(localStorage.getItem(STANDINGS_KEY) || '[]')
  } catch {
    return []
  }
}

export function writeFdStandings(data: FdStandingGroup[]) {
  localStorage.setItem(STANDINGS_KEY, JSON.stringify(data))
}

export function readFdScorers(): FdScorer[] {
  try {
    return JSON.parse(localStorage.getItem(SCORERS_KEY) || '[]')
  } catch {
    return []
  }
}

export function writeFdScorers(data: FdScorer[]) {
  localStorage.setItem(SCORERS_KEY, JSON.stringify(data))
}

export function readFdMatchMap(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(MAP_KEY) || '{}')
  } catch {
    return {}
  }
}

export function writeFdMatchMap(map: Record<string, number>) {
  localStorage.setItem(MAP_KEY, JSON.stringify(map))
}

/** GROUP_A -> A */
export function fdGroupToLocal(group: string): string {
  return group.replace('GROUP_', '')
}

export function getFdGroupTable(groupId: string): FdStandingRow[] | null {
  const g = `GROUP_${groupId}`
  const block = readFdStandings().find(s => s.group === g && s.type === 'TOTAL')
  return block?.table || null
}

export function dispatchDataUpdated() {
  window.dispatchEvent(new CustomEvent('wc-live-sync'))
}
