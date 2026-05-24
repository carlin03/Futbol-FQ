import { useState, useMemo, useEffect } from 'react'
import {
  getPlayersForLocalDay, calcFantasyLineupPts, getPlayerStatsForLocalDay, calcFantasyPlayerPts,
} from '../data/worldcup'
import { getLocalScheduleDays, getLocalDayLabel, isKnockoutLocalKey, isFantasyLocked, formatFantasyDeadline } from '../data/calendar'
import { setFantasyDay, type FantasyLineup } from '../utils/storage'
import FlagImg from './FlagImg'
import { IconCalendar, IconFantasy } from './Icons'

interface Props {
  userId: string
  fantasyAll: Record<number, FantasyLineup>
  setFantasyAll: (f: Record<number, FantasyLineup>) => void
}

const FORMATIONS = {
  '4-3-3': { gk: 1, def: 4, mid: 3, fwd: 3 },
  '4-4-2': { gk: 1, def: 4, mid: 4, fwd: 2 },
  '4-2-3-1': { gk: 1, def: 4, mid: 5, fwd: 1 },
  '4-5-1': { gk: 1, def: 4, mid: 5, fwd: 1 },
  '3-5-2': { gk: 1, def: 3, mid: 5, fwd: 2 },
  '3-4-3': { gk: 1, def: 3, mid: 4, fwd: 3 },
  '3-4-2': { gk: 1, def: 3, mid: 4, fwd: 2 },
  '5-3-2': { gk: 1, def: 5, mid: 3, fwd: 2 },
} as const

type FormationKey = keyof typeof FORMATIONS

const POSITIONS: Record<FormationKey, Record<string, Array<{ x: number; y: number }>>> = {
  '4-3-3': {
    gk: [{ x: 50, y: 10 }],
    def: [{ x: 20, y: 30 }, { x: 40, y: 30 }, { x: 60, y: 30 }, { x: 80, y: 30 }],
    mid: [{ x: 30, y: 55 }, { x: 50, y: 55 }, { x: 70, y: 55 }],
    fwd: [{ x: 25, y: 80 }, { x: 50, y: 85 }, { x: 75, y: 80 }],
  },
  '4-4-2': {
    gk: [{ x: 50, y: 10 }],
    def: [{ x: 15, y: 28 }, { x: 38, y: 28 }, { x: 62, y: 28 }, { x: 85, y: 28 }],
    mid: [{ x: 20, y: 55 }, { x: 40, y: 55 }, { x: 60, y: 55 }, { x: 80, y: 55 }],
    fwd: [{ x: 38, y: 82 }, { x: 62, y: 82 }],
  },
  '4-2-3-1': {
    gk: [{ x: 50, y: 10 }],
    def: [{ x: 20, y: 30 }, { x: 40, y: 30 }, { x: 60, y: 30 }, { x: 80, y: 30 }],
    mid: [{ x: 35, y: 50 }, { x: 65, y: 50 }, { x: 25, y: 68 }, { x: 50, y: 72 }, { x: 75, y: 68 }],
    fwd: [{ x: 50, y: 88 }],
  },
  '4-5-1': {
    gk: [{ x: 50, y: 10 }],
    def: [{ x: 15, y: 28 }, { x: 38, y: 28 }, { x: 62, y: 28 }, { x: 85, y: 28 }],
    mid: [{ x: 12, y: 52 }, { x: 30, y: 55 }, { x: 50, y: 50 }, { x: 70, y: 55 }, { x: 88, y: 52 }],
    fwd: [{ x: 50, y: 85 }],
  },
  '3-5-2': {
    gk: [{ x: 50, y: 10 }],
    def: [{ x: 30, y: 30 }, { x: 50, y: 30 }, { x: 70, y: 30 }],
    mid: [{ x: 15, y: 55 }, { x: 35, y: 55 }, { x: 50, y: 50 }, { x: 65, y: 55 }, { x: 85, y: 55 }],
    fwd: [{ x: 35, y: 80 }, { x: 65, y: 80 }],
  },
  '3-4-3': {
    gk: [{ x: 50, y: 10 }],
    def: [{ x: 25, y: 28 }, { x: 50, y: 28 }, { x: 75, y: 28 }],
    mid: [{ x: 18, y: 52 }, { x: 38, y: 52 }, { x: 62, y: 52 }, { x: 82, y: 52 }],
    fwd: [{ x: 25, y: 82 }, { x: 50, y: 85 }, { x: 75, y: 82 }],
  },
  '3-4-2': {
    gk: [{ x: 50, y: 10 }],
    def: [{ x: 25, y: 28 }, { x: 50, y: 28 }, { x: 75, y: 28 }],
    mid: [{ x: 18, y: 52 }, { x: 38, y: 52 }, { x: 62, y: 52 }, { x: 82, y: 52 }],
    fwd: [{ x: 38, y: 82 }, { x: 62, y: 82 }],
  },
  '5-3-2': {
    gk: [{ x: 50, y: 10 }],
    def: [{ x: 10, y: 28 }, { x: 30, y: 28 }, { x: 50, y: 28 }, { x: 70, y: 28 }, { x: 90, y: 28 }],
    mid: [{ x: 30, y: 55 }, { x: 50, y: 55 }, { x: 70, y: 55 }],
    fwd: [{ x: 38, y: 82 }, { x: 62, y: 82 }],
  },
}

