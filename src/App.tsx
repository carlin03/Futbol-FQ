import { useState, useEffect, useCallback } from 'react'
import Setup from './components/Setup'
import Header from './components/Header'
import Home from './components/Home'
import Groups from './components/Groups'
import MatchDetail from './components/MatchDetail'
import Fantasy from './components/Fantasy'
import Leaderboard from './components/Leaderboard'
import Forum from './components/Forum'
import Admin from './components/Admin'
import TopTicker from './components/TopTicker'
import Profile from './components/Profile'
import Stats from './components/Stats'
import TeamDetail from './components/TeamDetail'
import Quiniela from './components/Quiniela'
import { isSupabaseConfigured, requireSupabase } from './lib/supabase'
import {
  ensureUserProfile, profileToSession, fetchPredictions, savePredictions,
  fetchFantasyAll, saveFantasyAll, recordLogin, trackPageVisit, loadMatchStates,
} from './services/database'
import type { Session, Prediction, FantasyLineup } from './utils/storage'
import type { AuthUserMeta } from './utils/authMeta'
import { authMetaFromUser } from './utils/authMeta'
import { useMatchDataSync } from './hooks/useLiveSync'

function Background() {
  return (
    <div className="wc-bg">
      <div className="wc-bg-center-clear" aria-hidden />
      <div className="wc-bg-hero-glow" aria-hidden />
    </div>
  )
}

