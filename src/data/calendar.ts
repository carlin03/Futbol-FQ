import { getAllMatches, type Match } from './worldcup'
import { KNOCKOUT_MATCHES, type KnockoutMatch } from './knockout'
import {
  getLocalDayFromKickoff, formatLocalDayLabel, parseKnockoutDate, getKickoffTimestamp, formatInHostTz,
} from '../utils/timezone'

export type SchedulePhase = 'groups' | 'knockout'

export type GroupScheduleItem = {
  kind: 'group'
  phase: 'groups'
  match: Match
  month: number
  kickoff: string
  localKey: number
  ts: number
}

export type KnockoutScheduleItem = {
  kind: 'knockout'
  phase: 'knockout'
  match: KnockoutMatch
  month: number
  day: number
  kickoff: string
  localKey: number
  ts: number
}

export type ScheduleItem = GroupScheduleItem | KnockoutScheduleItem

export function buildFullSchedule(phase: 'all' | SchedulePhase = 'all'): ScheduleItem[] {
  const items: ScheduleItem[] = []

  if (phase !== 'knockout') {
    getAllMatches().forEach(match => {
      const local = getLocalDayFromKickoff(match.calendarDay, match.kickoff, 6)
      items.push({
        kind: 'group',
        phase: 'groups',
        match,
        month: 6,
        kickoff: match.kickoff,
        localKey: local.sortKey,
        ts: getKickoffTimestamp(match.calendarDay, match.kickoff, 6),
      })
    })
  }

  if (phase !== 'groups') {
    KNOCKOUT_MATCHES.forEach(match => {
      const { month, day } = parseKnockoutDate(match.date)
      const kickoff = match.kickoff || '15:00 ET'
      const local = getLocalDayFromKickoff(day, kickoff, month)
      items.push({
        kind: 'knockout',
        phase: 'knockout',
        match,
        month,
        day,
        kickoff,
        localKey: local.sortKey,
        ts: getKickoffTimestamp(day, kickoff, month),
      })
    })
  }

  return items.sort((a, b) => a.ts - b.ts)
}

export function getLocalScheduleDays(phase: 'all' | SchedulePhase = 'all'): number[] {
  const keys = new Set<number>()
  buildFullSchedule(phase).forEach(i => keys.add(i.localKey))
  return Array.from(keys).sort((a, b) => a - b)
}

export function groupScheduleByLocalDay(phase: 'all' | SchedulePhase = 'all') {
  const map: Record<number, ScheduleItem[]> = {}
  buildFullSchedule(phase).forEach(item => {
    if (!map[item.localKey]) map[item.localKey] = []
    map[item.localKey].push(item)
  })
  Object.values(map).forEach(arr => arr.sort((a, b) => a.ts - b.ts))
  return map
}

export function isKnockoutLocalKey(key: number): boolean {
  return buildFullSchedule('knockout').some(i => i.localKey === key)
}

export function getLocalDayLabel(key: number): string {
  return formatLocalDayLabel(key)
}

export function getFirstKickoffMsForLocalDay(localKey: number): number | null {
  const items = buildFullSchedule('all').filter(i => i.localKey === localKey)
  if (!items.length) return null
  return Math.min(...items.map(i => i.ts))
}

/** Cierre fantasy: 2 h antes del primer partido del día sede (ET) */
export function getFantasyDeadlineMs(localKey: number): number | null {
  const first = getFirstKickoffMsForLocalDay(localKey)
  if (first == null) return null
  return first - 2 * 60 * 60 * 1000
}

export function isFantasyLocked(localKey: number, now = Date.now()): boolean {
  const deadline = getFantasyDeadlineMs(localKey)
  if (deadline == null) return false
  return now >= deadline
}

export function formatFantasyDeadline(localKey: number): string {
  const ms = getFantasyDeadlineMs(localKey)
  if (ms == null) return '—'
  return formatInHostTz(ms)
}

export function getGroupJornadas(): number[] {
  return [1, 2, 3]
}
