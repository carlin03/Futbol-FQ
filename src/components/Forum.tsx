import { useState } from 'react'
import {
  getForumPosts, addPost, toggleLike, addComment, deletePost, type ForumPost,
} from '../utils/forum'
import { IconForum, IconLike, IconComment, IconTrash } from './Icons'

interface Props {
  username: string
}

export default function Forum({ username }: Props) {
  const [posts, setPosts] = useState<ForumPost[]>(() => getForumPosts())
  const [newPost, setNewPost] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const handlePost = () => {
    if (!newPost.trim()) return
    setPosts(addPost(username, newPost.trim()))
    setNewPost('')
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
                  <button onClick={() => setPosts(deletePost(post.id, username))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                    <IconTrash size={16} />
                  </button>
                )}
              </div>
              <p style={{ margin: '0 0 14px', lineHeight: 1.6 }}>{post.text}</p>
              <div style={{ display: 'flex', gap: 20 }}>
                <button onClick={() => setPosts(toggleLike(post.id, username))} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: liked ? 'var(--red)' : 'var(--text2)', fontWeight: 600, fontSize: 13 }}>
                  <IconLike filled={liked} color={liked ? 'var(--red)' : 'var(--text2)'} /> {post.likes.length} Me gusta
                </button>
                <button onClick={() => setReplyTo(replyTo === post.id ? null : post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)', fontWeight: 600, fontSize: 13 }}>
                  <IconComment /> {post.comments.length} Comentarios
                </button>
              </div>
              {post.comments.length > 0 && (
                <div style={{ marginTop: 16, padding: 14, background: 'rgba(255,255,255,.03)', borderRadius: 10 }}>
                  {post.comments.map(c => (
                    <div key={c.id} style={{ marginBottom: 10, fontSize: 13 }}>
                      <strong style={{ color: 'var(--gold)' }}>{c.username}</strong>
                      <span style={{ color: 'var(--text3)', fontSize: 10, marginLeft: 8 }}>{new Date(c.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                      <p style={{ margin: '4px 0 0' }}>{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
              {replyTo === post.id && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Escribe un comentario..." className="wc-input" style={{ flex: 1 }} />
                  <button onClick={() => { if (replyText.trim()) { setPosts(addComment(post.id, username, replyText.trim())); setReplyText(''); setReplyTo(null) } }} className="wc-btn-gold">Enviar</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
