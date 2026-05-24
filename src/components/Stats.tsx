import { useMemo } from 'react'
import {
  GROUPS, getAllMatches, calcTotal, PLAYER_MATCH_STATS, getAllPlayers,
} from '../data/worldcup'
import { TOURNAMENT_STATS, createEmptyMatchStats } from '../data/tournamentStats'
import { groupScheduleByLocalDay, getLocalDayLabel } from '../data/calendar'
import { formatLocalKickoffLabel } from '../utils/timezone'
import { readFdScorers } from '../services/footballData'
import FlagImg from './FlagImg'
import { IconStats, IconCalendar, IconLocation, IconBall } from './Icons'

interface Props {
  predictions: Record<string, any>
  username: string
  onMatchClick?: (matchId: string) => void
}

function computeStandings(groupId: string) {
  const group = GROUPS.find(g => g.id === groupId)!
  const teams = new Map<string, { team: typeof group.matches[0]['home']; pts: number; gf: number; ga: number; gd: number; played: number }>()

  group.matches.forEach(m => {
    ;[m.home, m.away].forEach(t => {
      if (!teams.has(t.abbr)) teams.set(t.abbr, { team: t, pts: 0, gf: 0, ga: 0, gd: 0, played: 0 })
    })
  })

  group.matches.filter(m => m.status === 'finished' && m.result).forEach(m => {
    const r = m.result!
    const h = teams.get(m.home.abbr)!
    const a = teams.get(m.away.abbr)!
    h.played++; a.played++
    h.gf += r.h; h.ga += r.a; h.gd = h.gf - h.ga
    a.gf += r.a; a.ga += r.h; a.gd = a.gf - a.ga
    if (r.h > r.a) { h.pts += 3 } else if (r.h < r.a) { a.pts += 3 } else { h.pts++; a.pts++ }
  })

  return Array.from(teams.values()).sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf)
}