const POS_LABEL = { gk: 'POR', def: 'DEF', mid: 'MED', fwd: 'DEL' }
const POS_CLASS = { gk: 'pos-gk', def: 'pos-def', mid: 'pos-mid', fwd: 'pos-fwd' }
const POS_BG = { gk: 'pos-gk-bg', def: 'pos-def-bg', mid: 'pos-mid-bg', fwd: 'pos-fwd-bg' }
const SUB_IDS = ['sub-0', 'sub-1', 'sub-2', 'sub-3', 'sub-4'] as const

function buildSlots(formation: FormationKey) {
  const slots: { id: string; pos: 'gk' | 'def' | 'mid' | 'fwd' }[] = []
  ;(['gk', 'def', 'mid', 'fwd'] as const).forEach(pos => {
    for (let i = 0; i < FORMATIONS[formation][pos]; i++) {
      slots.push({ id: `${pos}-${i}`, pos })
    }
  })
  return slots
}

export default function Fantasy({ userId, fantasyAll, setFantasyAll }: Props) {
  const [phase, setPhase] = useState<'groups' | 'knockout'>('groups')
  const localDays = useMemo(() => getLocalScheduleDays(phase), [phase])
  const [selectedDay, setSelectedDay] = useState(localDays[0] || 611)
  const [formation, setFormation] = useState<FormationKey>('4-3-3')
  const [players, setPlayers] = useState<Record<string, any>>({})
  const [subs, setSubs] = useState<Record<string, any>>({})
  const [captain, setCaptain] = useState('')
  const [searchText, setSearchText] = useState('')
  const [filterPos, setFilterPos] = useState<'gk' | 'def' | 'mid' | 'fwd' | null>(null)
  const [savedMsg, setSavedMsg] = useState('')
  const [posError, setPosError] = useState('')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!localDays.includes(selectedDay)) setSelectedDay(localDays[0] || 611)
  }, [localDays, selectedDay])

  useEffect(() => {
    const s = fantasyAll[selectedDay]
    const saved = s?.formation as string | undefined
    setFormation(saved && saved in FORMATIONS ? saved as FormationKey : '4-3-3')
    setPlayers(s?.players || {})
    setSubs(s?.subs || {})
    setCaptain(s?.captain || '')
    setPosError('')
  }, [selectedDay, fantasyAll])

  const slots = useMemo(() => buildSlots(formation), [formation])
  const dayStats = useMemo(() => getPlayerStatsForLocalDay(selectedDay), [selectedDay])
  const lineupPts = useMemo(() => calcFantasyLineupPts({ players, subs, captain }, selectedDay), [players, subs, captain, selectedDay])
  const dayPlayers = useMemo(() => getPlayersForLocalDay(selectedDay), [selectedDay])
  const locked = useMemo(() => isFantasyLocked(selectedDay, now), [selectedDay, now])
  const deadlineLabel = useMemo(() => formatFantasyDeadline(selectedDay), [selectedDay])

  const usedNames = useMemo(() => {
    const names = new Set<string>()
    Object.values(players).forEach((p: any) => names.add(p.name))
    Object.values(subs).forEach((p: any) => names.add(p.name))
    return names
  }, [players, subs])

  const availablePlayers = useMemo(() => {
    return dayPlayers
      .filter(p => {
        const q = !searchText || p.name.toLowerCase().includes(searchText.toLowerCase()) || p.team.toLowerCase().includes(searchText.toLowerCase())
        const pos = !filterPos || p.pos === filterPos
        return !usedNames.has(p.name) && q && pos
      })
      .sort((a, b) => b.r - a.r)
  }, [dayPlayers, usedNames, searchText, filterPos])

  const isComplete = slots.every(s => players[s.id])
  const subCount = Object.keys(subs).length
  const starters = useMemo(() => slots.map(s => players[s.id]).filter(Boolean), [slots, players])

  const removeStarter = (slotId: string) => {
    if (locked) return
    const p = players[slotId]
    const next = { ...players }
    delete next[slotId]
    if (p && captain === p.name) setCaptain('')
    setPlayers(next)
  }

  const assignTitular = (player: { name: string; pos: string; flag: string; team: string; r: number }) => {
    if (locked) return
    const slot = slots.find(s => s.pos === player.pos && !players[s.id])
    if (!slot) {
      setPosError(`No hay hueco libre de ${POS_LABEL[player.pos as keyof typeof POS_LABEL]}`)
      setTimeout(() => setPosError(''), 3000)
      return
    }
    setPosError('')
    setPlayers({ ...players, [slot.id]: player })
  }

  const assignSuplente = (player: { name: string; pos: string; flag: string; team: string; r: number }) => {
    if (locked) return
    const subId = SUB_IDS.find(id => !subs[id])
    if (!subId) {
      setPosError('Banquillo completo (5/5)')
      setTimeout(() => setPosError(''), 3000)
      return
    }
    setPosError('')
    setSubs({ ...subs, [subId]: player })
  }

  const removeSub = (subId: string) => {
    if (locked) return
    const next = { ...subs }
    delete next[subId]
    setSubs(next)
  }

  const handleSave = () => {
    if (!isComplete || locked) return
    const lineup: FantasyLineup = { formation, players, subs, captain: captain || undefined }
    setFantasyDay(userId, selectedDay, lineup)
    setFantasyAll({ ...fantasyAll, [selectedDay]: lineup })
    setSavedMsg('Equipo guardado')
    setTimeout(() => setSavedMsg(''), 2500)
  }

  return (
    <div style={{ padding: '20px', maxWidth: 1280, margin: '0 auto' }}>
      <h1 className="text-shimmer" style={{ margin: '0 0 8px', fontSize: 36, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconFantasy size={28} color="#a855f7" /> Mi Once Fantasy
      </h1>
      <p style={{ margin: '0 0 16px', color: 'var(--text2)' }}>
        Por <strong>día sede (ET · USA/CAN/MEX)</strong> · solo jugadores de equipos que juegan ese día · Capitán ×1,5
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['groups', 'knockout'] as const).map(p => (
          <button key={p} onClick={() => setPhase(p)} className={`wc-filter-btn ${phase === p ? 'active' : ''}`}>
            {p === 'groups' ? 'Fase de grupos' : 'Eliminatorias'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20, maxHeight: 120, overflowY: 'auto' }}>
        {localDays.map(d => (
          <button key={d} onClick={() => setSelectedDay(d)}
            className={`wc-day-btn ${selectedDay === d ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconCalendar size={14} />
            <span>{getLocalDayLabel(d)}</span>
            {fantasyAll[d] && <span className="wc-dot" />}
          </button>
        ))}
      </div>

      {isKnockoutLocalKey(selectedDay) && (
        <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--gold)', padding: '8px 12px', background: 'rgba(245,200,66,.08)', borderRadius: 8 }}>
          Eliminatorias: plantilla completa disponible (rivales por confirmar)
        </p>
      )}

      {locked && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(238,51,73,.12)', border: '1px solid rgba(238,51,73,.35)', borderRadius: 10, fontSize: 13, color: 'var(--text)' }}>
          <strong style={{ color: 'var(--red)' }}>Fantasy cerrado</strong> para este día · el plazo terminó el {deadlineLabel} (2 h antes del 1.er partido ET).
        </div>
      )}

      {!locked && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.25)', borderRadius: 10, fontSize: 12, color: 'var(--text2)' }}>
          Plazo abierto hasta <strong style={{ color: 'var(--text)' }}>{deadlineLabel}</strong> · 2 h antes del 1.er partido del día (horario sede ET).
        </div>
      )}

      <div className="wc-card" style={{ padding: 14, marginBottom: 16, opacity: locked ? 0.7 : 1, pointerEvents: locked ? 'none' : 'auto' }}>
        <p style={{ margin: '0 0 10px', fontSize: 10, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase' }}>Formación</p>
        <div className="wc-formation-grid">
          {(Object.keys(FORMATIONS) as FormationKey[]).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => {
                if (f === formation) return
                setFormation(f)
                setPlayers({})
                setSubs({})
                setCaptain('')
              }}
              className={`wc-formation-btn ${formation === f ? 'active' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div className="wc-card" style={{ padding: 12, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 10, color: 'var(--text2)', fontWeight: 700 }}>PROGRESO</p>
          <p style={{ margin: '4px 0', fontSize: 22, fontWeight: 800, color: isComplete ? 'var(--green)' : '#3b82f6' }}>{Object.keys(players).length}/11</p>
        </div>
        <div className="wc-card" style={{ padding: 12, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 10, color: 'var(--text2)', fontWeight: 700 }}>SUPLENTES</p>
          <p style={{ margin: '4px 0', fontSize: 22, fontWeight: 800, color: subCount === 5 ? 'var(--green)' : 'var(--text2)' }}>{subCount}/5</p>
        </div>
        <div className="wc-card" style={{ padding: 12, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 10, color: 'var(--text2)', fontWeight: 700 }}>PUNTOS DÍA</p>
          <p style={{ margin: '4px 0', fontSize: 22, fontWeight: 800, color: '#a855f7' }}>{lineupPts}</p>
        </div>
        <button onClick={handleSave} disabled={!isComplete || locked} className="wc-btn-gold" style={{ opacity: isComplete && !locked ? 1 : 0.4 }}>
          {locked ? 'Plazo cerrado' : 'Guardar once'}
        </button>
      </div>

      {posError && <p style={{ color: 'var(--red)', fontWeight: 700, marginBottom: 12, fontSize: 13 }}>{posError}</p>}
      {savedMsg && <p className="fade-up" style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 700, marginBottom: 12 }}>{savedMsg}</p>}

      {starters.length > 0 && (
        <div className="wc-card" style={{ padding: 14, marginBottom: 16, opacity: locked ? 0.7 : 1, pointerEvents: locked ? 'none' : 'auto' }}>
          <p style={{ margin: '0 0 10px', fontSize: 10, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase' }}>
            Capitán {captain ? '· ×1,5' : '· elige uno de tus titulares'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {slots.filter(s => players[s.id]).map(slot => {
              const player = players[slot.id]
              const isCap = captain === player.name
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setCaptain(player.name)}
                  className={`wc-filter-btn ${isCap ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}
                >
                  <FlagImg code={player.flag} size={16} />
                  {player.name.split(' ').pop()}
                  {isCap && ' ⭐'}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, opacity: locked ? 0.85 : 1 }}>
        <div>
        <div className="wc-pitch" style={{ borderRadius: 14, padding: 20, position: 'relative', minHeight: 480, pointerEvents: locked ? 'none' : 'auto' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 440 }}>
            {slots.map((slot, i) => {
              const posArr = POSITIONS[formation][slot.pos]
              const posIdx = slots.filter((s, j) => j < i && s.pos === slot.pos).length
              const pos = posArr[posIdx] || { x: 50, y: 50 }
              const player = players[slot.id]
              const isCap = player && captain === player.name
              return (
                <div key={slot.id} style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)' }}>
                  {player ? (
                    <div style={{ cursor: 'pointer', textAlign: 'center' }}
                      title="Clic = capitán · Doble clic = quitar"
                      onClick={() => { if (!locked) setCaptain(player.name) }}
                      onDoubleClick={e => { e.stopPropagation(); if (!locked) removeStarter(slot.id) }}>
                      <div className={`pos-${player.pos}`} style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isCap ? '3px solid var(--gold)' : '2px solid rgba(255,255,255,.3)', boxShadow: isCap ? '0 0 16px rgba(245,200,66,.7)' : 'none' }}>
                        <FlagImg code={player.flag} size={28} />
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: 8, fontWeight: 700, background: 'rgba(0,0,0,.75)', padding: '2px 4px', borderRadius: 4 }}>
                        {player.name.split(' ').pop()}{isCap ? ' (C)' : ''}
                        {dayStats[player.name] && <span style={{ color: '#a855f7' }}> +{calcFantasyPlayerPts(player, dayStats[player.name], isCap)}</span>}
                      </p>
                    </div>
                  ) : (
                    <div className="pos-slot-empty" style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 10, fontWeight: 800 }}>
                      {POS_LABEL[slot.pos]}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="wc-card" style={{ marginTop: 14, padding: 14, pointerEvents: locked ? 'none' : 'auto' }}>
          <p style={{ margin: '0 0 10px', fontSize: 10, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase' }}>Banquillo · 5 suplentes</p>
          <p style={{ margin: '0 0 12px', fontSize: 11, color: 'var(--text3)' }}>Cualquier posición · auto-cambio si un titular no juega</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {SUB_IDS.map((subId, idx) => {
              const player = subs[subId]
              return (
                <button
                  key={subId}
                  type="button"
                  onDoubleClick={e => { e.stopPropagation(); if (player) removeSub(subId) }}
                  className={`wc-sub-slot ${player ? POS_BG[player.pos as keyof typeof POS_BG] : ''}`}
                  title={player ? `${player.name} · doble clic quitar` : `Suplente ${idx + 1}`}
                >
                  {player ? (
                    <>
                      <FlagImg code={player.flag} size={22} />
                      <span className="wc-sub-name">{player.name.split(' ').pop()}</span>
                      <span className={`${POS_CLASS[player.pos as keyof typeof POS_CLASS]}`} style={{ fontSize: 8, padding: '1px 4px', borderRadius: 3 }}>{POS_LABEL[player.pos as keyof typeof POS_LABEL]}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 800 }}>S{idx + 1}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        </div>

        <div style={{ pointerEvents: locked ? 'none' : 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6, marginBottom: 10 }}>
            {[{ id: null, l: 'Todos' }, { id: 'gk', l: 'POR' }, { id: 'def', l: 'DEF' }, { id: 'mid', l: 'MED' }, { id: 'fwd', l: 'DEL' }].map(p => (
              <button key={p.l} onClick={() => setFilterPos(p.id as any)} className={`wc-filter-btn ${filterPos === p.id ? 'active' : ''}`}>{p.l}</button>
            ))}
          </div>
          <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Buscar jugador o equipo..." className="wc-input" style={{ width: '100%', marginBottom: 10 }} />
          <p style={{ margin: '0 0 8px', fontSize: 11, color: 'var(--text3)' }}>
            Clic = titular en la cancha · «Supl.» = banquillo · {availablePlayers.length} disponibles
          </p>
          <div style={{ maxHeight: 480, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {availablePlayers.map((p, i) => (
              <div key={i} className={`wc-player-btn ${POS_BG[p.pos]}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10 }}>
                <button type="button" onClick={() => assignTitular(p)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textAlign: 'left', minWidth: 0 }}>
                  <FlagImg code={p.flag} size={26} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{p.name}</p>
                    <p style={{ margin: 0, fontSize: 10, color: 'var(--text2)' }}>{p.team} · <span className={POS_CLASS[p.pos]} style={{ padding: '1px 5px', borderRadius: 3, fontSize: 9 }}>{POS_LABEL[p.pos]}</span></p>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: 12 }}>{p.r}</span>
                </button>
                <button type="button" onClick={() => assignSuplente(p)} className="wc-filter-btn" style={{ fontSize: 10, padding: '6px 8px', flexShrink: 0 }} title="Asignar como suplente">
                  Supl.
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wc-card wc-fantasy-rules" style={{ marginTop: 32, padding: 24 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 20, color: 'var(--gold)', fontFamily: 'Oswald,sans-serif' }}>Reglas y puntuación</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text)', textTransform: 'uppercase' }}>Cómo jugar</h3>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text2)', fontSize: 13, lineHeight: 1.7 }}>
              <li>Elige un <strong>día sede (ET)</strong> del calendario — fecha FIFA en USA/CAN/MEX.</li>
              <li>Solo puedes fichar jugadores de equipos que juegan ese día (ET).</li>
              <li><strong>Titular:</strong> pulsa un jugador y va directo a la cancha.</li>
              <li><strong>Suplente:</strong> botón «Supl.» en la lista.</li>
              <li>11 titulares + hasta <strong>5 suplentes</strong> en banquillo.</li>
              <li>Elige <strong>capitán</strong> entre tus titulares (barra o clic en la cancha).</li>
              <li>Plazo cierra <strong>2 h antes</strong> del 1.er partido ET (entre paréntesis, hora local).</li>
            </ul>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text)', textTransform: 'uppercase' }}>Puntos por acción</h3>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text2)', fontSize: 13, lineHeight: 1.7 }}>
              <li><span style={{ color: 'var(--green)' }}>+1</span> Aparición (juega al menos 1 min)</li>
              <li><span style={{ color: 'var(--green)' }}>+4 / +5 / +6</span> Gol (DEL / MED / DEF·POR)</li>
              <li><span style={{ color: 'var(--green)' }}>+3</span> Asistencia</li>
              <li><span style={{ color: 'var(--green)' }}>+4</span> Portería a cero (POR o DEF)</li>
              <li><span style={{ color: 'var(--red)' }}>−1</span> Tarjeta amarilla · <span style={{ color: 'var(--red)' }}>−3</span> Roja</li>
              <li><span style={{ color: 'var(--gold)' }}>×1,5</span> Capitán (solo si el titular juega)</li>
            </ul>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text)', textTransform: 'uppercase' }}>Suplentes automáticos</h3>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text2)', fontSize: 13, lineHeight: 1.7 }}>
              <li>Si un titular <strong>no juega</strong>, entra el primer suplente disponible del banquillo.</li>
              <li>Prioridad: misma posición, luego el siguiente suplente en orden (S1→S5).</li>
              <li>Los suplentes solo suman si sustituyen a un titular que no ha jugado.</li>
              <li>El capitán debe ser titular; si no juega, no hay bonus ×1,5 ese día.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
