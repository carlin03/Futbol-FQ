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

export interface RankingEntry {
  userId: string
  username: string
  favTeam: string
  points: number
  isUser?: boolean
}

export interface UserProfile {
  bio: string
  displayName: string
  avatarColor: string
}
