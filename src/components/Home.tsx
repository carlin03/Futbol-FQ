import { useState, useEffect } from 'react'
import { calcTotal, getAllMatches, formatCalendarDay } from '../data/worldcup'
import { formatLocalKickoffLabel } from '../utils/timezone'
import ForumWidget from './ForumWidget'
import FlagImg from './FlagImg'
import { IconBall, IconCalendar, IconClock } from './Icons'
interface Props {
  setPage: (p: string) => void
  predictions: Record<string, any>
  username: string
  onMatchClick?: (matchId: string) => void
}

function Countdown() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const diff = new Date('2026-06-11T16:00:00Z').getTime() - now
  if (diff <= 0) return null

  const parts = [
    { v: Math.floor(diff / 86400000), l: 'DÍAS' },
    { v: Math.floor((diff % 86400000) / 3600000), l: 'HORAS' },
    { v: Math.floor((diff % 3600000) / 60000), l: 'MIN' },
    { v: Math.floor((diff % 60000) / 1000), l: 'SEG' },
  ]

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
      {parts.map((p, i) => (
        <div key={i} className="wc-countdown-unit fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="wc-countdown-num">{String(p.v).padStart(2, '0')}</div>
          <span className="wc-countdown-label">{p.l}</span>
        </div>
      ))}
    </div>
  )
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
        <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{label}</span>
        <span style={{ color, fontWeight: 800 }}>{value}/{max}</span>
      </div>
      <div className="wc-progress-track">
        <div className="wc-progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      </div>
    </div>
  )
}

export default function Home({ setPage, predictions, username, onMatchClick }: Props) {
  const allMatches = getAllMatches()
  const totalPredictions = Object.keys(predictions).filter(k => predictions[k]).length
  const totalPoints = calcTotal(predictions)
  const pct = Math.round((totalPredictions / allMatches.length) * 100)

  const upcoming = allMatches
    .filter(m => m.status === 'upcoming')
    .sort((a, b) => a.calendarDay - b.calendarDay || a.kickoff.localeCompare(b.kickoff))
  return (
    <div style={{ padding: '20px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 36, paddingTop: 12 }}>
        <p className="wc-badge">FIFA MUNDIAL 2026</p>
        <h1 className="text-shimmer" style={{ margin: '8px 0', fontSize: 44, fontWeight: 800 }}>
          Bienvenido, {username}
        </h1>
        <p style={{ color: 'var(--text2)', maxWidth: 520, margin: '0 auto' }}>
          Predice, compite en fantasy y debate con la comunidad del Mundial.
        </p>
        <Countdown />
      </div>

      <div className="wc-stat-grid" style={{ marginBottom: 28 }}>
        {[
          { v: totalPredictions, l: 'Predicciones', c: 'var(--gold)', sub: `de ${allMatches.length}` },
          { v: totalPoints, l: 'Puntos', c: 'var(--green)', sub: 'Quiniela' },
          { v: `${pct}%`, l: 'Completado', c: 'var(--red)', sub: '' },
          { v: upcoming.length, l: 'Próximos', c: '#3b82f6', sub: 'Sin jugar' },
        ].map((s, i) => (
          <div key={i} className="wc-stat-card fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: s.c, fontFamily: 'Oswald,sans-serif' }}>{s.v}</p>
            <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.l}</p>
            {s.sub && <p style={{ margin: 0, fontSize: 10, color: 'var(--text3)' }}>{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="wc-card" style={{ borderRadius: 14, padding: 20, marginBottom: 28 }}>
        <StatBar label="Progreso de predicciones" value={totalPredictions} max={allMatches.length} color="var(--gold)" />
        <StatBar label="Partidos próximos" value={upcoming.length} max={allMatches.length} color="#3b82f6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconBall size={20} color="var(--gold)" /> Próximos partidos
            </h2>
            <button onClick={() => { localStorage.setItem('wc_groups_tab', 'calendar'); setPage('groups') }} className="wc-link-btn">Ver calendario ({upcoming.length})</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 520, overflowY: 'auto' }}>
            {upcoming.map(m => (
              <div key={m.id} onClick={() => onMatchClick?.(m.id)} className="wc-match-row fade-up" style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 6, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconCalendar size={12} /> {formatCalendarDay(m.calendarDay)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconClock size={12} /> {formatLocalKickoffLabel(m.calendarDay, m.kickoff)}</span>
                  <span>Grupo {m.group}</span>
                  {predictions[m.id] && <span style={{ color: 'var(--green)' }}>Predicho</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <FlagImg code={m.home.flag} size={28} />
                    <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>{m.home.abbr}</div>
                  </div>
                  <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: 12 }}>VS</span>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <FlagImg code={m.away.flag} size={28} />
                    <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>{m.away.abbr}</div>
                  </div>
                  <span className="wc-tag">{predictions[m.id] ? 'Editar' : 'Predecir'}</span>
                </div>
              </div>
            ))}          </div>
        </div>

        <ForumWidget username={username} compact maxPosts={4} onViewAll={() => setPage('forum')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { title: 'Mi Once Fantasy', desc: 'Arma tu 11 por día del calendario', page: 'fantasy', color: '#a855f7' },
          { title: 'Clasificación', desc: 'Ranking quiniela y fantasy', page: 'ranking', color: 'var(--gold)' },
          { title: 'Grupos', desc: 'Tablas y predicciones por grupo', page: 'groups', color: 'var(--green)' },
          { title: 'Estadísticas', desc: 'Calendario, sedes y clasificación', page: 'stats', color: '#3b82f6' },
        ].map((item, i) => (
          <div key={i} onClick={() => setPage(item.page)} className="wc-quick-card fade-up" style={{ borderColor: `${item.color}44`, animationDelay: `${i * 0.1}s` }}>
            <div style={{ width: 4, height: 32, background: item.color, borderRadius: 2, marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 800, color: item.color }}>{item.title}</h3>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text2)' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
