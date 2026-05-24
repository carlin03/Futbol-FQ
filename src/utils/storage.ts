import { calcTotal, calcTotalByDay, calcFantasyTotal, calcFantasyByDay } from '../data/worldcup'
import { seedDemoUserMeta } from './adminStats'

export interface User {
  id: string
  username: string
  email: string
  password: string
  favTeam: string
}

export interface Session {
  userId: string
  username: string
  favTeam: string
  loginTime: string
}

export interface Prediction {
  pick: '1' | 'X' | '2'
  homeScore?: number | null
  awayScore?: number | null
}

export interface FantasyLineup {
  formation: string
  players: Record<string, { name: string; flag: string; team: string; pos: string; r: number }>
  subs?: Record<string, { name: string; flag: string; team: string; pos: string; r: number }>
  captain?: string
}

/** Sube este número para forzar borrado total en todos los dispositivos (local + Vercel). */
export const STORAGE_VERSION = 3
const VERSION_KEY = 'wc_storage_version'

export function clearAllAppData() {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('wc_')) keys.push(k)
  }
  keys.forEach(k => localStorage.removeItem(k))
}

function applyFreshStorage() {
  clearAllAppData()
  localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION))
  localStorage.setItem('wc_users', JSON.stringify([]))
  seedDemoUserMeta()
}

export function initStorage() {
  const storedVersion = parseInt(localStorage.getItem(VERSION_KEY) || '0', 10)
  if (storedVersion !== STORAGE_VERSION) {
    applyFreshStorage()
    return
  }

  const users = getUsers()
  if (users.length === 0) {
    localStorage.setItem('wc_users', JSON.stringify([]))
    seedDemoUserMeta()
  } else {
    seedDemoUserMeta()
  }
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.trim().toLowerCase())
}

export function resetPasswordByEmail(email: string, newPassword: string): boolean {
  const users = getUsers()
  const idx = users.findIndex(u => u.email.toLowerCase() === email.trim().toLowerCase())
  if (idx < 0) return false
  users[idx].password = newPassword
  localStorage.setItem('wc_users', JSON.stringify(users))
  return true
}

export function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem('wc_users') || '[]')
  } catch {
    return []
  }
}

export function getSession(): Session | null {
  try {
    const s = localStorage.getItem('wc_session')
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

export function setSession(session: Session) {
  localStorage.setItem('wc_session', JSON.stringify(session))
  localStorage.setItem('wc_user', session.username)
  localStorage.setItem('wc_fav', session.favTeam)
}

export function clearSession() {
  localStorage.removeItem('wc_session')
  localStorage.removeItem('wc_user')
  localStorage.removeItem('wc_fav')
}

function predsKey(userId: string) {
  return `wc_preds_${userId}`
}

function fantasyKey(userId: string) {
  return `wc_fantasy_${userId}`
}

export function getPredictions(userId: string): Record<string, Prediction> {
  try {
    return JSON.parse(localStorage.getItem(predsKey(userId)) || '{}')
  } catch {
    return {}
  }
}

export function setPredictions(userId: string, preds: Record<string, Prediction>) {
  localStorage.setItem(predsKey(userId), JSON.stringify(preds))
}

export function getFantasyAll(userId: string): Record<number, FantasyLineup> {
  try {
    return JSON.parse(localStorage.getItem(fantasyKey(userId)) || '{}')
  } catch {
    return {}
  }
}

export function getFantasyDay(userId: string, day: number): FantasyLineup | null {
  return getFantasyAll(userId)[day] || null
}

export function setFantasyDay(userId: string, day: number, lineup: FantasyLineup) {
  const all = getFantasyAll(userId)
  all[day] = lineup
  localStorage.setItem(fantasyKey(userId), JSON.stringify(all))
}

export interface RankingEntry {
  userId: string
  username: string
  favTeam: string
  points: number
  isUser?: boolean
}

export function getPredictionRanking(userId: string, day = 0): RankingEntry[] {
  const users = getUsers()
  const list = users.map(u => {
    const preds = getPredictions(u.id)
    const points = day === 0 ? calcTotal(preds) : calcTotalByDay(preds, day)
    return { userId: u.id, username: u.username, favTeam: u.favTeam, points, isUser: u.id === userId }
  })
  list.sort((a, b) => b.points - a.points)
  return list
}

export function getFantasyRanking(userId: string, day = 0): RankingEntry[] {
  const users = getUsers()
  const list = users.map(u => {
    const fantasy = getFantasyAll(u.id)
    const points = day === 0 ? calcFantasyTotal(fantasy) : calcFantasyByDay(fantasy, day)
    return { userId: u.id, username: u.username, favTeam: u.favTeam, points, isUser: u.id === userId }
  })
  list.sort((a, b) => b.points - a.points)
  return list
}

export interface UserProfile {
  bio: string
  displayName: string
  avatarColor: string
}

function profileKey(userId: string) {
  return `wc_profile_${userId}`
}

export function getUserProfile(userId: string, fallbackUsername = '', fallbackFav = ''): UserProfile {
  try {
    const p = JSON.parse(localStorage.getItem(profileKey(userId)) || 'null')
    if (p) return p
  } catch { /* ignore */ }
  return {
    bio: '',
    displayName: fallbackUsername,
    avatarColor: '#f5c842',
  }
}

export function saveUserProfile(userId: string, profile: UserProfile) {
  localStorage.setItem(profileKey(userId), JSON.stringify(profile))
}

export function updateUser(userId: string, data: Partial<User & UserProfile>) {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx >= 0) {
    if (data.favTeam) users[idx].favTeam = data.favTeam
    if (data.email) users[idx].email = data.email
    localStorage.setItem('wc_users', JSON.stringify(users))
  }
  const profile = getUserProfile(userId)
  saveUserProfile(userId, {
    ...profile,
    displayName: data.displayName ?? profile.displayName,
    bio: data.bio ?? profile.bio,
    avatarColor: data.avatarColor ?? profile.avatarColor,
  })
  const session = getSession()
  if (session?.userId === userId) {
    setSession({
      ...session,
      username: data.displayName ?? session.username,
      favTeam: data.favTeam ?? session.favTeam,
    })
  }
}

export function hashPassword(pass: string): string {
  let h = 0
  for (let i = 0; i < pass.length; i++) h = ((h << 5) - h + pass.charCodeAt(i)) | 0
  return `h${Math.abs(h)}`
}
