import { calcTotal, calcTotalByDay, calcFantasyTotal, calcFantasyByDay, getAllMatches } from '../data/worldcup'
import { requireSupabase } from '../lib/supabase'
import { getTopPageLabel, PAGE_LABELS } from '../utils/adminStats'
import type { FantasyLineup, Prediction, RankingEntry, Session, User, UserProfile } from '../utils/storage'

export interface DbProfile {
  id: string
  username: string
  email: string
  fav_team: string
  display_name: string | null
  bio: string | null
  avatar_color: string | null
  created_at: string
  last_active: string
  last_login: string | null
  login_count: number
  total_minutes: number
  page_visits: Record<string, number>
}

function profileToUser(p: DbProfile): User {
  return {
    id: p.id,
    username: p.username,
    email: p.email,
    password: '',
    favTeam: p.fav_team,
  }
}

export async function resolveLoginEmail(login: string): Promise<string | null> {
  const sb = requireSupabase()
  const trimmed = login.trim()
  if (trimmed.includes('@')) return trimmed.toLowerCase()

  const { data, error } = await sb
    .from('profiles')
    .select('email')
    .ilike('username', trimmed)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data?.email?.toLowerCase() ?? null
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const sb = requireSupabase()
  const { data, error } = await sb
    .from('profiles')
    .select('id')
    .ilike('username', username.trim())
    .maybeSingle()
  if (error) throw new Error(error.message)
  return Boolean(data)
}

export async function signUp(email: string, password: string, username: string, favTeam: string) {
  const sb = requireSupabase()
  if (await isUsernameTaken(username)) {
    throw new Error('Este usuario ya existe')
  }
  const { data, error } = await sb.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { username: username.trim(), fav_team: favTeam },
    },
  })
  if (error) throw new Error(error.message)

  if (!data.user) {
    throw new Error('Ese email ya está registrado. Prueba iniciar sesión o usa otro email.')
  }

  const needsEmailConfirm = !data.session && data.user.identities?.length === 0
  if (needsEmailConfirm) {
    throw new Error('Ese email ya está registrado. Prueba iniciar sesión.')
  }

  if (!data.session) {
    throw new Error('Cuenta creada. Revisa tu email para confirmar y luego inicia sesión.')
  }

  return data
}

export async function signIn(emailOrUser: string, password: string) {
  const sb = requireSupabase()
  const email = await resolveLoginEmail(emailOrUser)
  if (!email) throw new Error('Usuario o contraseña incorrectos')

  const { data, error } = await sb.auth.signInWithPassword({ email, password })
  if (error) throw new Error('Usuario o contraseña incorrectos')
  return data
}

export async function signOut() {
  const sb = requireSupabase()
  const { error } = await sb.auth.signOut()
  if (error) throw new Error(error.message)
}

