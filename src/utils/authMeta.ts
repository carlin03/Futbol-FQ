export interface AuthUserMeta {
  email?: string
  username?: string
  favTeam?: string
}

export function authMetaFromUser(user: {
  email?: string
  user_metadata?: Record<string, unknown>
}): AuthUserMeta {
  const meta = user.user_metadata || {}
  return {
    email: user.email,
    username: meta.username != null ? String(meta.username) : undefined,
    favTeam: meta.fav_team != null ? String(meta.fav_team) : undefined,
  }
}
