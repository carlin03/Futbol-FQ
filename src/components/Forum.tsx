import { useState, useEffect } from 'react'
import {
  fetchForumPosts, addForumPost, toggleForumLike, addForumComment, deleteForumPost, type ForumPost,
} from '../services/database'
import { IconForum, IconLike, IconComment, IconTrash } from './Icons'

interface Props {
  userId: string
  username: string
}

export default function Forum({ userId, username }: Props) {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    fetchForumPosts().then(setPosts).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handlePost = async () => {
    if (!newPost.trim()) return
    try {
      setPosts(await addForumPost(userId, username, newPost.trim()))
      setNewPost('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: 800, margin: '0 auto' }}>
      <h1 className="text-shimmer" style={{ margin: '0 0 8px', fontSize: 36, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconForum size={28} color="var(--gold)" /> Comunidad
      </h1>
      <p style={{ margin: '0 0 28px', color: 'var(--text2)' }}>Comparte predicciones, comenta y dale like a otros jugadores</p>

      <div className="wc-card" style={{ padding: 24, marginBottom: 28, borderRadius: 14 }}>
        <p style={{ margin: '0 0 12px', fontWeight: 700, color: 'var(--gold)' }}>{username}</p>
        <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="¿Qué piensas del Mundial?" rows={4} className="wc-input" style={{ width: '100%', marginBottom: 12 }} />
        <button onClick={handlePost} disabled={!newPost.trim()} className="wc-btn-gold">Publicar</button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text2)' }}>Cargando foro…</p>
      ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {posts.length === 0 ? (
          <div className="wc-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>No hay publicaciones aún</div>
        ) : posts.map(post => {
          const liked = post.likes.includes(username)
          return (
            <div key={post.id} className="wc-card fade-up" style={{ padding: 20, borderRadius: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--gold)' }}>{post.username}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 10 }}>{new Date(post.timestamp).toLocaleString('es-ES')}</span>
                </div>
                {post.username === username && (
                  <button onClick={() => deleteForumPost(post.id, userId).then(setPosts).catch(console.error)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                    <IconTrash size={16} />
                  </button>
                )}
              </div>
              <p style={{ margin: '0 0 14px', lineHeight: 1.6 }}>{post.text}</p>
              <div style={{ display: 'flex', gap: 20 }}>
                <button onClick={() => toggleForumLike(post.id, username).then(setPosts).catch(console.error)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: liked ? 'var(--red)' : 'var(--text2)', fontWeight: 600, fontSize: 13 }}>
                  <IconLike filled={liked} color={liked ? 'var(--red)' : 'var(--text2)'} /> {post.likes.length} Me gusta
                </button>
                <button onClick={() => setReplyTo(replyTo === post.id ? null : post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)', fontWeight: 600, fontSize: 13 }}>
                  <IconComment /> {post.comments.length} Comentarios
                </button>
              </div>
              {replyTo === post.id && (
                <div style={{ marginTop: 14 }}>
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Escribe un comentario..." rows={2} className="wc-input" style={{ width: '100%', marginBottom: 8 }} />
                  <button
                    onClick={() => {
                      if (!replyText.trim()) return
                      addForumComment(post.id, userId, username, replyText.trim())
                        .then(p => { setPosts(p); setReplyText(''); setReplyTo(null) })
                        .catch(console.error)
                    }}
                    className="wc-filter-btn active"
                    style={{ fontSize: 12 }}
                  >
                    Comentar
                  </button>
                </div>
              )}
              {post.comments.length > 0 && (
                <div style={{ marginTop: 14, paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>
                  {post.comments.map(c => (
                    <div key={c.id} style={{ marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 12 }}>{c.username}</span>
                      <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 8 }}>{new Date(c.timestamp).toLocaleString('es-ES')}</span>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text2)' }}>{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}
