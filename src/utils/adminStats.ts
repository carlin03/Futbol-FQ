export const PAGE_LABELS: Record<string, string> = {
  home: 'Inicio',
  groups: 'Grupos',
  quiniela: 'Quiniela',
  fantasy: 'Mi Once',
  ranking: 'Ranking',
  stats: 'Stats',
  forum: 'Foro',
  profile: 'Perfil',
  match: 'Partido',
}

export function formatDuration(minutes: number): string {
  if (minutes < 1) return '< 1 min'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `Hace ${days}d`
}

export function getSessionDuration(loginTime: string): string {
  const mins = Math.floor((Date.now() - new Date(loginTime).getTime()) / 60000)
  return formatDuration(mins)
}

export function getTopPageLabel(pageVisits: Record<string, number>): string {
  const entries = Object.entries(pageVisits)
  if (!entries.length) return '—'
  entries.sort((a, b) => b[1] - a[1])
  return PAGE_LABELS[entries[0][0]] || entries[0][0]
}
