import { useEffect, useState, useCallback } from 'react'
import { syncFromFootballData, getFdSyncSummary } from '../services/footballDataSync'
import { isFdConfigured, readFdMeta, type FdSyncMeta } from '../services/footballData'
import { syncLiveFromApi, buildFixtureMapping } from '../services/liveSync'
import { readSyncMeta, isApiConfigured, type LiveSyncMeta } from '../services/apiFootball'

const FD_POLL_MS = Math.max(60000, Number(import.meta.env.VITE_FD_POLL_MS || 180000))
const API_POLL_MS = Math.max(15000, Number(import.meta.env.VITE_LIVE_POLL_MS || 30000))

export type DataSource = 'football-data' | 'api-football' | 'manual'

export function useMatchDataSync(enabled = true) {
  const source: DataSource = isFdConfigured()
    ? 'football-data'
    : isApiConfigured() && !readSyncMeta().planBlocked
      ? 'api-football'
      : 'manual'

  const [fdMeta, setFdMeta] = useState<FdSyncMeta>(() => readFdMeta())
  const [apiMeta, setApiMeta] = useState<LiveSyncMeta>(() => readSyncMeta())
  const [syncing, setSyncing] = useState(false)

  const refresh = useCallback(() => {
    setFdMeta(readFdMeta())
    setApiMeta(readSyncMeta())
  }, [])

  const runSync = useCallback(async (force = false) => {
    if (syncing) return
    setSyncing(true)
    try {
      if (source === 'football-data') {
        await syncFromFootballData(force)
      } else if (source === 'api-football') {
        await syncLiveFromApi()
      }
    } catch {
      /* meta written in service */
    } finally {
      refresh()
      setSyncing(false)
    }
  }, [source, syncing, refresh])

  const runMapping = useCallback(async () => {
    if (source === 'football-data') {
      await runSync(true)
      return
    }
    if (!isApiConfigured()) return
    setSyncing(true)
    try {
      await buildFixtureMapping(true)
      await syncLiveFromApi()
    } catch {
      /* ignore */
    } finally {
      refresh()
      setSyncing(false)
    }
  }, [source, runSync, refresh])

  useEffect(() => {
    if (!enabled || source === 'manual') return

    let cancelled = false
    const boot = async () => {
      try {
        if (source === 'football-data') await syncFromFootballData(true)
        else {
          await buildFixtureMapping()
          if (!cancelled) await syncLiveFromApi()
        }
      } catch {
        refresh()
      }
    }
    boot()

    const pollMs = source === 'football-data' ? FD_POLL_MS : API_POLL_MS
    const interval = setInterval(() => {
      if (!cancelled) runSync()
    }, pollMs)

    const onExternal = () => refresh()
    window.addEventListener('wc-live-sync', onExternal)

    return () => {
      cancelled = true
      clearInterval(interval)
      window.removeEventListener('wc-live-sync', onExternal)
    }
  }, [enabled, source, runSync, refresh])

  return {
    source,
    fdMeta,
    apiMeta,
    syncing,
    runSync,
    runMapping,
    configured: source !== 'manual',
    summary: source === 'football-data' ? getFdSyncSummary() : readSyncMeta(),
  }
}

/** @deprecated alias */
export const useLiveSync = useMatchDataSync
