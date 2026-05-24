import { useMemo } from 'react'
import {
  getTeamByAbbr, getPlayersByTeam, getTeamMatches, formatCalendarDay,
} from '../data/worldcup'
import { formatLocalKickoffLabel } from '../utils/timezone'
import { getFullSquad } from '../data/squadsIndex'
import FlagImg from './FlagImg'
import { IconBall, IconStats, IconUser } from './Icons'

interface Props {
  teamAbbr: string
  onBack: () => void
  onMatchClick?: (matchId: string) => void
}

const POS_LABEL = { gk: 'Porteros', def: 'Defensas', mid: 'Mediocampistas', fwd: 'Delanteros' }
const POS_COLOR = { gk: 'var(--green)', def: '#3b82f6', mid: '#a855f7', fwd: '#ef4444' }

export default function TeamDetail({ teamAbbr, onBack, onMatchClick }: Props) {
  const team = getTeamByAbbr(teamAbbr)
  const squad = getFullSquad(teamAbbr)
  const players = useMemo(() => {
    if (!team) return []
    const fromDb = getPlayersByTeam(team.name)
    if (fromDb.length >= squad.length) return fromDb
    return squad.map(s => ({
      name: s.name, flag: team.flag, team: team.name, pos: s.pos, r: s.r, days: [], calendarDays: [],
    }))
  }, [team, squad])
  const matches = useMemo(() => getTeamMatches(teamAbbr), [teamAbbr])

  const byPos = useMemo(() => {
    const map: Record<string, typeof players> = { gk: [], def: [], mid: [], fwd: [] }
    if (!team) return map
    const source = players.length ? players : squad.map(s => ({
      name: s.name, flag: team.flag, team: team.name, pos: s.pos, r: s.r, days: [], calendarDays: [],
    }))
    source.forEach(p => { map[p.pos]?.push(p) })
    Object.values(map).forEach(arr => arr.sort((a, b) => b.r - a.r))
    return map
  }, [players, squad, team])

  const avgRating = team
    ? Math.round(
      (players.length ? players : squad).reduce((a, p) => a + p.r, 0) /
      Math.max(1, (players.length ? players : squad).length)
    )
    : 0

  const starters = useMemo(() => {
    const pick = (pos: 'gk' | 'def' | 'mid' | 'fwd', n: number) => byPos[pos].slice(0, n)
    return [
      ...pick('gk', 1),
      ...pick('def', 4),
      ...pick('mid', 3),
      ...pick('fwd', 3),
    ]
  }, [byPos])

  if (!team) return null

  return (
    <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
      <button onClick={onBack} className="wc-link-btn" style={{ marginBottom: 20, fontSize: 14 }}>← Volver</button>

      <div className="wc-card fade-up" style={{ padding: 28, borderRadius: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <FlagImg code={team.flag} size={80} width={110} height={75} />
        <div style={{ flex: 1 }}>
          <h1 className="text-shimmer" style={{ margin: '0 0 8px', fontSize: 36, fontWeight: 800 }}>{team.name}</h1>
          <p style={{ margin: 0, color: 'var(--text2)', fontSize: 14 }}>{team.abbr} · FIFA WC 2026</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { v: squad.length || players.length, l: 'Jugadores', c: 'var(--gold)' },
            { v: avgRating, l: 'Media OVR', c: '#3b82f6' },
            { v: matches.length, l: 'Partidos', c: 'var(--green)' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '12px 20px', background: 'rgba(255,255,255,.04)', borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: s.c }}>{s.v}</p>
              <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase' }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Alineación tipo 4-3-3 */}
        <div className="wc-card" style={{ padding: 20, borderRadius: 14 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconBall size={18} color="var(--gold)" /> Alineación probable (4-3-3)
          </h2>
          <div className="wc-pitch" style={{ borderRadius: 12, padding: 16, minHeight: 320, position: 'relative' }}>
            {starters.map((p, i) => {
              const rows = [[50, 8], [20, 28], [40, 28], [60, 28], [80, 28], [25, 52], [50, 52], [75, 52], [25, 78], [50, 82], [75, 78]]
              const pos = rows[i] || [50, 50]
              return (
                <div key={p.name} style={{ position: 'absolute', left: `${pos[0]}%`, top: `${pos[1]}%`, transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: POS_COLOR[p.pos as keyof typeof POS_COLOR], border: '2px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <FlagImg code={team.flag} size={22} />
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 8, fontWeight: 700, background: 'rgba(0,0,0,.75)', padding: '2px 4px', borderRadius: 4, maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name.split(' ').pop()}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Calendario del equipo */}
        <div className="wc-card" style={{ padding: 20, borderRadius: 14 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>Partidos del grupo</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {matches.map(m => {
              const isHome = m.home.abbr === teamAbbr
              const opp = isHome ? m.away : m.home
              return (
                <div key={m.id} onClick={() => onMatchClick?.(m.id)} className="wc-match-row" style={{ cursor: 'pointer', padding: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 6 }}>
                    J{m.day} · {formatCalendarDay(m.calendarDay)} · {formatLocalKickoffLabel(m.calendarDay, m.kickoff)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FlagImg code={team.flag} size={22} />
                    <span style={{ fontWeight: 700, fontSize: 12 }}>{team.abbr}</span>
                    <span style={{ color: 'var(--text3)', fontSize: 11 }}>{isHome ? 'vs' : '@'}</span>
                    <FlagImg code={opp.flag} size={22} />
                    <span style={{ fontWeight: 700, fontSize: 12 }}>{opp.abbr}</span>
                    <span className="wc-tag" style={{ marginLeft: 'auto' }}>Grupo {m.group}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Plantilla completa */}
      <div className="wc-card" style={{ padding: 20, borderRadius: 14, marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconUser size={18} /> Plantilla completa
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {(['gk', 'def', 'mid', 'fwd'] as const).map(pos => (
            <div key={pos}>
              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 800, color: POS_COLOR[pos], textTransform: 'uppercase' }}>{POS_LABEL[pos]}</p>
              {byPos[pos].map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <FlagImg code={team.flag} size={20} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                  <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: 13 }}>{p.r}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Stats individuales */}
      <div className="wc-card" style={{ padding: 20, borderRadius: 14 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconStats size={18} /> Estadísticas individuales
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>
          Las estadísticas de goles, asistencias y tarjetas se activarán cuando comience el torneo (11 Jun 2026).
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {['Goles', 'Asistencias', 'Tarjetas', 'Minutos'].map(stat => (
            <div key={stat} style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,.03)', borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text3)' }}>—</p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text2)' }}>{stat}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
