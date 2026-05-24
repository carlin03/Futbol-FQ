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

const DEMO_USERS: User[] = [
  { id: 'user_admin', username: 'admin', email: 'admin@fq26.com', password: 'admin123', favTeam: 'MEX' },
  { id: 'user_jugador', username: 'jugador', email: 'jugador@fq26.com', password: '123456', favTeam: 'ARG' },
  { id: 'user_cr7', username: 'CR7Fan', email: 'cr7@fq26.com', password: '123456', favTeam: 'POR' },
  { id: 'user_messi', username: 'MessiForEver', email: 'messi@fq26.com', password: '123456', favTeam: 'ARG' },
  { id: 'user_brazil', username: 'FuriaBrazil', email: 'brazil@fq26.com', password: '123456', favTeam: 'BRA' },
  { id: 'user_eng', username: 'ThreeLions', email: 'eng@fq26.com', password: '123456', favTeam: 'ENG' },
  { id: 'user_fra', username: 'LesBleus', email: 'fra@fq26.com', password: '123456', favTeam: 'FRA' },
  { id: 'user_ger', username: 'DieManschaft', email: 'ger@fq26.com', password: '123456', favTeam: 'GER' },
  { id: 'user_esp', username: 'LaRoja', email: 'esp@fq26.com', password: '123456', favTeam: 'ESP' },
  { id: 'user_ned', username: 'OranjeArmy', email: 'ned@fq26.com', password: '123456', favTeam: 'NED' },
]

function seedDemoPredictions(userId: string, picks: Record<string, { pick: '1' | 'X' | '2'; homeScore?: number; awayScore?: number }>) {
  const key = predsKey(userId)
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(picks))
  }
}

function seedDemoFantasy(userId: string, day: number, lineup: FantasyLineup) {
  const all = getFantasyAll(userId)
  if (!all[day]) {
    all[day] = lineup
    localStorage.setItem(fantasyKey(userId), JSON.stringify(all))
  }
}

export function initStorage() {
  const users = getUsers()
  if (users.length === 0) {
    localStorage.setItem('wc_users', JSON.stringify(DEMO_USERS))
    seedDemoData()
  }
  seedDemoUserMeta()
  const legacyUser = localStorage.getItem('wc_user')
  let session = getSession()
  if (legacyUser && !session) {
    const u = getUsers().find(x => x.username === legacyUser)
    if (u) {
      const s: Session = { userId: u.id, username: u.username, favTeam: u.favTeam || localStorage.getItem('wc_fav') || '', loginTime: new Date().toISOString() }
      setSession(s)
      session = s
    }
  }
  const legacyPreds = localStorage.getItem('wc_preds')
  if (legacyPreds && session?.userId) {
    const key = predsKey(session.userId)
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, legacyPreds)
    }
  }
}

function seedDemoData() {
  seedDemoPredictions('user_cr7', {
    A1: { pick: '1', homeScore: 2, awayScore: 1 },
    A2: { pick: 'X', homeScore: 1, awayScore: 1 },
    A3: { pick: '1', homeScore: 2, awayScore: 0 },
    B1: { pick: '1', homeScore: 1, awayScore: 0 },
    C1: { pick: '1', homeScore: 3, awayScore: 1 },
    D1: { pick: 'X', homeScore: 1, awayScore: 1 },
    E1: { pick: '1', homeScore: 2, awayScore: 1 },
    F1: { pick: '1', homeScore: 2, awayScore: 0 },
  })
  seedDemoPredictions('user_messi', {
    A1: { pick: 'X', homeScore: 1, awayScore: 1 },
    A2: { pick: '2', homeScore: 0, awayScore: 2 },
    A3: { pick: '1', homeScore: 3, awayScore: 1 },
    B1: { pick: 'X', homeScore: 0, awayScore: 0 },
    C1: { pick: '1', homeScore: 2, awayScore: 0 },
    G1: { pick: '1', homeScore: 1, awayScore: 0 },
    H1: { pick: '1', homeScore: 2, awayScore: 1 },
  })
  seedDemoPredictions('user_brazil', {
    A1: { pick: '1', homeScore: 1, awayScore: 0 },
    C1: { pick: '1', homeScore: 4, awayScore: 0 },
    C2: { pick: '1', homeScore: 2, awayScore: 1 },
    D1: { pick: '1', homeScore: 2, awayScore: 0 },
    I1: { pick: '1', homeScore: 3, awayScore: 0 },
  })
  seedDemoPredictions('user_eng', {
    A1: { pick: '2', homeScore: 0, awayScore: 1 },
    L1: { pick: '1', homeScore: 2, awayScore: 0 },
    L2: { pick: '1', homeScore: 1, awayScore: 0 },
    F1: { pick: 'X', homeScore: 1, awayScore: 1 },
  })
  seedDemoPredictions('user_fra', {
    A3: { pick: '1', homeScore: 1, awayScore: 0 },
    I1: { pick: '1', homeScore: 2, awayScore: 0 },
    I2: { pick: '1', homeScore: 3, awayScore: 1 },
  })
  seedDemoPredictions('user_ger', {
    E1: { pick: '1', homeScore: 3, awayScore: 0 },
    E2: { pick: '1', homeScore: 2, awayScore: 1 },
    E3: { pick: 'X', homeScore: 1, awayScore: 1 },
  })
  seedDemoPredictions('user_esp', {
    H1: { pick: '1', homeScore: 2, awayScore: 0 },
    H2: { pick: '1', homeScore: 1, awayScore: 0 },
    H3: { pick: 'X', homeScore: 2, awayScore: 2 },
  })
  seedDemoPredictions('user_ned', {
    F1: { pick: '1', homeScore: 2, awayScore: 1 },
    F2: { pick: 'X', homeScore: 0, awayScore: 0 },
    F3: { pick: '1', homeScore: 1, awayScore: 0 },
  })

  const sampleLineup: FantasyLineup = {
    formation: '4-3-3',
    captain: 'Mbappé',
    players: {
      p1: { name: 'Guillermo Ochoa', flag: 'mx', team: 'México', pos: 'gk', r: 87 },
      p2: { name: 'Héctor Moreno', flag: 'mx', team: 'México', pos: 'def', r: 83 },
      p3: { name: 'Thiago Silva', flag: 'br', team: 'Brasil', pos: 'def', r: 85 },
      p4: { name: 'Van Dijk', flag: 'nl', team: 'Países Bajos', pos: 'def', r: 90 },
      p5: { name: 'Rüdiger', flag: 'de', team: 'Alemania', pos: 'def', r: 87 },
      p6: { name: 'Rodri', flag: 'es', team: 'España', pos: 'mid', r: 92 },
      p7: { name: 'Bellingham', flag: 'gb-eng', team: 'Inglaterra', pos: 'mid', r: 91 },
      p8: { name: 'Pedri', flag: 'es', team: 'España', pos: 'mid', r: 91 },
      p9: { name: 'Mbappé', flag: 'fr', team: 'Francia', pos: 'fwd', r: 95 },
      p10: { name: 'Messi', flag: 'ar', team: 'Argentina', pos: 'fwd', r: 93 },
      p11: { name: 'Vinicius Jr.', flag: 'br', team: 'Brasil', pos: 'fwd', r: 93 },
    },
  }
  ;['user_cr7', 'user_messi', 'user_brazil'].forEach(id => seedDemoFantasy(id, 11, sampleLineup))
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
