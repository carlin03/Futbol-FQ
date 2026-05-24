import { useState, useEffect } from 'react'
import { getAllMatches, getMatchLineup, calcPts } from '../data/worldcup'
import { getMatchLiveState, type MatchLiveState } from '../data/matchState'
import { createEmptyMatchStats } from '../data/tournamentStats'
import { formatLocalKickoffLabel } from '../utils/timezone'
import FlagImg from './FlagImg'

interface Props {
  matchId: string
  groupId?: string
  predictions: Record<string, any>
  onPredictionChange: (pred: any) => void
  onBack?: () => void
  viewMode?: 'info' | 'predict'
}

export default function MatchDetail({ matchId, predictions, onPredictionChange, onBack, viewMode = 'predict' }: Props) {
  const [liveTick, setLiveTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setLiveTick(x => x + 1), 5000)
    const onSync = () => setLiveTick(x => x + 1)
    window.addEventListener('wc-live-sync', onSync)
    return () => {
      clearInterval(t)
      window.removeEventListener('wc-live-sync', onSync)
    }
  }, [])

  const match = getAllMatches().find(m => m.id === matchId)
  const liveState: MatchLiveState | null = match ? getMatchLiveState(matchId) : null
  void liveTick
  const lineup = getMatchLineup(matchId)
  const currentPred = predictions[matchId]
  const [tab, setTab] = useState<'pred' | 'lineup' | 'stats'>(viewMode === 'info' ? 'stats' : 'pred')

  const [selectedPick, setSelectedPick] = useState(currentPred?.pick || null)
  const [homeScore, setHomeScore] = useState(currentPred?.homeScore ?? '')
  const [awayScore, setAwayScore] = useState(currentPred?.awayScore ?? '')
  const [hasChanged, setHasChanged] = useState(false)

  if (!match) return null

  const matchStats = createEmptyMatchStats(match.id, match.group, match.home.abbr, match.away.abbr, match.calendarDay)
  const pts = currentPred ? calcPts(currentPred, match) : 0
  const isFinished = match.status === 'finished'
  const isLive = match.status === 'live'
  const events = liveState?.events || []

  const handlePick = (pick: string) => { setSelectedPick(pick); setHasChanged(true) }
  const handleScoreChange = (h: string, a: string) => { setHomeScore(h); setAwayScore(a); setHasChanged(true) }

  const handleSave = () => {
    onPredictionChange({
      pick: selectedPick,
      homeScore: homeScore !== '' ? parseInt(String(homeScore)) : null,
      awayScore: awayScore !== '' ? parseInt(String(awayScore)) : null,
    })
    setHasChanged(false)
  }

  const handleCancel = () => {
    onPredictionChange(null)
    setSelectedPick(null)
    setHomeScore('')
    setAwayScore('')
    setHasChanged(false)
  }

  const renderLineup = (side: 'home' | 'away', teamName: string, flag: string) => {
    if (!lineup) return <p style={{ color: 'var(--text2)', fontSize: 13 }}>Alineación por confirmar</p>
    const data = lineup[side]
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <FlagImg code={flag} size={32} />
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>{teamName}</p>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text2)' }}>{data.formation}</p>
          </div>
        </div>
        <p style={{ margin: '0 0 8px 0', fontSize: 10, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase' }}>Titulares</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
          {data.starters.map(p => (
            <div key={p.number} style={{ background: 'rgba(255,255,255,.04)', borderRadius: 6, padding: '6px 8px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: 12, minWidth: 20 }}>{p.number}</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</span>
              <span style={{ marginLeft: 'auto', fontSize: 9, color: posColor(p.pos), fontWeight: 700 }}>{p.pos.toUpperCase()}</span>
            </div>
          ))}
        </div>
        {data.subs.length > 0 && (
          <>
            <p style={{ margin: '0 0 8px 0', fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase' }}>Suplentes</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {data.subs.map(p => (
                <span key={p.number} style={{ fontSize: 11, color: 'var(--text2)', background: 'rgba(255,255,255,.03)', padding: '4px 8px', borderRadius: 4 }}>
                  {p.number} {p.name}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  const posColor = (pos: string) =>
    pos === 'gk' ? 'var(--green)' : pos === 'def' ? '#3b82f6' : pos === 'mid' ? '#a855f7' : '#ef4444'

  const eventLabel = (type: string) => {
    const labels: Record<string, string> = {
      goal: 'Gol', yellow: 'Amarilla', red: 'Roja', sub: 'Cambio',
      kickoff: 'Inicio', halftime: 'Descanso', fulltime: 'Final',
    }
    return labels[type] || type
  }

  return (
    <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
      <button onClick={onBack} style={{ marginBottom: 20, background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>← Volver</button>

      {/* Header partido */}
      <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ background: 'var(--golddim)', border: '1px solid rgba(245,200,66,.3)', color: 'var(--gold)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Grupo {match.group}</span>
          <span style={{ background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.3)', color: '#3b82f6', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Jornada {match.day}</span>
          {isLive && <span className="pulse" style={{ background: 'rgba(238,51,73,.2)', border: '1px solid var(--red)', color: 'var(--red)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>● EN VIVO</span>}
          {isFinished && <span style={{ background: 'rgba(0,208,94,.1)', border: '1px solid var(--green)', color: 'var(--green)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>FINAL</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <FlagImg code={match.home.flag} size={72} width={72} height={54} style={{ marginBottom: 8 }} />
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{match.home.name}</h3>
          </div>
          <div style={{ textAlign: 'center' }}>
            {isFinished && match.result ? (
              <p style={{ margin: 0, fontSize: 42, fontWeight: 800, fontFamily: 'Oswald,sans-serif', color: 'var(--gold)' }}>
                {match.result.h} - {match.result.a}
              </p>
            ) : isLive && match.result ? (
              <p style={{ margin: 0, fontSize: 42, fontWeight: 800, fontFamily: 'Oswald,sans-serif', color: 'var(--gold)' }}>
                {match.result.h} - {match.result.a}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--gold)' }}>VS</p>
            )}
            {isLive && liveState?.minute != null && (
              <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--red)', fontWeight: 700 }}>{liveState.minute}'</p>
            )}
            {currentPred && isFinished && (
              <p style={{ margin: '8px 0 0', fontSize: 13, color: pts > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                {pts > 0 ? `+${pts} pts` : '0 pts'}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <FlagImg code={match.away.flag} size={72} width={72} height={54} style={{ marginBottom: 8 }} />
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{match.away.name}</h3>
          </div>
        </div>

        {(isLive || isFinished) && events.length > 0 && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase' }}>
              {isLive ? 'Minuto a minuto' : 'Resumen del partido'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...events].sort((a, b) => b.minute - a.minute).map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13 }}>
                  <span style={{ minWidth: 36, fontWeight: 800, color: 'var(--gold)' }}>{ev.minute}'</span>
                  <span style={{ color: ev.type === 'goal' ? 'var(--green)' : ev.type === 'red' ? 'var(--red)' : 'var(--text2)' }}>
                    {eventLabel(ev.type)} {ev.player ? `· ${ev.player}` : ''}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text2)' }}>
                    {ev.team === 'home' ? match.home.abbr : match.away.abbr}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20, fontSize: 12, color: 'var(--text)' }}>
          <div><span style={{ color: 'var(--text2)' }}>Hora local: </span><strong style={{ color: 'var(--gold)' }}>{formatLocalKickoffLabel(match.calendarDay, match.kickoff)}</strong></div>
          <div><span style={{ color: 'var(--text2)' }}>Sede: </span>{match.venue}</div>
          <div><span style={{ color: 'var(--text2)' }}>Ciudad: </span>{match.city}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          ...(viewMode === 'predict' ? [{ id: 'pred' as const, label: 'Predicción' }] : []),
          { id: 'stats' as const, label: 'Estadísticas' },
          { id: 'lineup' as const, label: 'Alineaciones' },
          ...(viewMode === 'info' ? [{ id: 'pred' as const, label: 'Predicción' }] : []),
        ].filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: tab === t.id ? 'var(--gold)' : 'rgba(255,255,255,.05)', color: tab === t.id ? '#000' : 'var(--text)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'stats' && (
        <div className="wc-card" style={{ padding: 24, borderRadius: 12 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>Estadísticas del partido</h2>
          {match.status === 'upcoming' ? (
            <p style={{ color: 'var(--text2)', marginBottom: 16 }}>Disponibles cuando se juegue el partido.</p>
          ) : null}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12, marginBottom: 20 }}>
            {[
              { l: 'Goles', v: `${matchStats.goalsHome} - ${matchStats.goalsAway}` },
              { l: 'Amarillas', v: matchStats.yellowCards },
              { l: 'Rojas', v: matchStats.redCards },
              { l: 'Faltas', v: matchStats.fouls },
              { l: 'Córners', v: matchStats.corners },
              { l: 'Fuera juego', v: matchStats.offsides },
              { l: 'Tiros', v: `${matchStats.shotsHome} - ${matchStats.shotsAway}` },
              { l: 'Posesión', v: `${matchStats.possessionHome}% - ${matchStats.possessionAway}%` },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center', padding: 12, background: 'rgba(255,255,255,.04)', borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{s.v}</p>
                <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--text2)' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'pred' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24 }}>
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, color: 'var(--gold)' }}>¿Quién gana?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[{ pick: '1', label: match.home.abbr }, { pick: 'X', label: 'Empate' }, { pick: '2', label: match.away.abbr }].map(o => (
                <button key={o.pick} onClick={() => handlePick(o.pick)} disabled={isFinished}
                  style={{ background: selectedPick === o.pick ? 'var(--gold)' : 'rgba(255,255,255,.05)', border: selectedPick === o.pick ? '2px solid var(--gold)' : '1px solid var(--border)', color: selectedPick === o.pick ? '#000' : 'var(--text)', padding: '24px 12px', borderRadius: 10, fontWeight: 800, cursor: isFinished ? 'default' : 'pointer', fontSize: 16, opacity: isFinished ? 0.6 : 1 }}>
                  {o.label}
                </button>
              ))}
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>Resultado exacto (opcional · 3 pts)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
              <input type="number" min="0" max="9" value={homeScore} disabled={isFinished} onChange={e => handleScoreChange(e.target.value, String(awayScore))} placeholder="0"
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', padding: '20px', textAlign: 'center', fontWeight: 800, fontSize: 28 }} />
              <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: 28 }}>-</span>
              <input type="number" min="0" max="9" value={awayScore} disabled={isFinished} onChange={e => handleScoreChange(String(homeScore), e.target.value)} placeholder="0"
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', padding: '20px', textAlign: 'center', fontWeight: 800, fontSize: 28 }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!isFinished && (
              <>
                <button onClick={handleSave} disabled={!selectedPick || !hasChanged}
                  style={{ padding: 14, background: selectedPick && hasChanged ? 'var(--gold)' : 'rgba(255,255,255,.1)', border: 'none', borderRadius: 8, color: selectedPick && hasChanged ? '#000' : 'var(--text2)', fontWeight: 700, cursor: selectedPick && hasChanged ? 'pointer' : 'default', fontSize: 15 }}>
                  Guardar predicción
                </button>
                {currentPred && (
                  <button onClick={handleCancel} style={{ padding: 14, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: 'var(--red)', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
                    Eliminar
                  </button>
                )}
              </>
            )}
            {isFinished && currentPred && (
              <div style={{ background: pts >= 3 ? 'rgba(0,208,94,.1)' : pts >= 1 ? 'rgba(245,200,66,.1)' : 'rgba(238,51,73,.1)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text2)' }}>Tu predicción</p>
                <p style={{ margin: '8px 0', fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>
                  {currentPred.pick === '1' ? match.home.abbr : currentPred.pick === 'X' ? 'Empate' : match.away.abbr}
                  {currentPred.homeScore != null && ` (${currentPred.homeScore}-${currentPred.awayScore})`}
                </p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: pts > 0 ? 'var(--green)' : 'var(--red)' }}>{pts} puntos</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'lineup' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            {renderLineup('home', match.home.name, match.home.flag)}
          </div>
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            {renderLineup('away', match.away.name, match.away.flag)}
          </div>
        </div>
      )}
    </div>
  )
}
