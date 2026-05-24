import { useMemo, useState, useEffect } from 'react'
import { getAllMatches } from '../data/worldcup'
import { KNOCKOUT_MATCHES } from '../data/knockout'
import { formatLocalKickoffLabel, parseKnockoutDate } from '../utils/timezone'

export type TickerSegment = {
  text: string
  type?: 'live' | 'gold' | 'white' | 'breaking'
}

const PROMO_TOP: TickerSegment[] = [
  { text: 'MUNDIAL 2026', type: 'gold' },
  { text: '#FQ26 TENDENCIA', type: 'breaking' },
  { text: 'QUINIELA · PUNTOS AUTO', type: 'white' },
  { text: 'FANTASY DISPONIBLE', type: 'gold' },
  { text: '48 SELECCIONES · 104 PARTIDOS', type: 'white' },
]

const PROMO_BOTTOM: TickerSegment[] = [
  { text: 'ESPAÑA vs FRANCIA', type: 'white' },
  { text: 'ARG vs BRA', type: 'gold' },
  { text: 'FASE DE GRUPOS · 11–27 JUNIO', type: 'white' },
  { text: 'RANKING EN VIVO', type: 'gold' },
  { text: 'FORO FQ26 ABIERTO', type: 'white' },
  { text: 'MI ONCE · PLANTILLAS REALES', type: 'gold' },
]

function buildSegments(): { top: TickerSegment[]; bottom: TickerSegment[] } {
  const all = getAllMatches()
  const live = all.filter(m => m.status === 'live')
  const finished = all.filter(m => m.status === 'finished').slice(-6)
  const upcoming = all.filter(m => m.status === 'upcoming').slice(0, 6)

  const liveSegs: TickerSegment[] = live.map(m => ({
    text: m.result
      ? `${m.home.abbr} ${m.result.h}-${m.result.a} ${m.away.abbr} · EN VIVO`
      : `${m.home.abbr} vs ${m.away.abbr} · EN VIVO`,
    type: 'live' as const,
  }))

  const resultSegs: TickerSegment[] = finished.map(m => ({
    text: `FINAL · ${m.home.abbr} ${m.result!.h}-${m.result!.a} ${m.away.abbr} · G${m.group}`,
    type: 'gold' as const,
  }))

  const upcomingSegs: TickerSegment[] = upcoming.map(m => ({
    text: `${m.home.abbr} vs ${m.away.abbr} · ${formatLocalKickoffLabel(m.calendarDay, m.kickoff)}`,
    type: 'white' as const,
  }))

  const koSegs: TickerSegment[] = KNOCKOUT_MATCHES.slice(0, 5).map(k => {
    const { month, day } = parseKnockoutDate(k.date)
    return {
      text: `${k.round.toUpperCase()} · ${formatLocalKickoffLabel(day, k.kickoff, month)}`,
      type: 'breaking' as const,
    }
  })

  const top: TickerSegment[] = [
    ...liveSegs,
    ...PROMO_TOP,
    ...upcomingSegs.slice(0, 4),
    ...resultSegs.slice(-2),
  ]

  const bottom: TickerSegment[] = [
    ...liveSegs,
    ...resultSegs,
    ...PROMO_BOTTOM,
    ...upcomingSegs,
    ...koSegs,
  ]

  return { top, bottom }
}

export function useTickerItems() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick(n => n + 1), 12000)
    const onSync = () => setTick(n => n + 1)
    window.addEventListener('wc-live-sync', onSync)
    return () => {
      clearInterval(interval)
      window.removeEventListener('wc-live-sync', onSync)
    }
  }, [])

  return useMemo(() => buildSegments(), [tick])
}
