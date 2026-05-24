/** Hora oficial FIFA (ET, UTC-4 en verano 2026) */

export function getMatchKickoffDate(calendarDay: number, kickoff: string, month = 6, year = 2026): Date {
  const m = kickoff.match(/(\d{1,2}):(\d{2})/)
  const h = m ? parseInt(m[1], 10) : 12
  const min = m ? parseInt(m[2], 10) : 0
  const day = String(calendarDay).padStart(2, '0')
  const mon = String(month).padStart(2, '0')
  return new Date(`${year}-${mon}-${day}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00-04:00`)
}

/** Zona sede del Mundial (USA/CAN/MEX) — horario oficial FIFA */
export const HOST_TZ = 'America/New_York'

export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Día calendario sede (ET · USA/CAN/MEX).
 * Usa la fecha FIFA del partido, NO la zona horaria del navegador.
 */
export function getLocalDayFromKickoff(calendarDay: number, _kickoff?: string, month = 6): {
  month: number
  day: number
  sortKey: number
} {
  return { month, day: calendarDay, sortKey: month * 100 + calendarDay }
}

export function formatLocalDayLabel(sortKey: number): string {
  const month = Math.floor(sortKey / 100)
  const day = sortKey % 100
  const ref = getMatchKickoffDate(day, '12:00 ET', month)
  const et = ref.toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
    timeZone: HOST_TZ,
  })
  const local = ref.toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
  return `${et} ET (${local})`
}

function formatDeviceDateTime(ms: number): string {
  return new Date(ms).toLocaleString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatInHostTzWithLocal(ms: number): string {
  const et = new Date(ms).toLocaleString('es-ES', {
    timeZone: HOST_TZ,
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
  const local = formatDeviceDateTime(ms)
  return `${et} ET (${local})`
}

/** Hora del partido en zona sede (ET) */
export function formatHostKickoff(calendarDay: number, kickoff: string, month = 6): string {
  const m = kickoff.match(/(\d{1,2}:\d{2})/)
  return m ? `${m[1]} ET` : formatKickoffET(kickoff)
}

export function formatLocalKickoff(calendarDay: number, kickoff: string, month = 6): string {
  return getMatchKickoffDate(calendarDay, kickoff, month).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: HOST_TZ,
  })
}

export function formatLocalKickoffLabel(calendarDay: number, kickoff: string, month = 6): string {
  const ms = getKickoffTimestamp(calendarDay, kickoff, month)
  return formatInHostTzWithLocal(ms)
}

export function formatLocalDateTime(calendarDay: number, kickoff: string, month = 6): string {
  return getMatchKickoffDate(calendarDay, kickoff, month).toLocaleString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: HOST_TZ,
  }) + ' ET'
}

export function formatInHostTz(ms: number): string {
  return formatInHostTzWithLocal(ms)
}

export function formatKickoffET(kickoff: string): string {
  const m = kickoff.match(/(\d{1,2}:\d{2})/)
  return m ? `${m[1]} ET` : kickoff
}

export function parseKnockoutDate(date: string): { month: number; day: number } {
  const m = date.match(/(\d+)\s+(Jun|Jul)/i)
  if (!m) return { month: 6, day: 28 }
  return { month: m[2].toLowerCase().startsWith('jul') ? 7 : 6, day: parseInt(m[1], 10) }
}

export function getKickoffTimestamp(calendarDay: number, kickoff: string, month = 6): number {
  return getMatchKickoffDate(calendarDay, kickoff, month).getTime()
}