export default function App() {
  const [session, setSessionState] = useState<Session | null>(null)
  const [page, setPageState] = useState('home')
  const [showAdmin, setShowAdmin] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [matchViewMode, setMatchViewMode] = useState<'info' | 'predict'>('predict')
  const [matchBackPage, setMatchBackPage] = useState('groups')
  const [predictions, setPredictionsState] = useState<Record<string, Prediction>>({})
  const [fantasyAll, setFantasyAll] = useState<Record<number, FantasyLineup>>({})

  const hydrateUser = useCallback(async (userId: string, fromAuth?: AuthUserMeta) => {
    const profile = await ensureUserProfile(userId, fromAuth)
    const s = await profileToSession(profile)
    setSessionState(s)
    void Promise.all([
      fetchPredictions(userId),
      fetchFantasyAll(userId),
    ]).then(([preds, fantasy]) => {
      setPredictionsState(preds)
      setFantasyAll(fantasy)
    }).catch(console.error)
    void recordLogin(userId).catch(console.error)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    loadMatchStates().catch(console.error)

    const sb = requireSupabase()
    let mounted = true
    let subscription: { unsubscribe: () => void } | null = null

    void (async () => {
      try {
        const { data, error } = await sb.auth.getSession()
        if (!mounted) return
        if (error) throw error

        if (data.session?.user) {
          void hydrateUser(data.session.user.id, authMetaFromUser(data.session.user)).catch(console.error)
        }
      } catch (err) {
        console.error('Error al cargar sesión:', err)
      }

      if (!mounted) return

      const { data: { subscription: sub } } = sb.auth.onAuthStateChange((event, authSession) => {
        if (event === 'INITIAL_SESSION') return
        if (authSession?.user) {
          void hydrateUser(authSession.user.id, authMetaFromUser(authSession.user)).catch(console.error)
        } else {
          setSessionState(null)
          setPredictionsState({})
          setFantasyAll({})
        }
      })
      subscription = sub
    })()

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [hydrateUser])

  const setPage = (p: string) => {
    if (p === 'livedata') {
      localStorage.setItem('wc_groups_tab', 'calendar')
      setPageState('groups')
      return
    }
    setPageState(p)
  }

  const openMatch = (id: string, mode: 'info' | 'predict' = 'predict', backPage = page.startsWith('match_') ? matchBackPage : page) => {
    setMatchBackPage(backPage)
    setSelectedMatch(id)
    setMatchViewMode(mode)
    setPageState(`match_${id}`)
  }

  useEffect(() => {
    if (session?.userId) trackPageVisit(session.userId, page).catch(console.error)
  }, [page, session?.userId])

  const userId = session?.userId || ''
  const username = session?.username || ''
  const favTeam = session?.favTeam || ''

  const handleSetup = (uid: string, meta?: AuthUserMeta) => {
    void hydrateUser(uid, meta).catch(err => {
      console.error('Error al entrar:', err)
    })
  }

  const handleSetPredictions = (p: Record<string, Prediction>) => {
    setPredictionsState(p)
    if (userId) savePredictions(userId, p).catch(console.error)
  }

  const handleSetFantasyAll = (f: Record<number, FantasyLineup>) => {
    setFantasyAll(f)
    if (userId) saveFantasyAll(userId, f).catch(console.error)
  }

  const matchSync = useMatchDataSync(!!session)
  const { source: dataSource, fdMeta, apiMeta, configured: dataConfigured } = matchSync

  const navPage = page.startsWith('team_') ? 'groups'
    : page.startsWith('match_') ? matchBackPage
    : page === 'profile' ? 'home'
    : page

  if (!isSupabaseConfigured()) {
    return (
      <>
        <Background />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '80px auto', padding: 24, textAlign: 'center', color: 'var(--text)' }}>
          <h1 style={{ color: 'var(--gold)' }}>Falta Supabase</h1>
          <p style={{ color: 'var(--text2)', lineHeight: 1.6 }}>
            Añade <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> en Vercel → Environment Variables y en tu archivo <code>.env</code> local.
          </p>
        </div>
      </>
    )
  }

  if (!session) {
    return (
      <>
        <Background />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Setup onSetup={handleSetup} />
        </div>
      </>
    )
  }

  return (
    <>
      <Background />
      {showAdmin && (
        <Admin
          session={session}
          onClose={() => setShowAdmin(false)}
          sync={{
            source: matchSync.source,
            fdMeta: matchSync.fdMeta,
            apiMeta: matchSync.apiMeta,
            syncing: matchSync.syncing,
            configured: matchSync.configured,
            runSync: matchSync.runSync,
            runMapping: matchSync.runMapping,
          }}
        />
      )}
      <a href="#main-content" className="wc-skip-link">Saltar al contenido</a>
      <div className="wc-app-shell" style={{ position: 'relative', zIndex: 1 }}>
        <Header page={page} navPage={navPage} setPage={setPage} username={username} onAdminClick={() => setShowAdmin(true)} />
        <TopTicker dataSource={dataSource} fdMeta={fdMeta} apiMeta={apiMeta} dataConfigured={dataConfigured} />
        <main id="main-content">
          {page === 'home' && (
            <Home
              setPage={setPage}
              predictions={predictions}
              username={username}
              userId={userId}
              onMatchClick={(m) => openMatch(m, 'predict')}
            />
          )}
          {page === 'groups' && !selectedTeam && (
            <Groups
              onMatchClick={(m, mode) => openMatch(m, mode || 'info', 'groups')}
              onTeamClick={(abbr) => {
                setSelectedTeam(abbr)
                setPageState(`team_${abbr}`)
              }}
            />
          )}
          {selectedTeam && page === `team_${selectedTeam}` && (
            <TeamDetail
              teamAbbr={selectedTeam}
              onBack={() => { setSelectedTeam(null); setPageState('groups') }}
              onMatchClick={(m) => openMatch(m, 'info')}
            />
          )}
          {page === 'ranking' && (
            <Leaderboard userId={userId} predictions={predictions} fantasyAll={fantasyAll} />
          )}
          {page === 'forum' && <Forum userId={userId} username={username} />}
          {page === 'quiniela' && (
            <Quiniela
              predictions={predictions}
              onMatchClick={(m) => openMatch(m, 'predict', 'quiniela')}
              onSavePrediction={(id, pred) => handleSetPredictions({ ...predictions, [id]: pred })}
            />
          )}
          {page === 'fantasy' && (
            <Fantasy userId={userId} fantasyAll={fantasyAll} setFantasyAll={handleSetFantasyAll} />
          )}
          {page === 'stats' && (
            <Stats
              predictions={predictions}
              username={username}
              onMatchClick={(m) => openMatch(m, 'info')}
            />
          )}
          {page === 'profile' && (
            <Profile
              userId={userId}
              username={username}
              favTeam={favTeam}
              predictions={predictions}
              fantasyAll={fantasyAll}
              onBack={() => setPageState('home')}
              onProfileUpdate={async (uname, fav) => {
                const s = { userId, username: uname, favTeam: fav, loginTime: session.loginTime }
                setSessionState(s)
              }}
            />
          )}
          {selectedMatch && page === `match_${selectedMatch}` && (
            <MatchDetail
              matchId={selectedMatch}
              viewMode={matchViewMode}
              predictions={predictions}
              onPredictionChange={(pred) => {
                if (pred) {
                  handleSetPredictions({ ...predictions, [selectedMatch]: pred })
                } else {
                  const next = { ...predictions }
                  delete next[selectedMatch]
                  handleSetPredictions(next)
                }
              }}
              onBack={() => { setSelectedMatch(null); setPageState(matchBackPage) }}
            />
          )}
        </main>
      </div>
    </>
  )
}
