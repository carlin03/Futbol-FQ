import type { MatchEvent, MatchLiveState } from '../data/matchState'

const LEAGUE = Number(import.meta.env.VITE_API_FOOTBALL_LEAGUE || 1)
const SEASON = Number(import.meta.env.VITE_API_FOOTBALL_SEASON || 2026)

export interface ApiFootballFixture {
  fixture: {
    id: number
    date: string
    status: { short: string; long: string; elapsed: number | null }
  }
  league: { id: number; season: number; round: string }
  teams: {
    home: { id: number; name: string; winner: boolean | null }
    away: { id: number; name: string; winner: boolean | null }
  }
  goals: { home: number | null; away: number | null }
  score: {
    fulltime: { home: number | null; away: number | null }
    halftime: { home: number | null; away: number | null }
  }
}

export interface ApiFootballEvent {
  time: { elapsed: number | null; extra: number | null }
  team: { id: number; name: string }
  player: { id: number | null; name: string | null }
  type: string
  detail: string
  comments: string | null
}

export interface LiveSyncMeta {
  lastSync: string | null
  lastError: string | null
  mappedCount: number
  liveCount: number
  apiConfigured: boolean
  /** Plan gratis: temporada 2026 no incluida */
  planBlocked?: boolean
}

const META_KEY = 'wc_live_api_meta'
const MAP_KEY = 'wc_api_fixture_map'

function getBaseUrl(): string {
  if (import.meta.env.DEV) return '/api/football'
  return import.meta.env.VITE_API_FOOTBALL_PROXY || '/api/football'
}

export function isApiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_API_FOOTBALL_KEY)
}

export function getLeagueConfig() {
  return { league: LEAGUE, season: SEASON }
}

async function apiFetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  if (!isApiConfigured()) {
    throw new Error('Falta VITE_API_FOOTBALL_KEY en .env')
  }

  const url = new URL(`${getBaseUrl()}${path}`, window.location.origin)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))

  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text.slice(0, 120) || res.statusText}`)
  }

  const json = await res.json()
  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(Object.values(json.errors).join(' · '))
  }
  return json as T
}

export async function fetchSeasonFixtures(): Promise<ApiFootballFixture[]> {
  const data = await apiFetch<{ response: ApiFootballFixture[] }>('/fixtures', {
    league: LEAGUE,
    season: SEASON,
  })
  return data.response || []
}

export async function fetchLiveFixtures(): Promise<ApiFootballFixture[]> {
  const data = await apiFetch<{ response: ApiFootballFixture[] }>('/fixtures', {
    league: LEAGUE,
    season: SEASON,
    status: '1H-HT-2H-ET-P-BT-LIVE',
  })
  return data.response || []
}

export async function fetchFixturesByDate(date: string): Promise<ApiFootballFixture[]> {
  const data = await apiFetch<{ response: ApiFootballFixture[] }>('/fixtures', {
    league: LEAGUE,
    season: SEASON,
    date,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  return data.response || []
}

export async function fetchFixtureEvents(fixtureId: number): Promise<ApiFootballEvent[]> {
  const data = await apiFetch<{ response: ApiFootballEvent[] }>('/fixtures/events', {
    fixture: fixtureId,
  })
  return data.response || []
}

export function readFixtureMap(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(MAP_KEY) || '{}')
  } catch {
    return {}
  }
}

export function writeFixtureMap(map: Record<string, number>) {
  localStorage.setItem(MAP_KEY, JSON.stringify(map))
}

export function readSyncMeta(): LiveSyncMeta {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || 'null') || defaultMeta()
  } catch {
    return defaultMeta()
  }
}

export function writeSyncMeta(meta: Partial<LiveSyncMeta>) {
  const prev = readSyncMeta()
  localStorage.setItem(META_KEY, JSON.stringify({ ...prev, ...meta }))
}

function defaultMeta(): LiveSyncMeta {
  return {
    lastSync: null,
    lastError: null,
    mappedCount: 0,
    liveCount: 0,
    apiConfigured: isApiConfigured(),
    planBlocked: false,
  }
}

export function isPlanSeasonBlocked(message: string): boolean {
  const m = message.toLowerCase()
  return m.includes('free plan') || m.includes('do not have access to this season')
}

export function translateApiError(message: string): string {
  if (isPlanSeasonBlocked(message)) {
    return 'Plan Free de API-Football: el Mundial 2026 no está incluido (solo temporadas 2022–2024). Usa la edición manual abajo o contrata un plan de pago.'
  }
  return message
}

const LIVE_STATUS = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT'])
const FINISHED_STATUS = new Set(['FT', 'AET', 'PEN'])

export function mapApiStatus(short: string): MatchLiveState['status'] {
  if (LIVE_STATUS.has(short)) return 'live'
  if (FINISHED_STATUS.has(short)) return 'finished'
  return 'upcoming'
}

export function mapApiEvent(ev: ApiFootballEvent, homeName: string): MatchEvent | null {
  const minute = ev.time.elapsed ?? 0
  const isHome = normalize(ev.team.name) === normalize(homeName)
  const team = isHome ? 'home' : 'away'

  if (ev.type === 'Goal') {
    return { minute, type: 'goal', team, player: ev.player?.name || undefined, detail: ev.detail }
  }
  if (ev.type === 'Card' && ev.detail === 'Yellow Card') {
    return { minute, type: 'yellow', team, player: ev.player?.name || undefined }
  }
  if (ev.type === 'Card' && (ev.detail === 'Red Card' || ev.detail === 'Second Yellow card')) {
    return { minute, type: 'red', team, player: ev.player?.name || undefined }
  }
  if (ev.type === 'subst') {
    return { minute, type: 'sub', team, player: ev.player?.name || undefined, detail: ev.detail }
  }
  return null
}

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function fixtureToLiveState(fx: ApiFootballFixture, events: MatchEvent[] = []): MatchLiveState {
  const status = mapApiStatus(fx.fixture.status.short)
  const h = fx.goals.home ?? fx.score.fulltime.home ?? 0
  const a = fx.goals.away ?? fx.score.fulltime.away ?? 0
  return {
    status,
    result: status !== 'upcoming' ? { h, a } : undefined,
    minute: fx.fixture.status.elapsed ?? undefined,
    events,
    updatedAt: new Date().toISOString(),
  }
}

export function dispatchLiveUpdated() {
  window.dispatchEvent(new CustomEvent('wc-live-sync'))
}
