import { getAllMatches, type Match } from '../data/worldcup'
import { setMatchLiveState, getMatchLiveState } from '../data/matchState'
import { apiTeamMatchesAbbr } from '../data/apiTeamMap'
import {
  fetchSeasonFixtures,
  fetchLiveFixtures,
  fetchFixturesByDate,
  fetchFixtureEvents,
  readFixtureMap,
  writeFixtureMap,
  writeSyncMeta,
  readSyncMeta,
  fixtureToLiveState,
  mapApiEvent,
  dispatchLiveUpdated,
  isApiConfigured,
  isPlanSeasonBlocked,
  translateApiError,
  type ApiFootballFixture,
} from './apiFootball'

function sameCalendarDay(isoDate: string, calendarDay: number, month = 6): boolean {
  const d = new Date(isoDate)
  return d.getUTCFullYear() === 2026 && d.getUTCMonth() + 1 === month && d.getUTCDate() === calendarDay
}

function matchApiFixture(ourMatch: Match, fixtures: ApiFootballFixture[]): ApiFootballFixture | undefined {
  return fixtures.find(fx => {
    const homeOk = apiTeamMatchesAbbr(fx.teams.home.name, ourMatch.home.abbr)
    const awayOk = apiTeamMatchesAbbr(fx.teams.away.name, ourMatch.away.abbr)
    if (!homeOk || !awayOk) return false
    return sameCalendarDay(fx.fixture.date, ourMatch.calendarDay)
  })
}

export async function buildFixtureMapping(force = false): Promise<number> {
  if (readSyncMeta().planBlocked) return readSyncMeta().mappedCount

  const existing = readFixtureMap()
  if (!force && Object.keys(existing).length >= 60) {
    return Object.keys(existing).length
  }

  try {
    const fixtures = await fetchSeasonFixtures()
    const ourMatches = getAllMatches()
    const map: Record<string, number> = { ...existing }

    ourMatches.forEach(m => {
      if (map[m.id]) return
      const fx = matchApiFixture(m, fixtures)
      if (fx) map[m.id] = fx.fixture.id
    })

    writeFixtureMap(map)
    writeSyncMeta({ mappedCount: Object.keys(map).length, lastError: null })
    return Object.keys(map).length
  } catch (err) {
    const raw = err instanceof Error ? err.message : 'Error al mapear partidos'
    writeSyncMeta({
      lastError: translateApiError(raw),
      planBlocked: isPlanSeasonBlocked(raw),
    })
    throw err
  }
}

async function loadEvents(fx: ApiFootballFixture) {
  try {
    const raw = await fetchFixtureEvents(fx.fixture.id)
    return raw
      .map(ev => mapApiEvent(ev, fx.teams.home.name))
      .filter(Boolean) as import('../data/matchState').MatchEvent[]
  } catch {
    return []
  }
}

async function applyFixture(ourMatchId: string, fx: ApiFootballFixture) {
  const status = fixtureToLiveState(fx).status
  let events = getMatchLiveState(ourMatchId)?.events || []
  if (status === 'live' || status === 'finished') {
    events = await loadEvents(fx)
  }
  setMatchLiveState(ourMatchId, fixtureToLiveState(fx, events))
}

export async function syncLiveFromApi(): Promise<{ live: number; updated: number }> {
  if (!isApiConfigured()) {
    writeSyncMeta({ lastError: 'Configura VITE_API_FOOTBALL_KEY en .env y reinicia npm run dev' })
    return { live: 0, updated: 0 }
  }

  if (readSyncMeta().planBlocked) {
    return { live: 0, updated: 0 }
  }

  try {
    let map = readFixtureMap()
    if (Object.keys(map).length < 10) {
      await buildFixtureMapping(true)
      map = readFixtureMap()
    }

    const reverseMap = new Map<number, string>()
    Object.entries(map).forEach(([mid, fid]) => reverseMap.set(fid, mid))

    const liveFixtures = await fetchLiveFixtures()
    let updated = 0

    for (const fx of liveFixtures) {
      const ourId = reverseMap.get(fx.fixture.id)
      if (!ourId) continue
      await applyFixture(ourId, fx)
      updated++
    }

    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10)
    const todayFixtures = await fetchFixturesByDate(dateStr)
    for (const fx of todayFixtures) {
      const short = fx.fixture.status.short
      if (short === 'NS' || short === 'TBD') continue
      const ourId = reverseMap.get(fx.fixture.id)
      if (!ourId) continue
      const current = getMatchLiveState(ourId)
      if (current?.status === 'finished' && mapApiFinished(short)) continue
      await applyFixture(ourId, fx)
      updated++
    }

    writeSyncMeta({
      lastSync: new Date().toISOString(),
      lastError: null,
      liveCount: liveFixtures.length,
      mappedCount: Object.keys(map).length,
    })
    dispatchLiveUpdated()
    return { live: liveFixtures.length, updated }
  } catch (err) {
    const raw = err instanceof Error ? err.message : 'Error de sincronización'
    const msg = translateApiError(raw)
    writeSyncMeta({
      lastError: msg,
      planBlocked: isPlanSeasonBlocked(raw),
    })
    throw err
  }
}

function mapApiFinished(short: string) {
  return ['FT', 'AET', 'PEN'].includes(short)
}
