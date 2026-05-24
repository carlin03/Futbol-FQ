import { useState, useEffect } from 'react'
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
import {
  getSession, setSession, getPredictions, setPredictions,
  getFantasyAll, initStorage, ensureRankingParticipant, type Session,
} from './utils/storage'
import { trackPageVisit } from './utils/adminStats'
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
  const [session, setSessionState] = useState<Session | null>(() => getSession())
  const [page, setPageState] = useState('home')
  const [showAdmin, setShowAdmin] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [matchViewMode, setMatchViewMode] = useState<'info' | 'predict'>('predict')

  const [matchBackPage, setMatchBackPage] = useState('groups')

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

  useEffect(() => { initStorage() }, [])

  useEffect(() => {
    const s = getSession()
    if (s?.userId) ensureRankingParticipant(s.userId)
  }, [])

  useEffect(() => {
    if (session) trackPageVisit(page)
  }, [page, session?.userId])

  const userId = session?.userId || ''
  const username = session?.username || ''
  const favTeam = session?.favTeam || ''

  const [predictions, setPredictionsState] = useState<Record<string, any>>(() =>
    userId ? getPredictions(userId) : {}
  )

  const [fantasyAll, setFantasyAll] = useState<Record<number, any>>(() =>
    userId ? getFantasyAll(userId) : {}
  )

  const handleSetup = (userId: string, uname: string, fav: string) => {
    const s: Session = { userId, username: uname, favTeam: fav, loginTime: new Date().toISOString() }
    setSession(s)
    setSessionState(s)
    setPredictionsState(getPredictions(userId))
    setFantasyAll(getFantasyAll(userId))
  }

  const handleSetPredictions = (p: Record<string, any>) => {
    setPredictionsState(p)
    if (userId) setPredictions(userId, p)
  }

  const handleSetFantasyAll = (f: Record<number, any>) => {
    setFantasyAll(f)
    if (userId) {
      localStorage.setItem(`wc_fantasy_${userId}`, JSON.stringify(f))
    }
  }

  const matchSync = useMatchDataSync(!!session)
  const { source: dataSource, fdMeta, apiMeta, configured: dataConfigured } = matchSync

  const navPage = page.startsWith('team_') ? 'groups'
    : page.startsWith('match_') ? matchBackPage
    : page === 'profile' ? 'home'
    : page

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
            <Leaderboard userId={userId} username={username} predictions={predictions} fantasyAll={fantasyAll} />
          )}
          {page === 'forum' && <Forum username={username} />}
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
              onProfileUpdate={(uname, fav) => {
                const s = { userId, username: uname, favTeam: fav, loginTime: new Date().toISOString() }
                setSession(s)
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
