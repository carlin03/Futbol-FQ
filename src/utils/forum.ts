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

const KEY = 'wc_forum_v2'

export function getForumPosts(): ForumPost[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
    const legacy = localStorage.getItem('wc_forum')
    if (legacy) {
      const old = JSON.parse(legacy) as { id: string; username: string; text: string; timestamp: number; likes: number }[]
      const migrated: ForumPost[] = old.map(p => ({
        ...p,
        likes: Array(p.likes).fill('legacy'),
        comments: [],
      }))
      saveForumPosts(migrated)
      return migrated
    }
    return []
  } catch {
    return []
  }
}

export function saveForumPosts(posts: ForumPost[]) {
  localStorage.setItem(KEY, JSON.stringify(posts))
}

export function addPost(username: string, text: string): ForumPost[] {
  const posts = getForumPosts()
  const post: ForumPost = {
    id: `p_${Date.now()}`,
    username,
    text,
    timestamp: Date.now(),
    likes: [],
    comments: [],
  }
  const updated = [post, ...posts]
  saveForumPosts(updated)
  return updated
}

export function toggleLike(postId: string, username: string): ForumPost[] {
  const posts = getForumPosts().map(p => {
    if (p.id !== postId) return p
    const has = p.likes.includes(username)
    return { ...p, likes: has ? p.likes.filter(u => u !== username) : [...p.likes, username] }
  })
  saveForumPosts(posts)
  return posts
}

export function addComment(postId: string, username: string, text: string): ForumPost[] {
  const posts = getForumPosts().map(p => {
    if (p.id !== postId) return p
    return {
      ...p,
      comments: [...p.comments, { id: `c_${Date.now()}`, username, text, timestamp: Date.now() }],
    }
  })
  saveForumPosts(posts)
  return posts
}

export function deletePost(postId: string, username: string): ForumPost[] {
  const posts = getForumPosts().filter(p => !(p.id === postId && p.username === username))
  saveForumPosts(posts)
  return posts
}
