import { useMemo, useState } from 'react'
import { getAllMatches, calcTotal, formatCalendarDay } from '../data/worldcup'
import { buildFullSchedule, getLocalDayLabel } from '../data/calendar'
import { formatLocalKickoffLabel } from '../utils/timezone'
import FlagImg from './FlagImg'
import { IconTarget, IconCalendar, IconBall } from './Icons'

interface Props {
  predictions: Record<string, any>
  onMatchClick: (matchId: string) => void
  onSavePrediction?: (matchId: string, pred: { pick: '1' | 'X' | '2' }) => void
}

type QuinielaTab = 'all' | 'upcoming' | 'j1' | 'j2' | 'j3' | 'knockout'

export default function Quiniela({ predictions, onMatchClick, onSavePrediction }: Props) {
  const [tab, setTab] = useState<QuinielaTab>('all')
  const allGroupMatches = getAllMatches()
  const totalPts = calcTotal(predictions)
  const predicted = Object.keys(predictions).filter(k => predictions[k]?.pick).length

  const groupItems = useMemo(() => {
    return buildFullSchedule('groups').filter(item => {
      if (item.kind !== 'group') return false
      const m = item.match
      if (tab === 'upcoming' && m.status !== 'upcoming') return false
      if (tab === 'j1' && m.day !== 1) return false
      if (tab === 'j2' && m.day !== 2) return false
      if (tab === 'j3' && m.day !== 3) return false
      return true
    }) as import('../data/calendar').GroupScheduleItem[]
  }, [tab])

  const knockoutItems = useMemo(
    () => buildFullSchedule('knockout').filter(i => i.kind === 'knockout') as import('../data/calendar').KnockoutScheduleItem[],
    []
  )

  const groupedByDay = useMemo(() => {
    const map: Record<number, typeof groupItems> = {}
    groupItems.forEach(item => {
      if (!map[item.localKey]) map[item.localKey] = []
      map[item.localKey].push(item)
    })
    return map
  }, [groupItems])

  const visibleCount = tab === 'knockout' ? knockoutItems.length : groupItems.length
  const visiblePreds = tab === 'knockout'
    ? knockoutItems.filter(i => predictions[i.match.id]?.pick).length
    : groupItems.filter(i => predictions[i.match.id]?.pick).length
  const pct = visibleCount ? Math.round((visiblePreds / visibleCount) * 100) : 0

  const tabs: { id: QuinielaTab; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'upcoming', label: 'Próximos' },
    { id: 'j1', label: 'Jornada 1' },
    { id: 'j2', label: 'Jornada 2' },
    { id: 'j3', label: 'Jornada 3' },
    { id: 'knockout', label: 'Eliminatorias' },
  ]

  const renderGroupMatch = (m: typeof allGroupMatches[0]) => {
    const pred = predictions[m.id]
    const hasPred = !!pred?.pick
    const isLive = m.status === 'live'
    const isFinished = m.status === 'finished'
    return (
      <button
        key={m.id}
        onClick={() => onMatchClick(m.id)}
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto auto',
          gap: 16,
          alignItems: 'center',
          padding: '16px 20px',
          background: 'rgba(255,255,255,.04)',
          border: `1px solid ${hasPred ? 'rgba(245,200,66,.25)' : 'var(--border)'}`,
          borderRadius: 12,
          cursor: 'pointer',
          textAlign: 'left',
          color: 'var(--text)',
          width: '100%',
        }}
      >
        <div style={{ minWidth: 90 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text2)' }}>
            <IconCalendar size={12} />
            {formatCalendarDay(m.calendarDay)}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', marginTop: 4 }}>
            {formatLocalKickoffLabel(m.calendarDay, m.kickoff)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <FlagImg code={m.home.flag} size={28} />
          <span style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{m.home.name}</span>
          <span style={{ color: 'var(--text2)', fontWeight: 800, fontSize: 13 }}>
            {isFinished && m.result ? `${m.result.h} - ${m.result.a}` : isLive && m.result ? `${m.result.h} - ${m.result.a}` : 'vs'}
          </span>
          <span style={{ fontWeight: 700, fontSize: 14, flex: 1, textAlign: 'right' }}>{m.away.name}</span>
          <FlagImg code={m.away.flag} size={28} />
        </div>
        <div style={{ textAlign: 'center', minWidth: 70 }}>
          {isLive && <span className="pulse" style={{ fontSize: 10, fontWeight: 800, color: 'var(--red)' }}>EN VIVO</span>}
          {isFinished && !isLive && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)' }}>FINAL</span>}
          {!isLive && !isFinished && <span style={{ fontSize: 10, color: 'var(--text2)' }}>Grupo {m.group} · J{m.day}</span>}
        </div>
        <div style={{ minWidth: 100, textAlign: 'right' }}>
          {hasPred ? (
            <div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: 'var(--gold)' }}>
                <IconTarget size={14} />
                {pred.pick === '1' ? m.home.abbr : pred.pick === 'X' ? 'X' : m.away.abbr}
              </span>
              {pred.homeScore != null && (
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{pred.homeScore}-{pred.awayScore}</div>
              )}
            </div>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>Sin marcar</span>
          )}
        </div>
      </button>
    )
  }

  const renderKnockoutMatch = (entry: typeof knockoutItems[0]) => {
    const km = entry.match
    const pred = predictions[km.id]
    const hasPred = !!pred?.pick
    return (
      <div
        key={km.id}
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: 16,
          alignItems: 'center',
          padding: '16px 20px',
          background: 'rgba(255,255,255,.04)',
          border: `1px solid ${hasPred ? 'rgba(245,200,66,.25)' : 'rgba(245,200,66,.15)'}`,
          borderRadius: 12,
          color: 'var(--text)',
          width: '100%',
        }}
      >
        <div style={{ minWidth: 90 }}>
          <div style={{ fontSize: 11, color: 'var(--text2)' }}>{km.date}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', marginTop: 4 }}>
            {formatLocalKickoffLabel(entry.day, entry.kickoff, entry.month)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>{km.round}</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {km.homeLabel} <span style={{ color: 'var(--gold)' }}>vs</span> {km.awayLabel}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['1', 'X', '2'] as const).map(pick => (
            <button
              key={pick}
              onClick={() => onSavePrediction?.(km.id, { pick })}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: pred?.pick === pick ? '2px solid var(--gold)' : '1px solid var(--border)',
                background: pred?.pick === pick ? 'var(--gold)' : 'rgba(255,255,255,.05)',
                color: pred?.pick === pick ? '#000' : 'var(--text)',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {pick}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <p className="wc-badge">QUINIELA</p>
        <h1 className="text-shimmer" style={{ margin: '8px 0', fontSize: 32, fontWeight: 800, fontFamily: 'Oswald,sans-serif' }}>
          Tus predicciones
        </h1>
        <p style={{ color: 'var(--text2)', margin: 0 }}>
          {allGroupMatches.length} partidos de grupos + eliminatorias. Marca 1, X o 2 (+3 pts si aciertas el resultado exacto).
        </p>
      </div>

      <div className="wc-stat-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Predicciones', value: `${predicted}/${allGroupMatches.length}`, color: 'var(--gold)' },
          { label: 'Puntos quiniela', value: totalPts, color: 'var(--green)' },
          { label: 'En esta vista', value: `${visiblePreds}/${visibleCount}`, color: '#3b82f6' },
          { label: 'Progreso', value: `${pct}%`, color: '#a855f7' },
        ].map(s => (
          <div key={s.label} className="wc-card" style={{ padding: 16, textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 800, color: s.color, fontFamily: 'Oswald,sans-serif' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`wc-filter-btn ${tab === t.id ? 'active' : ''}`}
            style={{ padding: '10px 18px' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
          <span style={{ color: 'var(--text2)' }}>{visiblePreds}/{visibleCount} partidos marcados</span>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{pct}%</span>
        </div>
        <div className="wc-progress-track">
          <div className="wc-progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--gold), #f0c96a)' }} />
        </div>
      </div>

      {tab === 'knockout' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {knockoutItems.map(renderKnockoutMatch)}
        </div>
      ) : (
        Object.keys(groupedByDay).map(Number).sort((a, b) => a - b).map(localKey => (
          <div key={localKey} style={{ marginBottom: 28 }}>
            <div className="wc-day-header" style={{ marginBottom: 12 }}>
              <IconBall size={18} color="var(--gold)" />
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{getLocalDayLabel(localKey)}</h2>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text2)' }}>{groupedByDay[localKey].length} partidos</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {groupedByDay[localKey].map(item => renderGroupMatch(item.match))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
