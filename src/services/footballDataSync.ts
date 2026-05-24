import { getAllMatches, type Match } from '../data/worldcup'
import { setMatchLiveState } from '../data/matchState'
import { apiTeamMatchesAbbr } from '../data/apiTeamMap'
import {
  fetchWcMatches,
  fetchWcStandings,
  fetchWcScorers,
  fdMatchToLiveState,
  readFdMatchMap,
  writeFdMatchMap,
  writeFdMeta,
  readFdMeta,
  isFdConfigured,
  dispatchDataUpdated,
  writeFdStandings,
  writeFdScorers,
  type FdMatch,
  type FdTeam,
} from './footballData'

const MIN_SYNC_MS = 55000
const MIN_FORCE_MS = 20000
let syncInFlight: Promise<{ updated: number; finished: number; mapped: number }> | null = null
let syncCounter = 0

function sameUtcDay(iso: string, calendarDay: number, month = 6): boolean {
  const d = new Date(iso)
  return d.getUTCFullYear() === 2026 && d.getUTCMonth() + 1 === month && d.getUTCDate() === calendarDay
}

function teamMatchesApi(fd: FdTeam, abbr: string): boolean {
  if (!fd?.name) return false
  return fd.tla === abbr
    || apiTeamMatchesAbbr(fd.name, abbr)
    || apiTeamMatchesAbbr(fd.shortName || '', abbr)
}

function findFdMatch(our: Match, list: FdMatch[]): FdMatch | undefined {
  return list.find(fd => {
    if (!fd.homeTeam?.name || !fd.awayTeam?.name) return false
    if (fd.stage !== 'GROUP_STAGE') return false
    const homeOk = teamMatchesApi(fd.homeTeam, our.home.abbr)
    const awayOk = teamMatchesApi(fd.awayTeam, our.away.abbr)
    if (!homeOk || !awayOk) return false
    return sameUtcDay(fd.utcDate, our.calendarDay)
  })
}

async function runSync(force = false): Promise<{ updated: number; finished: number; mapped: number }> {
  const meta = readFdMeta()
  const elapsed = meta.lastSync ? Date.now() - new Date(meta.lastSync).getTime() : Infinity
  const minWait = force ? MIN_FORCE_MS : MIN_SYNC_MS
  if (elapsed < minWait) {
    if (force) {
      throw new Error(`Espera ${Math.ceil((minWait - elapsed) / 1000)} s antes de volver a sincronizar (límite 10 req/min).`)
    }
    return { updated: meta.matchesUpdated, finished: meta.finishedCount, mapped: meta.mappedCount }
  }

  const fdMatches = await fetchWcMatches()
  const ours = getAllMatches()
  const map: Record<string, number> = { ...readFdMatchMap() }
  let updated = 0
  let finished = 0
  let mapped = 0

  ours.forEach(m => {
    const fd = findFdMatch(m, fdMatches)
    if (!fd) return
    map[m.id] = fd.id
    mapped++

    const state = fd.status
    if (state === 'SCHEDULED' || state === 'TIMED' || state === 'POSTPONED') return

    setMatchLiveState(m.id, fdMatchToLiveState(fd))
    updated++
    if (state === 'FINISHED' || state === 'AWARDED') finished++
  })

  writeFdMatchMap(map)

  syncCounter++
  const fetchExtras = force || syncCounter % 3 === 1

  let standingsLoaded = meta.standingsLoaded
  let scorersLoaded = meta.scorersLoaded

  if (fetchExtras) {
    try {
      const standings = await fetchWcStandings()
      writeFdStandings(standings)
      standingsLoaded = standings.length > 0
    } catch {
      /* standings optional on rate limit */
    }
    try {
      const scorers = await fetchWcScorers()
      writeFdScorers(scorers)
      scorersLoaded = scorers.length > 0
    } catch {
      /* scorers may need paid tier */
    }
  }

  writeFdMeta({
    lastSync: new Date().toISOString(),
    lastError: null,
    matchesUpdated: updated,
    mappedCount: mapped,
    finishedCount: finished,
    standingsLoaded,
    scorersLoaded,
  })

  dispatchDataUpdated()
  return { updated, finished, mapped }
}

export async function syncFromFootballData(force = false): Promise<{ updated: number; finished: number; mapped: number }> {
  if (!isFdConfigured()) {
    writeFdMeta({ lastError: 'Añade VITE_FOOTBALL_DATA_TOKEN al .env y reinicia npm run dev' })
    return { updated: 0, finished: 0, mapped: 0 }
  }

  if (syncInFlight) return syncInFlight

  syncInFlight = (async () => {
    try {
      return await runSync(force)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error football-data.org'
      writeFdMeta({ lastError: msg })
      throw err
    } finally {
      syncInFlight = null
    }
  })()

  return syncInFlight
}

export function getFdSyncSummary() {
  return readFdMeta()
}
