import { useMemo, useState, useEffect } from 'react'
import { GROUPS, getAllMatches, formatCalendarDate } from '../data/worldcup'
import { groupScheduleByLocalDay, getLocalDayLabel } from '../data/calendar'
import { formatLocalKickoffLabel } from '../utils/timezone'
import { getFdGroupTable } from '../services/footballData'
import { apiTeamMatchesAbbr } from '../data/apiTeamMap'
import FlagImg from './FlagImg'

import KnockoutBracket from './KnockoutBracket'

import { IconGroups, IconLive, IconTrophy, IconBall } from './Icons'



interface Props {

  onMatchClick?: (matchId: string, mode?: 'info' | 'predict') => void

  onTeamClick?: (abbr: string) => void

}



function groupTeams(groupId: string) {

  const g = GROUPS.find(x => x.id === groupId)!

  const seen = new Set<string>()

  const teams: typeof g.matches[0]['home'][] = []

  g.matches.forEach(m => {

    ;[m.home, m.away].forEach(t => {

      if (!seen.has(t.abbr)) { seen.add(t.abbr); teams.push(t) }

    })

  })

  return teams

}



type MainTab = 'groups' | 'calendar' | 'knockout'



export default function Groups({ onMatchClick, onTeamClick }: Props) {

  const [mainTab, setMainTab] = useState<MainTab>(() =>

    (localStorage.getItem('wc_groups_tab') as MainTab) || 'calendar'

  )

  const [selectedGroup, setSelectedGroup] = useState(() =>

    localStorage.getItem('wc_selected_group') || 'A'

  )

  const [calFilter, setCalFilter] = useState<'all' | 'upcoming'>('all')

  const [calPhase, setCalPhase] = useState<'all' | 'groups' | 'knockout'>('all')
  const [fdTick, setFdTick] = useState(0)

  useEffect(() => {
    const onSync = () => setFdTick(x => x + 1)
    window.addEventListener('wc-live-sync', onSync)
    return () => window.removeEventListener('wc-live-sync', onSync)
  }, [])

  const selected = GROUPS.find(g => g.id === selectedGroup)
  const fdTable = useMemo(() => getFdGroupTable(selectedGroup), [selectedGroup, fdTick])



  const calendarGrouped = useMemo(() => {

    const raw = groupScheduleByLocalDay(calPhase === 'all' ? 'all' : calPhase)

    const map: Record<number, typeof raw[number]> = {}

    Object.entries(raw).forEach(([key, items]) => {

      const filtered = items.filter(item => {

        if (calFilter === 'upcoming' && item.kind === 'group' && item.match.status !== 'upcoming') return false

        return true

      })

      if (filtered.length) map[Number(key)] = filtered

    })

    return map

  }, [calFilter, calPhase])



  const totalCal = Object.values(calendarGrouped).flat().length



  const pickTab = (tab: MainTab) => {

    setMainTab(tab)

    localStorage.setItem('wc_groups_tab', tab)

  }



  return (

    <div style={{ padding: '20px', maxWidth: 1600, margin: '0 auto' }}>

      <h1 className="text-shimmer" style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 800 }}>Mundial 2026</h1>

      <p style={{ margin: '0 0 20px', color: 'var(--text2)', fontSize: 13 }}>

        Horarios en <strong style={{ color: 'var(--gold)' }}>tu hora local</strong> automáticamente

      </p>



      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>

        {[

          { id: 'calendar' as const, label: 'Calendario', Icon: IconLive },

          { id: 'groups' as const, label: 'Grupos', Icon: IconGroups },

          { id: 'knockout' as const, label: 'Eliminatorias', Icon: IconTrophy },

        ].map(({ id, label, Icon }) => (

          <button key={id} onClick={() => pickTab(id)}

            className={`wc-filter-btn ${mainTab === id ? 'active' : ''}`}

            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}>

            <Icon size={16} color={mainTab === id ? '#000' : 'var(--text2)'} />

            {label}

          </button>

        ))}

      </div>



      {mainTab === 'knockout' && (

        <div>

          <p style={{ margin: '0 0 20px', color: 'var(--text2)' }}>Cuadro oficial · 32 equipos · Jul 2026</p>

          <KnockoutBracket view="bracket" />

        </div>

      )}



      {mainTab === 'calendar' && (

        <div>

          <p style={{ margin: '0 0 16px', color: 'var(--text2)', fontSize: 13 }}>

            <strong style={{ color: 'var(--gold)' }}>{totalCal}</strong> partidos · agrupados por <strong>tu día local</strong> · 11 Jun – 19 Jul 2026

          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>

            {(['all', 'groups', 'knockout'] as const).map(f => (

              <button key={f} onClick={() => setCalPhase(f)} className={`wc-filter-btn ${calPhase === f ? 'active' : ''}`}>

                {f === 'all' ? 'Todo el torneo' : f === 'groups' ? 'Fase de grupos' : 'Eliminatorias'}

              </button>

            ))}

            {(['all', 'upcoming'] as const).map(f => (

              <button key={f} onClick={() => setCalFilter(f)} className={`wc-filter-btn ${calFilter === f ? 'active' : ''}`}>

                {f === 'all' ? 'Todos' : 'Próximos'}

              </button>

            ))}

          </div>

          {Object.keys(calendarGrouped).map(Number).sort((a, b) => a - b).map(localKey => {

            const items = calendarGrouped[localKey]

            const groupCount = items.filter(i => i.kind === 'group').length

            const koCount = items.filter(i => i.kind === 'knockout').length

            return (

            <div key={localKey} style={{ marginBottom: 28 }}>

              <div className="wc-day-header">

                <IconBall size={18} color="var(--gold)" />

                <div>

                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{getLocalDayLabel(localKey)}</h2>

                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text2)' }}>

                    {groupCount > 0 && `${groupCount} de grupos`}

                    {groupCount > 0 && koCount > 0 && ' · '}

                    {koCount > 0 && `${koCount} eliminatorias`}

                  </p>

                </div>

              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>

                {items.map(entry => entry.kind === 'group' ? (

                  <div key={entry.match.id} onClick={() => onMatchClick?.(entry.match.id, 'info')} className="wc-match-row" style={{ cursor: 'pointer', color: 'var(--text)' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>

                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)' }}>Grupo {entry.match.group} · J{entry.match.day}</span>

                      <span style={{ fontSize: 11, color: 'var(--text2)' }}>{formatLocalKickoffLabel(entry.match.calendarDay, entry.match.kickoff)}</span>

                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>

                      <FlagImg code={entry.match.home.flag} size={32} />

                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{entry.match.home.abbr}</span>

                      <span style={{ color: 'var(--gold)', fontWeight: 800 }}>

                        {entry.match.status === 'finished' && entry.match.result

                          ? `${entry.match.result.h} - ${entry.match.result.a}`

                          : entry.match.status === 'live' && entry.match.result

                            ? `${entry.match.result.h} - ${entry.match.result.a}`

                            : 'VS'}

                      </span>

                      <FlagImg code={entry.match.away.flag} size={32} />

                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{entry.match.away.abbr}</span>

                      {entry.match.status === 'live' && <span className="pulse" style={{ fontSize: 9, color: 'var(--red)', fontWeight: 800 }}>EN VIVO</span>}

                    </div>

                    <p style={{ margin: 0, fontSize: 10, color: 'var(--text2)' }}>{entry.match.venue} · {entry.match.city}</p>

                  </div>

                ) : (

                  <div key={entry.match.id} onClick={() => setMainTab('knockout')} className="wc-match-row" style={{ cursor: 'pointer', color: 'var(--text)', borderColor: 'rgba(245,200,66,.25)' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>

                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)' }}>{entry.match.round}</span>

                      <span style={{ fontSize: 11, color: 'var(--text2)' }}>{formatLocalKickoffLabel(entry.day, entry.kickoff, entry.month)}</span>

                    </div>

                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>

                      {entry.match.homeLabel} <span style={{ color: 'var(--gold)' }}>vs</span> {entry.match.awayLabel}

                    </div>

                    <p style={{ margin: 0, fontSize: 10, color: 'var(--text2)' }}>{entry.match.venue} · {entry.match.city}</p>

                  </div>

                ))}

              </div>

            </div>

          )})}

        </div>

      )}



      {mainTab === 'groups' && (

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>

          <div className="wc-card" style={{ padding: 14, position: 'sticky', top: 100, height: 'fit-content', borderRadius: 12 }}>

            <h2 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>Grupos A–L</h2>

            {GROUPS.map(group => {

              const isSel = selectedGroup === group.id

              return (

                <button key={group.id} onClick={() => { setSelectedGroup(group.id); localStorage.setItem('wc_selected_group', group.id) }}

                  style={{

                    width: '100%', marginBottom: 6, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',

                    background: isSel ? 'var(--gold)' : 'rgba(255,255,255,.05)',

                    border: isSel ? '2px solid var(--gold)' : '1px solid var(--border)',

                    color: isSel ? '#000' : 'var(--text)',

                  }}>

                  <div style={{ fontWeight: 800, fontSize: 14 }}>{group.name}</div>

                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>

                    {groupTeams(group.id).map(t => <FlagImg key={t.abbr} code={t.flag} size={18} />)}

                  </div>

                </button>

              )

            })}

          </div>



          {selected && (

            <div>

              <h2 style={{ margin: '0 0 20px', fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>{selected.name}</h2>



              <div style={{ marginBottom: 28, overflowX: 'auto' }}>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, color: 'var(--text)' }}>

                  <thead>

                    <tr style={{ borderBottom: '2px solid var(--gold)' }}>

                      {['Equipo', 'PJ', 'G', 'E', 'P', 'Pts'].map((h, i) => (

                        <th key={h} style={{ padding: 8, textAlign: i ? 'center' : 'left', color: 'var(--gold)' }}>{h}</th>

                      ))}

                    </tr>

                  </thead>

                  <tbody>

                    {fdTable ? fdTable.map((row, i) => {
                      const local = groupTeams(selected.id).find(t =>
                        t.abbr === row.team.tla || apiTeamMatchesAbbr(row.team.name, t.abbr)
                      )
                      const flag = local?.flag || 'xx'
                      const name = local?.name || row.team.name
                      const abbr = local?.abbr || row.team.tla
                      return (
                        <tr key={abbr} onClick={() => local && onTeamClick?.(local.abbr)} className="wc-team-row"
                          style={{ cursor: local ? 'pointer' : 'default', borderBottom: '1px solid var(--border)', background: i % 2 ? 'transparent' : 'rgba(255,255,255,.02)' }}>
                          <td style={{ padding: 8, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>
                            <FlagImg code={flag} size={24} />
                            <span style={{ fontWeight: 700 }}>{name}</span>
                          </td>
                          <td style={{ textAlign: 'center', color: 'var(--text2)' }}>{row.playedGames}</td>
                          <td style={{ textAlign: 'center', color: 'var(--green)' }}>{row.won}</td>
                          <td style={{ textAlign: 'center', color: 'var(--text2)' }}>{row.draw}</td>
                          <td style={{ textAlign: 'center', color: 'var(--red)' }}>{row.lost}</td>
                          <td style={{ textAlign: 'center', color: 'var(--gold)', fontWeight: 800 }}>{row.points}</td>
                        </tr>
                      )
                    }) : groupTeams(selected.id).map((team, i) => {

                      const tms = selected.matches.filter(m => m.home.abbr === team.abbr || m.away.abbr === team.abbr)

                      let g = 0, e = 0, p = 0

                      tms.forEach(m => {

                        if (!m.result) return

                        const isH = m.home.abbr === team.abbr

                        const sc = isH ? m.result.h : m.result.a

                        const op = isH ? m.result.a : m.result.h

                        if (sc > op) g++; else if (sc === op) e++; else p++

                      })

                      return (

                        <tr key={team.abbr} onClick={() => onTeamClick?.(team.abbr)} className="wc-team-row"

                          style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)', background: i % 2 ? 'transparent' : 'rgba(255,255,255,.02)' }}>

                          <td style={{ padding: 8, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>

                            <FlagImg code={team.flag} size={24} />

                            <span style={{ fontWeight: 700 }}>{team.name}</span>

                          </td>

                          <td style={{ textAlign: 'center', color: 'var(--text2)' }}>{tms.filter(m => m.result).length}</td>

                          <td style={{ textAlign: 'center', color: 'var(--green)' }}>{g}</td>

                          <td style={{ textAlign: 'center', color: 'var(--text2)' }}>{e}</td>

                          <td style={{ textAlign: 'center', color: 'var(--red)' }}>{p}</td>

                          <td style={{ textAlign: 'center', color: 'var(--gold)', fontWeight: 800 }}>{g * 3 + e}</td>

                        </tr>

                      )

                    })}

                  </tbody>

                </table>

              </div>



              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>Partidos del grupo</h3>



              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                {selected.matches.map(match => {

                  const localTime = formatLocalKickoffLabel(match.calendarDay, match.kickoff)

                  return (

                    <button key={match.id}

                      onClick={() => onMatchClick?.(match.id, 'info')}

                      style={{

                        cursor: 'pointer', padding: 14, borderRadius: 8, textAlign: 'left', width: '100%',

                        background: 'rgba(255,255,255,.04)',

                        border: '1px solid var(--border)',

                        color: 'var(--text)',

                      }}>

                      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>

                        J{match.day} · {formatCalendarDate(6, match.calendarDay)} · <strong style={{ color: 'var(--gold)' }}>{localTime}</strong>

                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>

                        <FlagImg code={match.home.flag} size={28} />

                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{match.home.abbr}</span>

                        <span style={{ color: 'var(--gold)', fontWeight: 800 }}>

                          {match.result ? `${match.result.h} - ${match.result.a}` : 'VS'}

                        </span>

                        <FlagImg code={match.away.flag} size={28} />

                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{match.away.abbr}</span>

                        {match.status === 'live' && <span className="pulse" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--red)', fontWeight: 800 }}>EN VIVO</span>}

                      </div>

                      <p style={{ margin: '8px 0 0', fontSize: 10, color: 'var(--text3)' }}>{match.venue} · {match.city}</p>

                    </button>

                  )

                })}

              </div>

            </div>

          )}

        </div>

      )}

    </div>

  )

}