export async function sendPasswordReset(email: string) {
  const sb = requireSupabase()
  const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/`,
  })
  if (error) throw new Error(error.message)
}

export async function getAuthSession() {
  const sb = requireSupabase()
  const { data, error } = await sb.auth.getSession()
  if (error) throw new Error(error.message)
  return data.session
}

export async function fetchProfile(userId: string): Promise<DbProfile | null> {
  const sb = requireSupabase()
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw new Error(error.message)
  return data as DbProfile | null
}

export async function profileToSession(profile: DbProfile): Promise<Session> {
  return {
    userId: profile.id,
    username: profile.display_name || profile.username,
    favTeam: profile.fav_team,
    loginTime: profile.last_login || new Date().toISOString(),
  }
}

export async function recordLogin(userId: string) {
  const sb = requireSupabase()
  const profile = await fetchProfile(userId)
  if (!profile) return
  const { error } = await sb.from('profiles').update({
    last_login: new Date().toISOString(),
    last_active: new Date().toISOString(),
    login_count: (profile.login_count || 0) + 1,
  }).eq('id', userId)
  if (error) throw new Error(error.message)
}

export async function trackPageVisit(userId: string, page: string) {
  const sb = requireSupabase()
  const profile = await fetchProfile(userId)
  if (!profile) return
  const basePage = page.startsWith('match_') ? 'match' : page.startsWith('team_') ? 'groups' : page
  const pageVisits = { ...(profile.page_visits || {}), [basePage]: (profile.page_visits?.[basePage] || 0) + 1 }
  await sb.from('profiles').update({
    last_active: new Date().toISOString(),
    page_visits: pageVisits,
  }).eq('id', userId)
}

export async function fetchAllProfiles(): Promise<DbProfile[]> {
  const sb = requireSupabase()
  const { data, error } = await sb.from('profiles').select('*').order('username')
  if (error) throw new Error(error.message)
  return (data || []) as DbProfile[]
}

export async function fetchAllUsers(): Promise<User[]> {
  return (await fetchAllProfiles()).map(profileToUser)
}

export async function fetchPredictions(userId: string): Promise<Record<string, Prediction>> {
  const sb = requireSupabase()
  const { data, error } = await sb.from('predictions').select('match_id, pick, home_score, away_score').eq('user_id', userId)
  if (error) throw new Error(error.message)
  const out: Record<string, Prediction> = {}
  ;(data || []).forEach((row: { match_id: string; pick: '1' | 'X' | '2'; home_score: number | null; away_score: number | null }) => {
    out[row.match_id] = { pick: row.pick, homeScore: row.home_score, awayScore: row.away_score }
  })
  return out
}

export async function savePredictions(userId: string, preds: Record<string, Prediction>) {
  const sb = requireSupabase()
  const rows = Object.entries(preds)
    .filter(([, p]) => p?.pick)
    .map(([match_id, p]) => ({
      user_id: userId,
      match_id,
      pick: p.pick,
      home_score: p.homeScore ?? null,
      away_score: p.awayScore ?? null,
      updated_at: new Date().toISOString(),
    }))

  const { error: delErr } = await sb.from('predictions').delete().eq('user_id', userId)
  if (delErr) throw new Error(delErr.message)

  if (rows.length) {
    const { error } = await sb.from('predictions').insert(rows)
    if (error) throw new Error(error.message)
  }
}

export async function fetchFantasyAll(userId: string): Promise<Record<number, FantasyLineup>> {
  const sb = requireSupabase()
  const { data, error } = await sb.from('fantasy_lineups').select('*').eq('user_id', userId)
  if (error) throw new Error(error.message)
  const out: Record<number, FantasyLineup> = {}
  ;(data || []).forEach((row: { day_key: number; formation: string; players: FantasyLineup['players']; subs: FantasyLineup['subs']; captain: string | null }) => {
    out[row.day_key] = {
      formation: row.formation,
      players: row.players,
      subs: row.subs || {},
      captain: row.captain || undefined,
    }
  })
  return out
}

export async function saveFantasyDay(userId: string, day: number, lineup: FantasyLineup) {
  const sb = requireSupabase()
  const { error } = await sb.from('fantasy_lineups').upsert({
    user_id: userId,
    day_key: day,
    formation: lineup.formation,
    players: lineup.players,
    subs: lineup.subs || {},
    captain: lineup.captain || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,day_key' })
  if (error) throw new Error(error.message)
}

export async function saveFantasyAll(userId: string, all: Record<number, FantasyLineup>) {
  for (const [day, lineup] of Object.entries(all)) {
    await saveFantasyDay(userId, Number(day), lineup)
  }
}

function sortRanking(list: RankingEntry[]) {
  list.sort((a, b) => b.points - a.points || a.username.localeCompare(b.username, 'es'))
  return list
}

export async function fetchPredictionRanking(userId: string, day = 0): Promise<RankingEntry[]> {
  const profiles = await fetchAllProfiles()
  const sb = requireSupabase()
  const { data, error } = await sb.from('predictions').select('user_id, match_id, pick, home_score, away_score')
  if (error) throw new Error(error.message)

  const byUser: Record<string, Record<string, Prediction>> = {}
  ;(data || []).forEach((row: { user_id: string; match_id: string; pick: '1' | 'X' | '2'; home_score: number | null; away_score: number | null }) => {
    if (!byUser[row.user_id]) byUser[row.user_id] = {}
    byUser[row.user_id][row.match_id] = { pick: row.pick, homeScore: row.home_score, awayScore: row.away_score }
  })

  const list = profiles.map(p => {
    const preds = byUser[p.id] || {}
    const points = day === 0 ? calcTotal(preds) : calcTotalByDay(preds, day)
    return {
      userId: p.id,
      username: p.display_name || p.username,
      favTeam: p.fav_team,
      points,
      isUser: p.id === userId,
    }
  })
  return sortRanking(list)
}

export async function fetchFantasyRanking(userId: string, day = 0): Promise<RankingEntry[]> {
  const profiles = await fetchAllProfiles()
  const sb = requireSupabase()
  const { data, error } = await sb.from('fantasy_lineups').select('user_id, day_key, formation, players, subs, captain')
  if (error) throw new Error(error.message)

  const byUser: Record<string, Record<number, FantasyLineup>> = {}
  ;(data || []).forEach((row: { user_id: string; day_key: number; formation: string; players: FantasyLineup['players']; subs: FantasyLineup['subs']; captain: string | null }) => {
    if (!byUser[row.user_id]) byUser[row.user_id] = {}
    byUser[row.user_id][row.day_key] = {
      formation: row.formation,
      players: row.players,
      subs: row.subs || {},
      captain: row.captain || undefined,
    }
  })

  const list = profiles.map(p => {
    const fantasy = byUser[p.id] || {}
    const points = day === 0 ? calcFantasyTotal(fantasy) : calcFantasyByDay(fantasy, day)
    return {
      userId: p.id,
      username: p.display_name || p.username,
      favTeam: p.fav_team,
      points,
      isUser: p.id === userId,
    }
  })
  return sortRanking(list)
}

export async function fetchUserProfile(userId: string, fallbackUsername = ''): Promise<UserProfile> {
  const p = await fetchProfile(userId)
  if (!p) {
    return { bio: '', displayName: fallbackUsername, avatarColor: '#f5c842' }
  }
  return {
    bio: p.bio || '',
    displayName: p.display_name || p.username,
    avatarColor: p.avatar_color || '#f5c842',
  }
}

export async function updateUserProfile(userId: string, data: Partial<User & UserProfile>) {
  const sb = requireSupabase()
  const patch: Record<string, unknown> = {}
  if (data.favTeam != null) patch.fav_team = data.favTeam
  if (data.displayName != null) {
    patch.display_name = data.displayName
    patch.username = data.displayName
  }
  if (data.bio != null) patch.bio = data.bio
  if (data.avatarColor != null) patch.avatar_color = data.avatarColor
  if (Object.keys(patch).length) {
    const { error } = await sb.from('profiles').update(patch).eq('id', userId)
    if (error) throw new Error(error.message)
  }
}

export async function deleteUserAccount(userId: string) {
  const sb = requireSupabase()
  const { error } = await sb.from('profiles').delete().eq('id', userId)
  if (error) throw new Error(error.message)
}

export async function adminUpdateUser(userId: string, data: Partial<User>) {
  const sb = requireSupabase()
  const patch: Record<string, unknown> = {}
  if (data.username != null) {
    patch.username = data.username
    patch.display_name = data.username
  }
  if (data.email != null) patch.email = data.email
  if (data.favTeam != null) patch.fav_team = data.favTeam
  if (Object.keys(patch).length) {
    const { error } = await sb.from('profiles').update(patch).eq('id', userId)
    if (error) throw new Error(error.message)
  }
}

// --- Foro ---

export interface ForumComment {
  id: string
  username: string
  text: string
  timestamp: number
}

export interface ForumPost {
  id: string
  username: string
  text: string
  timestamp: number
  likes: string[]
  comments: ForumComment[]
}

export async function fetchForumPosts(): Promise<ForumPost[]> {
  const sb = requireSupabase()
  const { data: posts, error } = await sb.from('forum_posts').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  if (!posts?.length) return []

  const ids = posts.map((p: { id: string }) => p.id)
  const { data: comments, error: cErr } = await sb.from('forum_comments').select('*').in('post_id', ids).order('created_at')
  if (cErr) throw new Error(cErr.message)

  const commentsByPost: Record<string, ForumComment[]> = {}
  ;(comments || []).forEach((c: { id: string; post_id: string; username: string; text: string; created_at: string }) => {
    if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = []
    commentsByPost[c.post_id].push({
      id: c.id,
      username: c.username,
      text: c.text,
      timestamp: new Date(c.created_at).getTime(),
    })
  })

  return posts.map((p: { id: string; username: string; text: string; likes: string[]; created_at: string }) => ({
    id: p.id,
    username: p.username,
    text: p.text,
    timestamp: new Date(p.created_at).getTime(),
    likes: p.likes || [],
    comments: commentsByPost[p.id] || [],
  }))
}

export async function addForumPost(userId: string, username: string, text: string): Promise<ForumPost[]> {
  const sb = requireSupabase()
  const { error } = await sb.from('forum_posts').insert({ user_id: userId, username, text })
  if (error) throw new Error(error.message)
  return fetchForumPosts()
}

export async function toggleForumLike(postId: string, username: string): Promise<ForumPost[]> {
  const sb = requireSupabase()
  const { data: post, error } = await sb.from('forum_posts').select('likes').eq('id', postId).single()
  if (error) throw new Error(error.message)
  const likes: string[] = post.likes || []
  const next = likes.includes(username) ? likes.filter(u => u !== username) : [...likes, username]
  const { error: uErr } = await sb.from('forum_posts').update({ likes: next }).eq('id', postId)
  if (uErr) throw new Error(uErr.message)
  return fetchForumPosts()
}

export async function addForumComment(postId: string, userId: string, username: string, text: string): Promise<ForumPost[]> {
  const sb = requireSupabase()
  const { error } = await sb.from('forum_comments').insert({ post_id: postId, user_id: userId, username, text })
  if (error) throw new Error(error.message)
  return fetchForumPosts()
}

export async function deleteForumPost(postId: string, userId: string): Promise<ForumPost[]> {
  const sb = requireSupabase()
  const { error } = await sb.from('forum_posts').delete().eq('id', postId).eq('user_id', userId)
  if (error) throw new Error(error.message)
  return fetchForumPosts()
}

// --- Match states ---

import type { MatchLiveState } from '../data/matchState'

let matchStateCache: Record<string, MatchLiveState> = {}

export function getCachedMatchStates() {
  return matchStateCache
}

export async function loadMatchStates(): Promise<Record<string, MatchLiveState>> {
  const sb = requireSupabase()
  const { data, error } = await sb.from('match_states').select('match_id, state')
  if (error) throw new Error(error.message)
  matchStateCache = {}
  ;(data || []).forEach((row: { match_id: string; state: MatchLiveState }) => {
    matchStateCache[row.match_id] = row.state
  })
  return matchStateCache
}

export async function saveMatchState(matchId: string, state: MatchLiveState) {
  const sb = requireSupabase()
  const payload = { ...state, updatedAt: new Date().toISOString() }
  matchStateCache[matchId] = payload
  const { error } = await sb.from('match_states').upsert({
    match_id: matchId,
    state: payload,
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(error.message)
}

export async function fetchAdminStats() {
  const profiles = await fetchAllProfiles()
  const sb = requireSupabase()
  const [{ data: preds }, { data: fantasy }, forumPosts] = await Promise.all([
    sb.from('predictions').select('user_id, match_id, pick, home_score, away_score'),
    sb.from('fantasy_lineups').select('user_id, day_key, formation, players, subs, captain'),
    fetchForumPosts(),
  ])

  const predsByUser: Record<string, Record<string, Prediction>> = {}
  ;(preds || []).forEach((row: { user_id: string; match_id: string; pick: '1' | 'X' | '2'; home_score: number | null; away_score: number | null }) => {
    if (!predsByUser[row.user_id]) predsByUser[row.user_id] = {}
    predsByUser[row.user_id][row.match_id] = { pick: row.pick, homeScore: row.home_score, awayScore: row.away_score }
  })

  const fantasyByUser: Record<string, Record<number, FantasyLineup>> = {}
  ;(fantasy || []).forEach((row: { user_id: string; day_key: number; formation: string; players: FantasyLineup['players']; subs: FantasyLineup['subs']; captain: string | null }) => {
    if (!fantasyByUser[row.user_id]) fantasyByUser[row.user_id] = {}
    fantasyByUser[row.user_id][row.day_key] = {
      formation: row.formation,
      players: row.players,
      subs: row.subs || {},
      captain: row.captain || undefined,
    }
  })

  const liveStates = matchStateCache
  const liveCount = Object.values(liveStates).filter(s => s.status === 'live').length
  const finishedCount = Object.values(liveStates).filter(s => s.status === 'finished').length

  const rows = profiles.map(p => {
    const userPreds = predsByUser[p.id] || {}
    const userFantasy = fantasyByUser[p.id] || {}
    return {
      user: profileToUser(p),
      meta: {
        userId: p.id,
        createdAt: p.created_at,
        lastActive: p.last_active,
        lastLogin: p.last_login || p.created_at,
        loginCount: p.login_count,
        totalMinutes: p.total_minutes,
        pageVisits: p.page_visits || {},
      },
      predictions: Object.keys(userPreds).filter(k => userPreds[k]).length,
      fantasyDays: Object.keys(userFantasy).length,
      quinielaPts: calcTotal(userPreds),
      fantasyPts: calcFantasyTotal(userFantasy),
      topPage: getTopPageLabel(p.page_visits || {}),
    }
  })

  const pageTotals: Record<string, number> = {}
  rows.forEach(r => {
    Object.entries(r.meta.pageVisits).forEach(([pg, c]) => {
      pageTotals[pg] = (pageTotals[pg] || 0) + c
    })
  })

  const topPages = Object.entries(pageTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([page, count]) => ({ page: PAGE_LABELS[page] || page, count }))

  const activeToday = rows.filter(r => Date.now() - new Date(r.meta.lastActive).getTime() < 86400000).length

  return {
    totalUsers: profiles.length,
    activeToday,
    totalPreds: rows.reduce((a, r) => a + r.predictions, 0),
    totalFantasy: rows.reduce((a, r) => a + r.fantasyDays, 0),
    forumPosts: forumPosts.length,
    liveCount,
    finishedCount,
    totalMatches: getAllMatches().length,
    topPages,
    rows,
  }
}
