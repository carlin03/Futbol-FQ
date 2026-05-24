import { useState, useMemo, useEffect } from 'react'
import { calcTotal, calcTotalByDay, calcFantasyTotal, calcFantasyByDay, getAllMatches } from '../data/worldcup'
import { getLocalScheduleDays, getLocalDayLabel, getGroupJornadas } from '../data/calendar'
import FlagImg from './FlagImg'
import { fetchPredictionRanking, fetchFantasyRanking } from '../services/database'
import type { RankingEntry } from '../utils/storage'

interface Props {
  userId: string
  username: string
  predictions: Record<string, any>
  fantasyAll: Record<number, any>
}

const PODIUM_COLORS = ['var(--gold)', '#c0c0c0', '#cd7f32']
const PODIUM_HEIGHTS = [140, 110, 90]

type PhaseFilter = 'total' | 'groups' | 'knockout'

export default function Leaderboard({ userId, username, predictions, fantasyAll }: Props) {
  const [mode, setMode] = useState<'quiniela' | 'fantasy'>('quiniela')
  const [phase, setPhase] = useState<PhaseFilter>('total')
  const [selectedDay, setSelectedDay] = useState(0)
  const [searchText, setSearchText] = useState('')

  const allMatches = getAllMatches()
  const groupDays = getLocalScheduleDays('groups')
  const koDays = getLocalScheduleDays('knockout')
  const jornadas = getGroupJornadas()

  const teamFlags = useMemo(() => {
    const map = new Map<string, string>()
    allMatches.forEach(m => {
      map.set(m.home.abbr, m.home.flag)
      map.set(m.away.abbr, m.away.flag)
    })
    return map
  }, [allMatches])

  const totalPredictions = Object.keys(predictions).filter(k => predictions[k]).length

  const userQuinielaPts = selectedDay === 0
    ? calcTotal(predictions)
    : selectedDay <= 3
      ? calcTotalByDay(predictions, selectedDay)
      : calcTotal(predictions)

  const userFantasyPts = selectedDay === 0
    ? calcFantasyTotal(fantasyAll)
    : calcFantasyByDay(fantasyAll, selectedDay)

  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [rankingLoading, setRankingLoading] = useState(true)
  const [rankingError, setRankingError] = useState('')

  useEffect(() => {
    let cancelled = false
    setRankingLoading(true)
    setRankingError('')
    const load = mode === 'quiniela'
      ? fetchPredictionRanking(userId, selectedDay)
      : fetchFantasyRanking(userId, selectedDay)
    load.then(data => {
      if (!cancelled) setRanking(data)
    }).catch(err => {
      if (!cancelled) {
        setRankingError(err instanceof Error ? err.message : 'No se pudo cargar el ranking')
        setRanking([])
      }
    }).finally(() => {
      if (!cancelled) setRankingLoading(false)
    })
    return () => { cancelled = true }
  }, [mode, selectedDay, userId])

  const userPoints = mode === 'quiniela' ? userQuinielaPts : userFantasyPts
  const userRank = ranking.findIndex(r => r.isUser) + 1
  const filtered = searchText
    ? ranking.filter(r => r.username.toLowerCase().includes(searchText.toLowerCase()))
    : ranking
  const top3 = ranking.slice(0, 3)

  const dayFilters = useMemo(() => {
    if (mode === 'quiniela') {
      if (phase === 'groups') return [{ v: 0, l: 'Total grupos' }, ...jornadas.map(j => ({ v: j, l: `Jornada ${j}` }))]
      if (phase === 'knockout') return [{ v: 0, l: 'Total elim.' }]
      return [{ v: 0, l: 'Total' }, ...jornadas.map(j => ({ v: j, l: `J${j}` })), { v: -1, l: 'Elim.' }]
    }
    const days = phase === 'groups' ? groupDays : phase === 'knockout' ? koDays : [...groupDays, ...koDays]
    return [{ v: 0, l: 'Total' }, ...days.map(d => ({ v: d, l: getLocalDayLabel(d) }))]
  }, [mode, phase, groupDays, koDays, jornadas])

  return (
    <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 className="text-shimmer" style={{ margin: '0 0 8px 0', fontSize: 36, fontWeight: 800 }}>Clasificación</h1>
      <p style={{ margin: '0 0 24px 0', fontSize: 16, color: 'var(--text2)' }}>
        Ranking · Fase de grupos y eliminatorias
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { id: 'quiniela' as const, label: 'Quiniela' },
          { id: 'fantasy' as const, label: 'Fantasy' },
        ].map(m => (
          <button key={m.id} type="button" onClick={() => { setMode(m.id); setSelectedDay(0) }}
            className={`wc-filter-btn ${mode === m.id ? 'active' : ''}`}
            style={{ flex: 1, padding: '12px 16px', fontSize: 14 }}>
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['total', 'groups', 'knockout'] as const).map(p => (
          <button key={p} onClick={() => { setPhase(p); setSelectedDay(0) }} className={`wc-filter-btn ${phase === p ? 'active' : ''}`}>
            {p === 'total' ? 'Total torneo' : p === 'groups' ? 'Fase de grupos' : 'Eliminatorias'}
          </button>
        ))}
      </div>

      <div className="wc-card-gold" style={{ borderRadius: 12, padding: 20, marginBottom: 30, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: 32, fontWeight: 800, color: 'var(--gold)', fontFamily: 'Oswald, sans-serif' }}>#{userRank || '-'}</p>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Tu posición</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: 32, fontWeight: 800, color: mode === 'fantasy' ? '#a855f7' : 'var(--green)', fontFamily: 'Oswald, sans-serif' }}>{userPoints}</p>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Puntos</p>
        </div>
        {mode === 'quiniela' ? (
          <>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: 32, fontWeight: 800, color: '#3b82f6', fontFamily: 'Oswald, sans-serif' }}>{totalPredictions}</p>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Predicciones</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: 32, fontWeight: 800, color: 'var(--red)', fontFamily: 'Oswald, sans-serif' }}>{Math.round((totalPredictions / allMatches.length) * 100)}%</p>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Grupos</p>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: 32, fontWeight: 800, color: '#3b82f6', fontFamily: 'Oswald, sans-serif' }}>{Object.keys(fantasyAll).length}</p>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Días jugados</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: 32, fontWeight: 800, color: 'var(--gold)', fontFamily: 'Oswald, sans-serif' }}>{groupDays.length + koDays.length}</p>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Días totales</p>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', maxHeight: 100, overflowY: 'auto' }}>
        {dayFilters.map(({ v, l }) => (
          <button key={`${v}-${l}`} onClick={() => setSelectedDay(v)} className={`wc-filter-btn ${selectedDay === v ? 'active' : ''}`}>{l}</button>
        ))}
      </div>

      <input type="text" placeholder="Buscar jugador..." value={searchText} onChange={e => setSearchText(e.target.value)}
        className="wc-input" style={{ width: '100%', marginBottom: 20 }} />

      {!searchText && top3.length >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 20, marginBottom: 30, padding: '20px 0' }}>
          {[1, 0, 2].map(idx => {
            const player = top3[idx]
            if (!player) return null
            const rank = idx + 1
            return (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ width: rank === 1 ? 70 : 60, height: rank === 1 ? 70 : 60, borderRadius: '50%', background: 'rgba(255,255,255,.08)', border: `3px solid ${PODIUM_COLORS[idx]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                  <FlagImg code={teamFlags.get(player.favTeam) || player.favTeam} size={32} />
                </div>
                <p style={{ margin: '0 0 4px 0', fontSize: 12, fontWeight: 700, color: player.isUser ? 'var(--gold)' : 'var(--text)' }}>{player.username}</p>
                <div style={{ background: PODIUM_COLORS[idx], borderRadius: '8px 8px 0 0', width: rank === 1 ? 90 : 80, height: PODIUM_HEIGHTS[idx], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 16 }}>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#000', fontFamily: 'Oswald, sans-serif' }}>{rank}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 14, fontWeight: 800, color: 'rgba(0,0,0,.7)' }}>{player.points} pts</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {rankingLoading ? (
          <p style={{ margin: 0, padding: 24, textAlign: 'center', color: 'var(--text2)' }}>Cargando ranking…</p>
        ) : rankingError ? (
          <p style={{ margin: 0, padding: 24, textAlign: 'center', color: 'var(--red)', fontSize: 14 }}>
            {rankingError}
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ margin: 0, padding: 24, textAlign: 'center', color: 'var(--text2)', fontSize: 14 }}>
            Aún no hay jugadores en el ranking. Regístrate e inicia sesión para aparecer con 0 pts.
          </p>
        ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--gold)' }}>
              <th style={{ padding: '12px', textAlign: 'center', color: 'var(--gold)', fontWeight: 700, width: 50 }}>#</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--gold)', fontWeight: 700 }}>Jugador</th>
              <th style={{ padding: '12px', textAlign: 'center', color: 'var(--gold)', fontWeight: 700 }}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((player, i) => {
              const globalRank = ranking.findIndex(r => r.username === player.username) + 1
              return (
                <tr key={player.userId} style={{ borderBottom: '1px solid rgba(255,255,255,.05)', background: player.isUser ? 'rgba(245,200,66,.1)' : i % 2 === 0 ? 'rgba(255,255,255,.02)' : 'transparent' }}>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: globalRank <= 3 ? PODIUM_COLORS[globalRank - 1] : 'var(--text2)' }}>{globalRank}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FlagImg code={teamFlags.get(player.favTeam) || player.favTeam} size={20} />
                      <span style={{ fontWeight: player.isUser ? 800 : 600, color: player.isUser ? 'var(--gold)' : 'var(--text)' }}>
                        {player.username} {player.isUser && '(Tú)'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 800, color: player.isUser ? 'var(--gold)' : 'var(--text)', fontFamily: 'Oswald, sans-serif', fontSize: 16 }}>{player.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        )}
      </div>
    </div>
  )
}
