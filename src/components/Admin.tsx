import { useState, useEffect, Fragment } from 'react'
import {
  formatDuration, formatRelativeTime, getSessionDuration, PAGE_LABELS,
} from '../utils/adminStats'
import { fetchAdminStats, deleteUserAccount, adminUpdateUser } from '../services/database'
import type { Session } from '../utils/storage'
import { formatLocalKickoffLabel } from '../utils/timezone'
import FlagImg from './FlagImg'
import { getAllMatches } from '../data/worldcup'
import { getMatchLiveState, setMatchLiveState, type MatchEvent } from '../data/matchState'
import { readFixtureMap, type LiveSyncMeta } from '../services/apiFootball'
import { isFdConfigured, type FdSyncMeta } from '../services/footballData'
import type { DataSource } from '../hooks/useLiveSync'

type SyncPanelProps = {
  source: DataSource
  fdMeta: FdSyncMeta
  apiMeta: LiveSyncMeta
  syncing: boolean
  configured: boolean
  runSync: (force?: boolean) => Promise<void>
  runMapping: () => Promise<void>
}

export default function Admin({ onClose, sync, session }: { onClose: () => void; sync: SyncPanelProps; session: Session | null }) {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [tab, setTab] = useState('dashboard')
  const [refresh, setRefresh] = useState(0)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [editUser, setEditUser] = useState<{ id: string; username: string; email: string; favTeam: string } | null>(null)
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchAdminStats>> | null>(null)
  const [statsError, setStatsError] = useState('')
  const ADMIN_PASSWORD = 'mundial2026'

  const bump = () => setRefresh(r => r + 1)

  useEffect(() => {
    if (!authenticated) return
    setStatsError('')
    setStats(null)
    fetchAdminStats()
      .then(setStats)
      .catch(err => {
        console.error(err)
        setStatsError(err instanceof Error ? err.message : 'No se pudo cargar el panel')
      })
  }, [refresh, authenticated])

  if (!authenticated) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--s2)', padding: 40, borderRadius: 12, textAlign: 'center', border: '2px solid var(--gold)', maxWidth: 400 }}>
          <h2 style={{ fontFamily: 'Oswald', color: 'var(--gold)', marginBottom: 20 }}>ADMIN</h2>
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && password === ADMIN_PASSWORD) setAuthenticated(true) }} style={{ width: '100%', padding: '12px 16px', marginBottom: 16, background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 6, fontSize: 14 }} />
          <button onClick={() => password === ADMIN_PASSWORD && setAuthenticated(true)} style={{ background: 'var(--gold)', color: '#000', padding: '10px 24px', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', marginRight: 10 }}>Entrar</button>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text)', padding: '10px 24px', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', gap: 16, padding: 24 }}>
        {statsError ? (
          <>
            <p style={{ color: 'var(--red)', margin: 0, textAlign: 'center' }}>{statsError}</p>
            <button onClick={bump} style={{ background: 'var(--gold)', color: '#000', padding: '10px 20px', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Reintentar</button>
            <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text)', padding: '10px 20px', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}>Cerrar</button>
          </>
        ) : (
          <p style={{ margin: 0 }}>Cargando panel admin…</p>
        )}
      </div>
    )
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'Usuarios' },
    { id: 'activity', label: 'Actividad' },
    { id: 'matches', label: 'Partidos en vivo' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.95)', overflowY: 'auto', paddingTop: 80 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 40px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <div>
            <h1 style={{ fontFamily: 'Oswald', color: 'var(--gold)', fontSize: 32, margin: 0 }}>PANEL ADMIN</h1>
            <p style={{ color: 'var(--text2)', margin: '4px 0 0', fontSize: 13 }}>
              Sesión: {session?.username} · {session ? getSessionDuration(session.loginTime) : '—'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--red)', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Cerrar</button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 30, flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '10px 20px', borderRadius: 6, background: tab === t.id ? 'var(--gold)' : 'var(--s2)', color: tab === t.id ? '#000' : 'var(--text)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>{t.label}</button>
          ))}
        </div>

        {tab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
              {[
                { label: 'Usuarios totales', value: stats.totalUsers, color: 'var(--gold)' },
                { label: 'Activos hoy', value: stats.activeToday, color: 'var(--green)' },
                { label: 'Predicciones', value: stats.totalPreds, color: '#3b82f6' },
                { label: 'Fantasy guardados', value: stats.totalFantasy, color: '#a855f7' },
                { label: 'Posts foro', value: stats.forumPosts, color: 'var(--text)' },
                { label: 'En vivo ahora', value: stats.liveCount, color: 'var(--red)' },
                { label: 'Finalizados', value: stats.finishedCount, color: 'var(--green)' },
                { label: 'Partidos total', value: stats.totalMatches, color: 'var(--text2)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--s2)', padding: 18, borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ color: 'var(--text2)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</div>
                  <div style={{ color: s.color, fontSize: 28, fontWeight: 800, fontFamily: 'Oswald,sans-serif', marginTop: 4 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: 'var(--s2)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--gold)', margin: '0 0 16px' }}>Secciones más usadas</h3>
                {stats.topPages.length === 0 ? (
                  <p style={{ color: 'var(--text2)', fontSize: 13 }}>Sin datos de navegación aún.</p>
                ) : stats.topPages.map(p => (
                  <div key={p.page} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 13 }}>
                    <span>{p.page}</span>
                    <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{p.count} visitas</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--s2)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--gold)', margin: '0 0 16px' }}>Top usuarios (quiniela)</h3>
                {[...stats.rows].sort((a, b) => b.quinielaPts - a.quinielaPts).slice(0, 8).map((r, i) => (
                  <div key={r.user.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 13 }}>
                    <span>{i + 1}. {r.user.username}</span>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>{r.quinielaPts} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div style={{ background: 'var(--s2)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: 'var(--gold)', margin: 0 }}>Usuarios registrados ({stats.totalUsers})</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ color: 'var(--text2)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px 8px' }}>Usuario</th>
                    <th style={{ padding: '10px 8px' }}>Email</th>
                    <th style={{ padding: '10px 8px' }}>Favorito</th>
                    <th style={{ padding: '10px 8px' }}>Preds</th>
                    <th style={{ padding: '10px 8px' }}>Fantasy</th>
                    <th style={{ padding: '10px 8px' }}>Tiempo app</th>
                    <th style={{ padding: '10px 8px' }}>Última actividad</th>
                    <th style={{ padding: '10px 8px' }}>Usa más</th>
                    <th style={{ padding: '10px 8px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {stats.rows.map(r => (
                    <Fragment key={r.user.id}>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 700 }}>{r.user.username}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text2)' }}>{r.user.email}</td>
                        <td style={{ padding: '12px 8px' }}>{r.user.favTeam}</td>
                        <td style={{ padding: '12px 8px' }}>{r.predictions} ({r.quinielaPts} pts)</td>
                        <td style={{ padding: '12px 8px' }}>{r.fantasyDays} días ({r.fantasyPts} pts)</td>
                        <td style={{ padding: '12px 8px' }}>{formatDuration(r.meta.totalMinutes)}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text2)' }}>{formatRelativeTime(r.meta.lastActive)}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--gold)' }}>{r.topPage}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <button onClick={() => setExpandedUser(expandedUser === r.user.id ? null : r.user.id)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11, marginRight: 6 }}>Ver</button>
                          <button onClick={() => setEditUser({ id: r.user.id, username: r.user.username, email: r.user.email, favTeam: r.user.favTeam })} style={{ background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Editar</button>
                        </td>
                      </tr>
                      {expandedUser === r.user.id && (
                        <tr>
                          <td colSpan={9} style={{ padding: '12px 8px 20px', background: 'rgba(0,0,0,.2)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, fontSize: 12 }}>
                              <div>
                                <strong style={{ color: 'var(--gold)' }}>Cuenta</strong>
                                <p style={{ margin: '6px 0', color: 'var(--text2)' }}>Registro: {new Date(r.meta.createdAt).toLocaleDateString('es')}</p>
                                <p style={{ margin: '6px 0', color: 'var(--text2)' }}>Logins: {r.meta.loginCount}</p>
                                <p style={{ margin: '6px 0', color: 'var(--text2)' }}>Pass: <code style={{ color: 'var(--gold)' }}>{r.user.password}</code></p>
                              </div>
                              <div>
                                <strong style={{ color: 'var(--gold)' }}>Navegación</strong>
                                {Object.entries(r.meta.pageVisits).length === 0 ? (
                                  <p style={{ margin: '6px 0', color: 'var(--text2)' }}>Sin visitas registradas</p>
                                ) : Object.entries(r.meta.pageVisits).sort((a, b) => b[1] - a[1]).map(([p, c]) => (
                                  <p key={p} style={{ margin: '4px 0', color: 'var(--text2)' }}>{PAGE_LABELS[p] || p}: {c}</p>
                                ))}
                              </div>
                              <div>
                                <strong style={{ color: 'var(--gold)' }}>Acciones</strong>
                                <button
                                  onClick={() => { if (confirm(`Eliminar ${r.user.username}?`)) { deleteUserAccount(r.user.id).then(bump).catch(console.error) } }}
                                  style={{ display: 'block', marginTop: 8, background: 'rgba(239,68,68,.15)', border: '1px solid var(--red)', color: 'var(--red)', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                                >
                                  Eliminar usuario
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'activity' && (
          <div style={{ background: 'var(--s2)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
            <h2 style={{ color: 'var(--gold)', margin: '0 0 20px' }}>Actividad por usuario</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...stats.rows].sort((a, b) => new Date(b.meta.lastActive).getTime() - new Date(a.meta.lastActive).getTime()).map(r => (
                <div key={r.user.id} style={{ background: 'var(--s1)', padding: 16, borderRadius: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, fontSize: 13 }}>
                  <div><strong>{r.user.username}</strong><br /><span style={{ color: 'var(--text2)', fontSize: 11 }}>{r.user.email}</span></div>
                  <div><span style={{ color: 'var(--text2)' }}>Tiempo en app</span><br /><strong>{formatDuration(r.meta.totalMinutes)}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Última vez</span><br /><strong>{formatRelativeTime(r.meta.lastActive)}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Sección favorita</span><br /><strong style={{ color: 'var(--gold)' }}>{r.topPage}</strong></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'matches' && (
          <MatchAdminPanel onSave={bump} sync={sync} />
        )}

        {editUser && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
            <div style={{ background: 'var(--s2)', padding: 32, borderRadius: 12, border: '1px solid var(--gold)', minWidth: 360 }}>
              <h3 style={{ color: 'var(--gold)', margin: '0 0 20px' }}>Editar {editUser.username}</h3>
              {(['username', 'email', 'favTeam'] as const).map(field => (
                <div key={field} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase' }}>{field}</label>
                  <input
                    value={editUser[field]}
                    onChange={e => setEditUser({ ...editUser, [field]: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', marginTop: 4, background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 6 }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={() => { adminUpdateUser(editUser.id, editUser).then(() => { setEditUser(null); bump() }).catch(console.error) }} style={{ flex: 1, padding: 12, background: 'var(--gold)', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', color: '#000' }}>Guardar</button>
                <button onClick={() => setEditUser(null)} style={{ flex: 1, padding: 12, background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MatchAdminPanel({ onSave, sync }: { onSave: () => void; sync: SyncPanelProps }) {
  const { source, fdMeta, apiMeta, syncing, runSync, runMapping, configured } = sync
  const fixtureMap = readFixtureMap()
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const matches = getAllMatches().filter(m => {
    if (filter === 'live') return m.status === 'live'
    if (filter === 'upcoming') return m.status === 'upcoming'
    return true
  }).slice(0, 40)

  const selected = matches.find(m => m.id === selectedId) || matches[0]
  const live = selected ? (getMatchLiveState(selected.id) || { status: selected.status, result: selected.result, events: [], minute: 0 }) : null
  const [status, setStatus] = useState<'upcoming' | 'live' | 'finished'>(live?.status || 'upcoming')
  const [scoreH, setScoreH] = useState(String(live?.result?.h ?? 0))
  const [scoreA, setScoreA] = useState(String(live?.result?.a ?? 0))
  const [minute, setMinute] = useState(String(live?.minute ?? 0))
  const [eventMin, setEventMin] = useState('45')
  const [eventType, setEventType] = useState<MatchEvent['type']>('goal')
  const [eventTeam, setEventTeam] = useState<'home' | 'away'>('home')
  const [eventPlayer, setEventPlayer] = useState('')

  const loadMatch = (id: string) => {
    setSelectedId(id)
    const m = getAllMatches().find(x => x.id === id)!
    const s = getMatchLiveState(id) || { status: m.status, result: m.result, events: [], minute: 0 }
    setStatus(s.status)
    setScoreH(String(s.result?.h ?? 0))
    setScoreA(String(s.result?.a ?? 0))
    setMinute(String(s.minute ?? 0))
  }

  const saveMatch = () => {
    if (!selected) return
    const events = getMatchLiveState(selected.id)?.events || []
    setMatchLiveState(selected.id, {
      status,
      result: { h: parseInt(scoreH) || 0, a: parseInt(scoreA) || 0 },
      minute: parseInt(minute) || 0,
      events,
    })
    onSave()
  }

  const addEvent = () => {
    if (!selected) return
    const prev = getMatchLiveState(selected.id)
    const events = [...(prev?.events || []), {
      minute: parseInt(eventMin) || 0,
      type: eventType,
      team: eventTeam,
      player: eventPlayer || undefined,
    }]
    setMatchLiveState(selected.id, {
      status,
      result: { h: parseInt(scoreH) || 0, a: parseInt(scoreA) || 0 },
      minute: parseInt(minute) || 0,
      events,
    })
    setEventPlayer('')
    onSave()
  }

  return (
    <div>
      {isFdConfigured() ? (
        <div style={{ background: 'var(--s2)', padding: 20, borderRadius: 12, border: '1px solid rgba(0,208,94,.35)', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 12px', color: 'var(--green)', fontSize: 16 }}>football-data.org · Resultados automáticos</h3>
          <p style={{ margin: '0 0 8px', color: 'var(--text2)', fontSize: 13 }}>
            Estilo Besoccer sin directo: marcadores, clasificación y goleadores se actualizan solos cada ~3 min cuando acaban los partidos.
          </p>
          <p style={{ margin: '0 0 12px', color: 'var(--text2)', fontSize: 12 }}>
            {fdMeta.lastSync
              ? `Última sync ${formatRelativeTime(fdMeta.lastSync)}`
              : fdMeta.lastError
                ? 'Sync pendiente (revisa el error)'
                : 'Conectando…'}
            {fdMeta.mappedCount > 0 && ` · ${fdMeta.mappedCount} partidos vinculados`}
            {fdMeta.finishedCount > 0
              ? ` · ${fdMeta.finishedCount} finalizados`
              : fdMeta.mappedCount > 0 && !fdMeta.lastError
                ? ' · 0 jugados aún (normal antes del torneo)'
                : ''}
            {fdMeta.standingsLoaded && ' · Clasificación OK'}
            {fdMeta.scorersLoaded && ' · Goleadores OK'}
          </p>
          {fdMeta.lastError && <p style={{ margin: '0 0 12px', color: 'var(--red)', fontSize: 12 }}>{fdMeta.lastError}</p>}
          <button onClick={() => { runSync(true).then(onSave) }} disabled={syncing} style={{ padding: '10px 18px', background: 'var(--green)', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', color: '#000' }}>
            {syncing ? 'Sincronizando…' : 'Sincronizar ahora'}
          </button>
        </div>
      ) : (
        <div style={{ background: 'rgba(245,200,66,.08)', padding: 16, borderRadius: 12, border: '1px solid rgba(245,200,66,.25)', marginBottom: 20, fontSize: 13, color: 'var(--text2)' }}>
          Para resultados automáticos (gratis): regístrate en{' '}
          <a href="https://www.football-data.org/client/register" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>football-data.org</a>
          , copia el token a <code>VITE_FOOTBALL_DATA_TOKEN</code> en <code>.env</code> y reinicia el servidor.
        </div>
      )}

      <div style={{ background: 'var(--s2)', padding: 20, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px', color: 'var(--gold)', fontSize: 16 }}>API-Football · En vivo (plan de pago)</h3>
        {configured && source !== 'football-data' ? (
          <>
            <p style={{ margin: '0 0 12px', color: 'var(--text2)', fontSize: 13 }}>
              Conectado · {Object.keys(fixtureMap).length} partidos mapeados ·
              {apiMeta.lastSync ? ` última sync ${formatRelativeTime(apiMeta.lastSync)}` : ' sin sync aún'}
            </p>
            {apiMeta.planBlocked ? (
              <div style={{ marginBottom: 12, padding: 14, background: 'rgba(245,200,66,.1)', border: '1px solid rgba(245,200,66,.35)', borderRadius: 8 }}>
                <p style={{ margin: '0 0 8px', color: 'var(--gold)', fontWeight: 700, fontSize: 13 }}>Plan Free — Mundial 2026 no disponible</p>
                <p style={{ margin: 0, color: 'var(--text2)', fontSize: 12, lineHeight: 1.5 }}>
                  API-Football solo incluye temporadas 2022–2024 en el plan gratis. Para datos automáticos del Mundial 2026 necesitas un plan de pago (~10 USD/mes).
                  Mientras tanto usa la <strong>edición manual</strong> de abajo: elige un partido, pon En vivo, marca el resultado y guarda.
                </p>
              </div>
            ) : apiMeta.lastError ? (
              <p style={{ margin: '0 0 12px', color: 'var(--red)', fontSize: 12 }}>{apiMeta.lastError}</p>
            ) : null}
            {!apiMeta.planBlocked && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => { runMapping().then(onSave) }} disabled={syncing} style={{ padding: '10px 18px', background: 'rgba(59,130,246,.2)', border: '1px solid #3b82f6', borderRadius: 6, color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>
                Sync API-Football
              </button>
            </div>
            )}
          </>
        ) : (
          <p style={{ margin: 0, color: 'var(--text2)', fontSize: 13 }}>Opcional. El plan Free no incluye Mundial 2026.</p>
        )}
      </div>
      <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>
        Edición manual de emergencia (si algún partido no cuadra con la API).
      </p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {(['all', 'upcoming', 'live'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', background: filter === f ? 'var(--gold)' : 'var(--s2)', color: filter === f ? '#000' : 'var(--text)', fontWeight: 600 }}>{f === 'all' ? 'Todos' : f === 'live' ? 'En vivo' : 'Próximos'}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        <div style={{ background: 'var(--s2)', borderRadius: 12, border: '1px solid var(--border)', maxHeight: 500, overflowY: 'auto' }}>
          {matches.map(m => (
            <button key={m.id} onClick={() => loadMatch(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', background: selected?.id === m.id ? 'rgba(245,200,66,.1)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,.05)', cursor: 'pointer', color: 'var(--text)', textAlign: 'left' }}>
              <FlagImg code={m.home.flag} size={20} />
              <span style={{ fontSize: 13, flex: 1 }}>{m.home.abbr} vs {m.away.abbr}</span>
              {m.status === 'live' && <span style={{ color: 'var(--red)', fontSize: 10, fontWeight: 800 }}>LIVE</span>}
              {m.result && <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{m.result.h}-{m.result.a}</span>}
            </button>
          ))}
        </div>
        {selected && (
          <div style={{ background: 'var(--s2)', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 16px', color: 'var(--gold)' }}>{selected.home.name} vs {selected.away.name}</h3>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>{formatLocalKickoffLabel(selected.calendarDay, selected.kickoff)} · Grupo {selected.group}</p>
            <label style={{ fontSize: 11, color: 'var(--text2)' }}>Estado</label>
            <select value={status} onChange={e => setStatus(e.target.value as typeof status)} style={{ width: '100%', padding: 10, marginBottom: 12, background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 6 }}>
              <option value="upcoming">Próximo</option>
              <option value="live">En vivo</option>
              <option value="finished">Finalizado</option>
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div><label style={{ fontSize: 11, color: 'var(--text2)' }}>Local</label><input type="number" value={scoreH} onChange={e => setScoreH(e.target.value)} style={{ width: '100%', padding: 8, background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 6 }} /></div>
              <div><label style={{ fontSize: 11, color: 'var(--text2)' }}>Visit.</label><input type="number" value={scoreA} onChange={e => setScoreA(e.target.value)} style={{ width: '100%', padding: 8, background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 6 }} /></div>
              <div><label style={{ fontSize: 11, color: 'var(--text2)' }}>Min</label><input type="number" value={minute} onChange={e => setMinute(e.target.value)} style={{ width: '100%', padding: 8, background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 6 }} /></div>
            </div>
            <button onClick={saveMatch} style={{ width: '100%', padding: 12, background: 'var(--gold)', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', color: '#000', marginBottom: 16 }}>Guardar marcador</button>
            <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>Añadir evento</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <input placeholder="Min" value={eventMin} onChange={e => setEventMin(e.target.value)} style={{ padding: 8, background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 6 }} />
              <input placeholder="Jugador" value={eventPlayer} onChange={e => setEventPlayer(e.target.value)} style={{ padding: 8, background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 6 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <select value={eventType} onChange={e => setEventType(e.target.value as MatchEvent['type'])} style={{ padding: 8, background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 6 }}>
                <option value="goal">Gol</option>
                <option value="yellow">Amarilla</option>
                <option value="red">Roja</option>
                <option value="sub">Cambio</option>
                <option value="kickoff">Inicio</option>
                <option value="halftime">Descanso</option>
                <option value="fulltime">Final</option>
              </select>
              <select value={eventTeam} onChange={e => setEventTeam(e.target.value as 'home' | 'away')} style={{ padding: 8, background: 'var(--s1)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 6 }}>
                <option value="home">{selected.home.abbr}</option>
                <option value="away">{selected.away.abbr}</option>
              </select>
            </div>
            <button onClick={addEvent} style={{ width: '100%', padding: 10, background: 'rgba(59,130,246,.2)', border: '1px solid #3b82f6', borderRadius: 6, color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>+ Evento</button>
            {(getMatchLiveState(selected.id)?.events || []).length > 0 && (
              <div style={{ marginTop: 16, fontSize: 12 }}>
                <strong style={{ color: 'var(--gold)' }}>Cronología</strong>
                {(getMatchLiveState(selected.id)?.events || []).map((ev, i) => (
                  <p key={i} style={{ margin: '4px 0', color: 'var(--text2)' }}>{ev.minute}' {ev.type} {ev.player || ''} ({ev.team === 'home' ? selected.home.abbr : selected.away.abbr})</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
