import { getUsers, getPredictions, getFantasyAll, getSession, type User } from './storage'
import { calcTotal, calcFantasyTotal, getAllMatches } from '../data/worldcup'
import { getAllMatchLiveStates } from '../data/matchState'
import { getForumPosts } from './forum'

export interface UserMeta {
  userId: string
  createdAt: string
  lastActive: string
  lastLogin: string
  loginCount: number
  totalMinutes: number
  pageVisits: Record<string, number>
}

const META_KEY = 'wc_user_meta'

export const PAGE_LABELS: Record<string, string> = {
  home: 'Inicio',
  groups: 'Grupos',
  quiniela: 'Quiniela',
  fantasy: 'Mi Once',
  ranking: 'Ranking',
  stats: 'Stats',
  forum: 'Foro',
  profile: 'Perfil',
}

function readMeta(): Record<string, UserMeta> {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeMeta(data: Record<string, UserMeta>) {
  localStorage.setItem(META_KEY, JSON.stringify(data))
}

export function ensureUserMeta(userId: string): UserMeta {
  const all = readMeta()
  if (!all[userId]) {
    all[userId] = {
      userId,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      loginCount: 0,
      totalMinutes: 0,
      pageVisits: {},
    }
    writeMeta(all)
  }
  return all[userId]
}

export function recordLogin(userId: string) {
  const all = readMeta()
  const m = ensureUserMeta(userId)
  m.lastLogin = new Date().toISOString()
  m.lastActive = m.lastLogin
  m.loginCount += 1
  all[userId] = m
  writeMeta(all)
  sessionStart = Date.now()
}

let sessionStart = Date.now()

export function trackPageVisit(page: string) {
  const session = getSession()
  if (!session) return
  const basePage = page.startsWith('match_') ? 'match' : page.startsWith('team_') ? 'groups' : page
  const all = readMeta()
  const m = ensureUserMeta(session.userId)
  const now = Date.now()
  m.totalMinutes += Math.round((now - sessionStart) / 60000)
  sessionStart = now
  m.lastActive = new Date().toISOString()
  m.pageVisits[basePage] = (m.pageVisits[basePage] || 0) + 1
  all[session.userId] = m
  writeMeta(all)
}

export function getUserMeta(userId: string): UserMeta {
  return ensureUserMeta(userId)
}

export function getTopPage(meta: UserMeta): string {
  const entries = Object.entries(meta.pageVisits)
  if (!entries.length) return '—'
  entries.sort((a, b) => b[1] - a[1])
  return PAGE_LABELS[entries[0][0]] || entries[0][0]
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

export interface AdminUserRow {
  user: User
  meta: UserMeta
  predictions: number
  fantasyDays: number
  quinielaPts: number
  fantasyPts: number
  topPage: string
}

export function getAdminUserRows(): AdminUserRow[] {
  return getUsers().map(user => {
    const meta = getUserMeta(user.id)
    const preds = getPredictions(user.id)
    const fantasy = getFantasyAll(user.id)
    return {
      user,
      meta,
      predictions: Object.keys(preds).filter(k => preds[k]).length,
      fantasyDays: Object.keys(fantasy).length,
      quinielaPts: calcTotal(preds),
      fantasyPts: calcFantasyTotal(fantasy),
      topPage: getTopPage(meta),
    }
  })
}

export function getAdminStats() {
  const rows = getAdminUserRows()
  const liveStates = getAllMatchLiveStates()
  const liveCount = Object.values(liveStates).filter(s => s.status === 'live').length
  const finishedCount = Object.values(liveStates).filter(s => s.status === 'finished').length
  const totalPreds = rows.reduce((a, r) => a + r.predictions, 0)
  const totalFantasy = rows.reduce((a, r) => a + r.fantasyDays, 0)
  const forumPosts = getForumPosts().length

  const pageTotals: Record<string, number> = {}
  rows.forEach(r => {
    Object.entries(r.meta.pageVisits).forEach(([p, c]) => {
      pageTotals[p] = (pageTotals[p] || 0) + c
    })
  })
  const topPages = Object.entries(pageTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([p, c]) => ({ page: PAGE_LABELS[p] || p, count: c }))

  const activeToday = rows.filter(r => {
    const diff = Date.now() - new Date(r.meta.lastActive).getTime()
    return diff < 86400000
  }).length

  return {
    totalUsers: getUsers().length,
    activeToday,
    totalPreds,
    totalFantasy,
    forumPosts,
    liveCount,
    finishedCount,
    totalMatches: getAllMatches().length,
    topPages,
    rows,
  }
}

export function deleteUser(userId: string) {
  const users = getUsers().filter(u => u.id !== userId)
  localStorage.setItem('wc_users', JSON.stringify(users))
  localStorage.removeItem(`wc_preds_${userId}`)
  localStorage.removeItem(`wc_fantasy_${userId}`)
  localStorage.removeItem(`wc_profile_${userId}`)
  const meta = readMeta()
  delete meta[userId]
  writeMeta(meta)
}

export function adminUpdateUser(userId: string, data: Partial<User>) {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx < 0) return
  users[idx] = { ...users[idx], ...data }
  localStorage.setItem('wc_users', JSON.stringify(users))
}

export function seedDemoUserMeta() {
  getUsers().forEach(u => ensureUserMeta(u.id))
}