export default function Stats({ predictions, username, onMatchClick }: Props) {
  const allMatches = getAllMatches()
  const scheduleByLocal = useMemo(() => groupScheduleByLocalDay('all'), [])
  const localDays = useMemo(() => Object.keys(scheduleByLocal).map(Number).sort((a, b) => a - b), [scheduleByLocal])
  const finished = allMatches.filter(m => m.status === 'finished')
  const upcoming = allMatches.filter(m => m.status !== 'finished')
  const totalPts = calcTotal(predictions)
  const predCount = Object.keys(predictions).filter(k => predictions[k]).length

  const topScorers = useMemo(() => {
    const fd = readFdScorers()
    if (fd.length) {
      return fd.slice(0, 15).map(s => ({
        name: s.player.name,
        flag: 'xx',
        team: s.team.shortName || s.team.name,
        goals: s.goals,
      }))
    }
    const goals: Record<string, { name: string; flag: string; team: string; goals: number }> = {}
    Object.values(PLAYER_MATCH_STATS).forEach(matchStats => {
      Object.entries(matchStats).forEach(([name, s]) => {
        if (!s.goals) return
        const player = getAllPlayers().find(p => p.name === name)
        if (!goals[name]) goals[name] = { name, flag: player?.flag || 'xx', team: player?.team || '', goals: 0 }
        goals[name].goals += s.goals
      })
    })
    return Object.values(goals).sort((a, b) => b.goals - a.goals).slice(0, 10)
  }, [])

  const venues = useMemo(() => {
    const map = new Map<string, { venue: string; city: string; count: number }>()
    allMatches.forEach(m => {
      const key = m.venue
      const cur = map.get(key) || { venue: m.venue, city: m.city, count: 0 }
      cur.count++
      map.set(key, cur)
    })
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [allMatches])

  const byDay = useMemo(() => {
    return localDays.map(key => ({
      key,
      label: getLocalDayLabel(key),
      count: scheduleByLocal[key].length,
      items: scheduleByLocal[key],
    }))
  }, [localDays, scheduleByLocal])

  return (
    <div style={{ padding: '20px', maxWidth: 1280, margin: '0 auto' }}>
      <h1 className="text-shimmer" style={{ margin: '0 0 8px', fontSize: 36, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconStats size={28} color="var(--gold)" /> Estadísticas
      </h1>
      <p style={{ margin: '0 0 28px', color: 'var(--text2)' }}>
        Datos del torneo · Calendario oficial FIFA WC26 · {username}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { v: 48, l: 'Selecciones', c: 'var(--gold)' },
          { v: 12, l: 'Grupos', c: '#3b82f6' },
          { v: 104, l: 'Partidos total', c: 'var(--green)' },
          { v: upcoming.length, l: 'Próximos', c: '#a855f7' },
          { v: finished.length, l: 'Finalizados', c: 'var(--red)' },
        ].map((s, i) => (
          <div key={i} className="wc-stat-card fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: s.c, fontFamily: 'Oswald,sans-serif' }}>{s.v}</p>
            <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Estadísticas de eventos del torneo */}
      <div className="wc-card fade-up" style={{ padding: 24, borderRadius: 14, marginBottom: 28 }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 800 }}>Estadísticas del torneo</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 14, marginBottom: 20 }}>
          {[
            { v: TOURNAMENT_STATS.goals, l: 'Goles', c: 'var(--green)' },
            { v: TOURNAMENT_STATS.yellowCards, l: 'Amarillas', c: '#eab308' },
            { v: TOURNAMENT_STATS.redCards, l: 'Rojas', c: 'var(--red)' },
            { v: TOURNAMENT_STATS.fouls, l: 'Faltas', c: '#f97316' },
            { v: TOURNAMENT_STATS.corners, l: 'Córners', c: '#3b82f6' },
            { v: TOURNAMENT_STATS.offsides, l: 'Fuera juego', c: 'var(--text2)' },
            { v: TOURNAMENT_STATS.cleanSheets, l: 'Portería 0', c: 'var(--gold)' },
          ].map((s, i) => (
            <div key={i} className="wc-stat-card" style={{ padding: 16 }}>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: s.c }}>{s.v}</p>
              <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>{s.l}</p>
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text2)', textAlign: 'center' }}>
          Goles, tarjetas, faltas y córners se actualizarán en vivo cuando empiece el Mundial (11 Jun 2026).
        </p>
      </div>

      {/* Stats por partido */}
      <div className="wc-card" style={{ padding: 24, borderRadius: 14, marginBottom: 28 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800 }}>Estadísticas por partido</h2>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text2)' }}>Haz clic en un partido para ver detalle oficial · Horarios en tu zona local</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 480, overflowY: 'auto' }}>
          {allMatches.map(m => {
            const st = createEmptyMatchStats(m.id, m.group, m.home.abbr, m.away.abbr, m.calendarDay)
            return (
              <div key={m.id} onClick={() => onMatchClick?.(m.id)} className="wc-match-row" style={{ cursor: 'pointer', padding: 12, color: 'var(--text)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 10, color: 'var(--text2)' }}>
                  <span>Grupo {m.group} · {formatLocalKickoffLabel(m.calendarDay, m.kickoff)}</span>
                  <span className="wc-tag">{m.status === 'upcoming' ? 'Próximo' : 'Finalizado'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <FlagImg code={m.home.flag} size={22} />
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{m.home.abbr}</span>
                  <span style={{ color: 'var(--gold)' }}>vs</span>
                  <FlagImg code={m.away.flag} size={22} />
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{m.away.abbr}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, fontSize: 9, textAlign: 'center' }}>
                  {[
                    { l: 'Goles', v: `${st.goalsHome}-${st.goalsAway}` },
                    { l: 'Amar.', v: st.yellowCards },
                    { l: 'Rojas', v: st.redCards },
                    { l: 'Faltas', v: st.fouls },
                    { l: 'Córners', v: st.corners },
                    { l: 'Pos%', v: `${st.possessionHome}-${st.possessionAway}` },
                  ].map(x => (
                    <div key={x.l} style={{ background: 'rgba(255,255,255,.04)', padding: '4px', borderRadius: 4 }}>
                      <div style={{ fontWeight: 800, color: 'var(--text)' }}>{x.v}</div>
                      <div style={{ color: 'var(--text3)' }}>{x.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        <div className="wc-card" style={{ padding: 20, borderRadius: 14 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>Tu quiniela</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ textAlign: 'center', padding: 16, background: 'rgba(245,200,66,.08)', borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: 'var(--gold)' }}>{predCount}</p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text2)' }}>Predicciones</p>
            </div>
            <div style={{ textAlign: 'center', padding: 16, background: 'rgba(34,197,94,.08)', borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: 'var(--green)' }}>{totalPts}</p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text2)' }}>Puntos</p>
            </div>
          </div>
          <div className="wc-progress-track" style={{ marginTop: 16 }}>
            <div className="wc-progress-fill" style={{ width: `${Math.round((predCount / allMatches.length) * 100)}%`, background: 'linear-gradient(90deg, var(--gold), #f59e0b)' }} />
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--text3)' }}>{Math.round((predCount / allMatches.length) * 100)}% del torneo predicho</p>
        </div>

        <div className="wc-card" style={{ padding: 20, borderRadius: 14 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconBall size={18} color="var(--gold)" /> Goleadores
          </h2>
          {topScorers.length === 0 ? (
            <p style={{ color: 'var(--text2)', fontSize: 13, margin: 0 }}>
              Sin goles registrados aún. El torneo empieza el 11 de junio de 2026.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topScorers.map((p, i) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ width: 20, fontWeight: 800, color: 'var(--text3)' }}>{i + 1}</span>
                  <FlagImg code={p.flag} size={24} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{p.name}</p>
                    <p style={{ margin: 0, fontSize: 10, color: 'var(--text2)' }}>{p.team}</p>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: 16 }}>{p.goals}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconCalendar size={18} /> Calendario por día (local · 11 Jun – 19 Jul)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {byDay.map(({ key, label, count, items }) => (
            <div key={key} className="wc-card fade-up" style={{ padding: 14, borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{label}</span>
                <span className="wc-tag">{count} partidos</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {items.slice(0, 5).map(item => item.kind === 'group' ? (
                  <div key={item.match.id} onClick={() => onMatchClick?.(item.match.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, cursor: 'pointer', color: 'var(--text)' }}>
                    <FlagImg code={item.match.home.flag} size={16} />
                    <span style={{ fontWeight: 700 }}>{item.match.home.abbr}</span>
                    <span style={{ color: 'var(--text3)' }}>vs</span>
                    <FlagImg code={item.match.away.flag} size={16} />
                    <span style={{ fontWeight: 700 }}>{item.match.away.abbr}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: 10 }}>{formatLocalKickoffLabel(item.match.calendarDay, item.match.kickoff)}</span>
                  </div>
                ) : (
                  <div key={item.match.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text2)' }}>
                    <span className="wc-tag" style={{ fontSize: 8 }}>KO</span>
                    <span style={{ fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.match.homeLabel} vs {item.match.awayLabel}</span>
                    <span style={{ color: 'var(--text3)', fontSize: 10 }}>{formatLocalKickoffLabel(item.day, item.kickoff, item.month)}</span>
                  </div>
                ))}
                {items.length > 5 && <p style={{ margin: 0, fontSize: 10, color: 'var(--text3)' }}>+{items.length - 5} más</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>
        <div>
          <h2 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 800 }}>Clasificación por grupos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {GROUPS.map(g => {
              const standings = computeStandings(g.id)
              return (
                <div key={g.id} className="wc-card" style={{ padding: 12, borderRadius: 10 }}>
                  <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 13, color: 'var(--gold)' }}>{g.name}</p>
                  <table style={{ width: '100%', fontSize: 10, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: 'var(--text3)' }}>
                        <th style={{ textAlign: 'left', padding: '2px 0' }}>#</th>
                        <th style={{ textAlign: 'left' }}>Equipo</th>
                        <th>PJ</th><th>GF</th><th>GC</th><th>PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((s, i) => (
                        <tr key={s.team.abbr}>
                          <td style={{ padding: '3px 0', color: 'var(--text3)' }}>{i + 1}</td>
                          <td style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                            <FlagImg code={s.team.flag} size={14} />
                            {s.team.abbr}
                          </td>
                          <td style={{ textAlign: 'center' }}>{s.played}</td>
                          <td style={{ textAlign: 'center' }}>{s.gf}</td>
                          <td style={{ textAlign: 'center' }}>{s.ga}</td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--gold)' }}>{s.pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h2 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconLocation size={18} /> Sedes
          </h2>
          <div className="wc-card" style={{ padding: 14, borderRadius: 12 }}>
            {venues.map(v => (
              <div key={v.venue} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{v.venue}</p>
                  <p style={{ margin: 0, fontSize: 10, color: 'var(--text2)' }}>{v.city}</p>
                </div>
                <span style={{ color: 'var(--gold)', fontWeight: 800 }}>{v.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
