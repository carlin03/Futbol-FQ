import { useState, useEffect } from 'react'
import { calcTotal, calcFantasyTotal, getAllMatches, GROUPS, formatCalendarDay } from '../data/worldcup'
import FlagImg from './FlagImg'
import { fetchUserProfile, updateUserProfile } from '../services/database'
import { IconUser, IconEdit, IconStats, IconTarget, IconFantasy } from './Icons'

interface Props {
  userId: string
  username: string
  favTeam: string
  email?: string
  predictions: Record<string, any>
  fantasyAll: Record<number, any>
  onBack: () => void
  onProfileUpdate?: (username: string, favTeam: string) => void
}

export default function Profile({ userId, username, favTeam, predictions, fantasyAll, onBack, onProfileUpdate }: Props) {
  const [tab, setTab] = useState<'stats' | 'edit' | 'predictions' | 'fantasy'>('stats')
  const [form, setForm] = useState({ displayName: username, bio: '', favTeam, avatarColor: '#f5c842' })
  const [saved, setSaved] = useState('')

  useEffect(() => {
    fetchUserProfile(userId, username).then(p => {
      setForm({ displayName: p.displayName || username, bio: p.bio, favTeam, avatarColor: p.avatarColor })
    }).catch(console.error)
  }, [userId, username, favTeam])

  const allMatches = getAllMatches()
  const totalPoints = calcTotal(predictions)
  const fantasyPoints = calcFantasyTotal(fantasyAll)
  const predictedMatches = Object.keys(predictions).length
  const allTeams = Array.from(new Map(GROUPS.flatMap(g => g.matches.flatMap(m => [m.home, m.away])).map(t => [t.abbr, t])).values())

  const handleSave = async () => {
    try {
      await updateUserProfile(userId, { displayName: form.displayName, bio: form.bio, favTeam: form.favTeam, avatarColor: form.avatarColor })
      setSaved('Perfil actualizado')
      onProfileUpdate?.(form.displayName, form.favTeam)
      setTimeout(() => setSaved(''), 2500)
    } catch (err) {
      console.error(err)
    }
  }

  const correctPredictions = Object.entries(predictions).filter(([id, pred]) => {
    const match = allMatches.find(m => m.id === id)
    if (!match?.result) return false
    const r = match.result.h > match.result.a ? '1' : match.result.h < match.result.a ? '2' : 'X'
    return pred.pick === r
  }).length

  const tabs = [
    { id: 'stats' as const, label: 'Estadísticas', Icon: IconStats },
    { id: 'edit' as const, label: 'Editar perfil', Icon: IconEdit },
    { id: 'predictions' as const, label: 'Predicciones', Icon: IconTarget },
    { id: 'fantasy' as const, label: 'Fantasy', Icon: IconFantasy },
  ]

  return (
    <div style={{ padding: '20px', maxWidth: 960, margin: '0 auto' }}>
      <button onClick={onBack} className="wc-link-btn" style={{ marginBottom: 20 }}>← Volver</button>

      <div className="wc-card fade-up" style={{ padding: 28, borderRadius: 16, marginBottom: 28, display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ width: 90, height: 90, borderRadius: '50%', background: form.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--gold)', flexShrink: 0 }}>
          <IconUser size={40} color="#000" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1 }}>Mi Perfil</p>
          <h1 style={{ margin: '6px 0', fontSize: 32, fontWeight: 800 }}>{form.displayName || username}</h1>
          {form.bio && <p style={{ margin: '0 0 8px', color: 'var(--text2)', fontSize: 14 }}>{form.bio}</p>}
          {form.favTeam && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FlagImg code={allTeams.find(t => t.abbr === form.favTeam)?.flag || form.favTeam} size={28} />
              <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700 }}>Equipo favorito: {form.favTeam}</span>
            </div>
          )}
        </div>
      </div>

      {saved && <p className="fade-up" style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 700, marginBottom: 16 }}>{saved}</p>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`wc-filter-btn ${tab === t.id ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <t.Icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { v: totalPoints, l: 'Puntos quiniela', c: 'var(--gold)' },
            { v: fantasyPoints, l: 'Puntos fantasy', c: '#a855f7' },
            { v: correctPredictions, l: 'Aciertos', c: 'var(--green)' },
            { v: predictedMatches, l: 'Predicciones', c: '#3b82f6' },
          ].map((s, i) => (
            <div key={i} className="wc-stat-card">
              <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: s.c, fontFamily: 'Oswald,sans-serif' }}>{s.v}</p>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', fontWeight: 700 }}>{s.l}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'edit' && (
        <div className="wc-card" style={{ padding: 28, borderRadius: 14 }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800 }}>Editar perfil</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase' }}>Nombre visible</label>
              <input value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} className="wc-input" style={{ width: '100%', marginTop: 6 }} maxLength={20} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase' }}>Bio</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="wc-input" style={{ width: '100%', marginTop: 6 }} rows={3} maxLength={120} placeholder="Cuéntanos sobre ti..." />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase' }}>Color avatar</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {['#f5c842', '#ee3349', '#00d05e', '#3b82f6', '#a855f7', '#f97316'].map(c => (
                  <button key={c} onClick={() => setForm({ ...form, avatarColor: c })} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: form.avatarColor === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase' }}>Equipo favorito</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 8, marginTop: 8, maxHeight: 200, overflowY: 'auto' }}>
                {allTeams.sort((a, b) => a.name.localeCompare(b.name)).map(t => (
                  <button key={t.abbr} onClick={() => setForm({ ...form, favTeam: t.abbr })}
                    style={{ padding: 8, borderRadius: 8, border: `2px solid ${form.favTeam === t.abbr ? 'var(--gold)' : 'var(--border)'}`, background: form.favTeam === t.abbr ? 'rgba(245,200,66,.1)' : 'transparent', cursor: 'pointer' }}>
                    <FlagImg code={t.flag} size={28} />
                    <p style={{ margin: '4px 0 0', fontSize: 9, fontWeight: 700 }}>{t.abbr}</p>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleSave} className="wc-btn-gold" style={{ marginTop: 8 }}>Guardar cambios</button>
          </div>
        </div>
      )}

      {tab === 'predictions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {Object.entries(predictions).map(([id, pred]) => {
            const match = allMatches.find(m => m.id === id)
            if (!match) return null
            return (
              <div key={id} className="wc-match-row">
                <p style={{ margin: '0 0 8px', fontSize: 11, color: 'var(--text2)' }}>Grupo {match.group}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>{match.home.abbr}</span>
                  <span style={{ color: 'var(--gold)' }}>{pred.pick === '1' ? '1' : pred.pick === 'X' ? 'X' : '2'}</span>
                  <span style={{ fontWeight: 700 }}>{match.away.abbr}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'fantasy' && (
        <div>
          {Object.keys(fantasyAll).length === 0 ? (
            <div className="wc-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>Sin onces guardados</div>
          ) : Object.entries(fantasyAll).map(([day, lineup]: [string, any]) => (
            <div key={day} className="wc-card" style={{ padding: 16, marginBottom: 16, borderRadius: 12 }}>
              <p style={{ margin: '0 0 12px', fontWeight: 800, color: '#a855f7' }}>{formatCalendarDay(Number(day))} · {lineup.formation} {lineup.captain && `· Cap: ${lineup.captain}`}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                {Object.values(lineup.players || {}).map((p: any, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: 8, background: 'rgba(255,255,255,.03)', borderRadius: 8 }}>
                    <FlagImg code={p.flag} size={28} />
                    <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 700 }}>{p.name.split(' ').pop()}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
