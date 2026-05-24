import { useState, useEffect } from 'react'
import {
  fetchForumPosts, addForumPost, toggleForumLike, addForumComment, deleteForumPost, type ForumPost,
} from '../services/database'
import { IconLike, IconComment, IconTrash, IconForum } from './Icons'

interface Props {
  userId: string
  username: string
  compact?: boolean
  maxPosts?: number
  onViewAll?: () => void
}

export default function ForumWidget({ userId, username, compact = false, maxPosts = 5, onViewAll }: Props) {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [newPost, setNewPost] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    fetchForumPosts().then(setPosts).catch(console.error)
  }, [])

  const visible = posts.slice(0, maxPosts)

  const handlePost = async () => {
    if (!newPost.trim()) return
    try {
      setPosts(await addForumPost(userId, username, newPost.trim()))
      setNewPost('')
    } catch (err) {
      console.error(err)
    }
  }

  const handleReply = async (postId: string) => {
    if (!replyText.trim()) return
    try {
      setPosts(await addForumComment(postId, userId, username, replyText.trim()))
      setReplyText('')
      setReplyTo(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="wc-card" style={{ borderRadius: 14, padding: compact ? 16 : 24, height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: compact ? 18 : 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconForum size={20} color="var(--gold)" /> Comunidad
        </h2>
        {onViewAll && (
          <button onClick={onViewAll} className="wc-link-btn">Ver foro</button>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <textarea
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          placeholder="Comparte tu predicción..."
          rows={compact ? 2 : 3}
          className="wc-input"
          style={{ width: '100%', resize: 'vertical', marginBottom: 8 }}
        />
        <button onClick={handlePost} disabled={!newPost.trim()} className="wc-btn-gold" style={{ opacity: newPost.trim() ? 1 : 0.5 }}>
          Publicar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: compact ? 420 : undefined, overflowY: compact ? 'auto' : undefined }}>
        {visible.length === 0 ? (
          <p style={{ color: 'var(--text2)', fontSize: 13, textAlign: 'center', padding: 20 }}>Sé el primero en publicar</p>
        ) : visible.map(post => {
          const liked = post.likes.includes(username)
          return (
            <div key={post.id} className="wc-post fade-up" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gold)' }}>{post.username}</span>
                  <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 8 }}>
                    {new Date(post.timestamp).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {post.username === username && (
                  <button onClick={() => deleteForumPost(post.id, userId).then(setPosts).catch(console.error)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                    <IconTrash size={14} />
                  </button>
                )}
              </div>
              <p style={{ margin: '0 0 10px', fontSize: 13, lineHeight: 1.5 }}>{post.text}</p>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <button onClick={() => toggleForumLike(post.id, username).then(setPosts).catch(console.error)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: liked ? 'var(--red)' : 'var(--text2)', fontSize: 12, fontWeight: 600 }}>
                  <IconLike size={14} color={liked ? 'var(--red)' : 'var(--text2)'} filled={liked} /> {post.likes.length}
                </button>
                <button onClick={() => setReplyTo(replyTo === post.id ? null : post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text2)', fontSize: 12, fontWeight: 600 }}>
                  <IconComment size={14} /> {post.comments.length}
                </button>
              </div>
              {post.comments.length > 0 && (
                <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>
                  {post.comments.slice(0, compact ? 2 : 10).map(c => (
                    <div key={c.id} style={{ marginBottom: 6, fontSize: 12 }}>
                      <strong style={{ color: 'var(--gold)' }}>{c.username}</strong> {c.text}
                    </div>
                  ))}
                </div>
              )}
              {replyTo === post.id && (
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Escribe un comentario..." className="wc-input" style={{ flex: 1, padding: '8px 10px', fontSize: 12 }} />
                  <button onClick={() => handleReply(post.id)} className="wc-btn-gold" style={{ padding: '8px 14px', fontSize: 11 }}>Enviar</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
