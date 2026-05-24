import { buildOfficialGroups } from './fixtures'
import { getFullSquad } from './squadsIndex'
import { buildMatchLineup } from '../utils/lineups'
import { getLocalDayFromKickoff } from '../utils/timezone'
import { getLocalScheduleDays, isKnockoutLocalKey } from './calendar'
import { applyMatchOverride } from './matchState'

export interface Team {
  name: string
  flag: string
  abbr: string
}

export interface Match {
  id: string
  group: string
  home: Team
  away: Team
  date: string
  kickoff: string
  venue: string
  city: string
  status: 'upcoming' | 'live' | 'finished'
  result?: { h: number; a: number }
  day: number
  calendarDay: number
}

export interface LineupPlayer {
  name: string
  number: number
  pos: 'gk' | 'def' | 'mid' | 'fwd'
}

export interface MatchLineup {
  formation: string
  starters: LineupPlayer[]
  subs: LineupPlayer[]
}

export interface PlayerMatchStats {
  goals?: number
  assists?: number
  cleanSheet?: boolean
  yellow?: number
  red?: number
  minutes?: number
}

export interface Group {
  id: string
  name: string
  matches: Match[]
}

export interface Player {
  name: string
  flag: string
  team: string
  pos: 'gk' | 'def' | 'mid' | 'fwd'
  r: number
  days: number[]
  calendarDays?: number[]
}

const t = (name: string, flag: string, abbr: string): Team => ({ name, flag, abbr })

// EQUIPOS
const MEX = t('México',        'mx', 'MEX')
const KOR = t('Corea del Sur', 'kr', 'KOR')
const RSA = t('Sudáfrica',     'za', 'RSA')
const CZE = t('Chequia',       'cz', 'CZE')

const CAN = t('Canadá',     'ca', 'CAN')
const SUI = t('Suiza',      'ch', 'SUI')
const QAT = t('Qatar',      'qa', 'QAT')
const BIH = t('Bosnia',     'ba', 'BIH')

const BRA = t('Brasil',    'br', 'BRA')
const MAR = t('Marruecos', 'ma', 'MAR')
const SCO = t('Escocia',   'gb-sct', 'SCO')
const HAI = t('Haití',     'ht', 'HAI')

const USA = t('Estados Unidos', 'us', 'USA')
const PAR = t('Paraguay',       'py', 'PAR')
const AUS = t('Australia',      'au', 'AUS')
const TUR = t('Turquía',        'tr', 'TUR')

const GER = t('Alemania',        'de', 'GER')
const ECU = t('Ecuador',         'ec', 'ECU')
const CIV = t('Costa de Marfil', 'ci', 'CIV')
const CUW = t('Curazao',         'cw', 'CUW')

const NED = t('Países Bajos', 'nl', 'NED')
const JPN = t('Japón',        'jp', 'JPN')
const TUN = t('Túnez',        'tn', 'TUN')
const SWE = t('Suecia',       'se', 'SWE')

const BEL = t('Bélgica',       'be', 'BEL')
const IRN = t('Irán',          'ir', 'IRN')
const EGY = t('Egipto',        'eg', 'EGY')
const NZL = t('Nueva Zelanda', 'nz', 'NZL')

const ESP = t('España',       'es', 'ESP')
const URU = t('Uruguay',      'uy', 'URU')
const KSA = t('Arabia Saudí', 'sa', 'KSA')
const CPV = t('Cabo Verde',   'cv', 'CPV')

const FRA = t('Francia',  'fr', 'FRA')
const SEN = t('Senegal',  'sn', 'SEN')
const NOR = t('Noruega',  'no', 'NOR')
const IRQ = t('Iraq',     'iq', 'IRQ')

const ARG = t('Argentina', 'ar', 'ARG')
const AUT = t('Austria',   'at', 'AUT')
const ALG = t('Argelia',   'dz', 'ALG')
const JOR = t('Jordania',  'jo', 'JOR')

const POR = t('Portugal',    'pt', 'POR')
const COL = t('Colombia',    'co', 'COL')
const UZB = t('Uzbekistán',  'uz', 'UZB')
const COD = t('RD Congo',    'cd', 'COD')

const ENG = t('Inglaterra', 'gb-eng', 'ENG')
const CRO = t('Croacia',    'hr',     'CRO')
const PAN = t('Panamá',     'pa',     'PAN')
const GHA = t('Ghana',      'gh',     'GHA')

// ===== BASE DE DATOS DE JUGADORES =====

export const PLAYERS_DB: Record<string, Player[]> = {
  gk: [
    // DÍA 1 (11 Jun)
    { name: 'Guillermo Ochoa',   flag: 'mx', team: 'México',       pos: 'gk', r: 87, days: [1] },
    { name: 'Ronwen Williams',   flag: 'za', team: 'Sudáfrica',    pos: 'gk', r: 84, days: [1] },
    { name: 'Tomáš Vaclík',      flag: 'cz', team: 'Chequia',      pos: 'gk', r: 83, days: [1] },
    { name: 'Lee Seung-gon',     flag: 'kr', team: 'Corea del Sur',pos: 'gk', r: 82, days: [1] },
    
    // DÍA 2 (12 Jun)
    { name: 'Alphonse Área',     flag: 'ca', team: 'Canadá',      pos: 'gk', r: 81, days: [2] },
    { name: 'Yann Sommer',       flag: 'ch', team: 'Suiza',       pos: 'gk', r: 89, days: [2] },
    { name: 'Alisson Becker',    flag: 'br', team: 'Brasil',      pos: 'gk', r: 91, days: [2] },
    { name: 'Bono',              flag: 'ma', team: 'Marruecos',   pos: 'gk', r: 85, days: [2] },
    
    // DÍAS 3+ (13-16 Jun)
    { name: 'Manuel Neuer',      flag: 'de', team: 'Alemania',    pos: 'gk', r: 87, days: [3] },
    { name: 'Remko Pasveer',     flag: 'nl', team: 'Países Bajos',pos: 'gk', r: 84, days: [3] },
    { name: 'Wojciech Szczęsny', flag: 'pl', team: 'Polonia',     pos: 'gk', r: 86, days: [4] },
    { name: 'Gianluigi Donnarumma', flag: 'it', team: 'Italia', pos: 'gk', r: 89, days: [4] },
    { name: 'David de Gea',      flag: 'es', team: 'España',      pos: 'gk', r: 85, days: [4] },
    { name: 'Sergio Rochet',     flag: 'uy', team: 'Uruguay',     pos: 'gk', r: 82, days: [4] },
    { name: 'Mike Maignan',      flag: 'fr', team: 'Francia',     pos: 'gk', r: 88, days: [5] },
    { name: 'Rui Patrício',      flag: 'pt', team: 'Portugal',    pos: 'gk', r: 83, days: [6] },
    { name: 'Pickford',          flag: 'gb-eng', team: 'Inglaterra', pos: 'gk', r: 84, days: [6] },
    { name: 'Thibaut Courtois',  flag: 'be', team: 'Bélgica',     pos: 'gk', r: 88, days: [3] },
  ],
  
  def: [
    // DEFENSAS DÍA 1
    { name: 'Héctor Moreno',     flag: 'mx', team: 'México',      pos: 'def', r: 83, days: [1] },
    { name: 'Issa Diop',         flag: 'sn', team: 'Senegal',     pos: 'def', r: 84, days: [1] },
    { name: 'Thiago Silva',      flag: 'br', team: 'Brasil',      pos: 'def', r: 85, days: [2] },
    { name: 'Rúben Dias',        flag: 'pt', team: 'Portugal',    pos: 'def', r: 89, days: [6] },
    { name: 'Van Dijk',          flag: 'nl', team: 'Países Bajos',pos: 'def', r: 90, days: [3] },
    { name: 'Rüdiger',           flag: 'de', team: 'Alemania',    pos: 'def', r: 87, days: [3] },
    { name: 'Gvardiol',          flag: 'hr', team: 'Croacia',     pos: 'def', r: 87, days: [6] },
    { name: 'Kyle Walker',       flag: 'gb-eng', team: 'Inglaterra', pos: 'def', r: 86, days: [6] },
    { name: 'Juan Foyth',        flag: 'ar', team: 'Argentina',   pos: 'def', r: 83, days: [5] },
    { name: 'Aurélien Tchouaméni', flag: 'fr', team: 'Francia',   pos: 'def', r: 86, days: [5] },
    { name: 'Saliba',            flag: 'fr', team: 'Francia',     pos: 'def', r: 87, days: [5] },
    { name: 'Carvajal',          flag: 'es', team: 'España',      pos: 'def', r: 86, days: [4] },
    { name: 'Albiol',            flag: 'es', team: 'España',      pos: 'def', r: 84, days: [4] },
    { name: 'Militão',           flag: 'br', team: 'Brasil',      pos: 'def', r: 87, days: [2] },
    { name: 'Castagne',          flag: 'be', team: 'Bélgica',     pos: 'def', r: 82, days: [3] },
    { name: 'Denayer',           flag: 'be', team: 'Bélgica',     pos: 'def', r: 83, days: [3] },
    { name: 'Koulibaly',         flag: 'sn', team: 'Senegal',     pos: 'def', r: 86, days: [1] },
    { name: 'Vestergaard',       flag: 'se', team: 'Suecia',      pos: 'def', r: 82, days: [3] },
    { name: 'Akanji',            flag: 'ch', team: 'Suiza',       pos: 'def', r: 85, days: [2] },
    { name: 'Schar',             flag: 'ch', team: 'Suiza',       pos: 'def', r: 84, days: [2] },
    { name: 'Acuña',             flag: 'ar', team: 'Argentina',   pos: 'def', r: 83, days: [5] },
    { name: 'Otamendi',          flag: 'ar', team: 'Argentina',   pos: 'def', r: 82, days: [5] },
    { name: 'Davies',            flag: 'ca', team: 'Canadá',      pos: 'def', r: 86, days: [2] },
    { name: 'Johnston',          flag: 'gb-sct', team: 'Escocia', pos: 'def', r: 81, days: [2] },
    { name: 'Hickey',            flag: 'gb-eng', team: 'Inglaterra', pos: 'def', r: 82, days: [6] },
  ],
  
  mid: [
    // CENTROCAMPISTAS
    { name: 'Rodri',             flag: 'es', team: 'España',      pos: 'mid', r: 92, days: [4] },
    { name: 'De Bruyne',         flag: 'be', team: 'Bélgica',     pos: 'mid', r: 91, days: [3] },
    { name: 'Bellingham',        flag: 'gb-eng', team: 'Inglaterra', pos: 'mid', r: 91, days: [6] },
    { name: 'Kroos',             flag: 'de', team: 'Alemania',    pos: 'mid', r: 91, days: [3] },
    { name: 'Pedri',             flag: 'es', team: 'España',      pos: 'mid', r: 91, days: [4] },
    { name: 'Modrić',            flag: 'hr', team: 'Croacia',     pos: 'mid', r: 89, days: [6] },
    { name: 'D. Rice',           flag: 'gb-eng', team: 'Inglaterra', pos: 'mid', r: 88, days: [6] },
    { name: 'B. Fernandes',      flag: 'pt', team: 'Portugal',    pos: 'mid', r: 88, days: [6] },
    { name: 'Wirtz',             flag: 'de', team: 'Alemania',    pos: 'mid', r: 88, days: [3] },
    { name: 'Valverde',          flag: 'uy', team: 'Uruguay',     pos: 'mid', r: 87, days: [4] },
    { name: 'Mac Allister',      flag: 'ar', team: 'Argentina',   pos: 'mid', r: 86, days: [5] },
    { name: 'Camavinga',         flag: 'fr', team: 'Francia',     pos: 'mid', r: 86, days: [5] },
    { name: 'Grealish',          flag: 'gb-eng', team: 'Inglaterra', pos: 'mid', r: 86, days: [6] },
    { name: 'Foden',             flag: 'gb-eng', team: 'Inglaterra', pos: 'mid', r: 88, days: [6] },
    { name: 'Bernardo Silva',    flag: 'pt', team: 'Portugal',    pos: 'mid', r: 85, days: [6] },
    { name: 'Gavi',              flag: 'es', team: 'España',      pos: 'mid', r: 87, days: [4] },
    { name: 'Kimmich',           flag: 'de', team: 'Alemania',    pos: 'mid', r: 86, days: [3] },
    { name: 'Sane',              flag: 'de', team: 'Alemania',    pos: 'mid', r: 85, days: [3] },
    { name: 'Aouar',             flag: 'fr', team: 'Francia',     pos: 'mid', r: 84, days: [5] },
    { name: 'Zielinski',         flag: 'pl', team: 'Polonia',     pos: 'mid', r: 84, days: [3] },
    { name: 'Verhoeven',         flag: 'nl', team: 'Países Bajos',pos: 'mid', r: 83, days: [3] },
    { name: 'Çalhanoglu',        flag: 'tr', team: 'Turquía',     pos: 'mid', r: 84, days: [4] },
    { name: 'Thorp',             flag: 'us', team: 'USA',         pos: 'mid', r: 81, days: [4] },
    { name: 'Musah',             flag: 'us', team: 'USA',         pos: 'mid', r: 83, days: [4] },
    { name: 'Kudus',             flag: 'gh', team: 'Ghana',       pos: 'mid', r: 82, days: [6] },
  ],
  
  fwd: [
    // DELANTEROS
    { name: 'Mbappé',            flag: 'fr', team: 'Francia',     pos: 'fwd', r: 95, days: [5] },
    { name: 'Haaland',           flag: 'no', team: 'Noruega',     pos: 'fwd', r: 94, days: [5] },
    { name: 'Vinicius Jr.',      flag: 'br', team: 'Brasil',      pos: 'fwd', r: 93, days: [2] },
    { name: 'Messi',             flag: 'ar', team: 'Argentina',   pos: 'fwd', r: 93, days: [5] },
    { name: 'Kane',              flag: 'gb-eng', team: 'Inglaterra', pos: 'fwd', r: 91, days: [6] },
    { name: 'Ronaldo',           flag: 'pt', team: 'Portugal',    pos: 'fwd', r: 90, days: [6] },
    { name: 'Lewandowski',       flag: 'pl', team: 'Polonia',     pos: 'fwd', r: 90, days: [3] },
    { name: 'Yamal',             flag: 'es', team: 'España',      pos: 'fwd', r: 90, days: [4] },
    { name: 'Núñez',             flag: 'uy', team: 'Uruguay',     pos: 'fwd', r: 88, days: [4] },
    { name: 'Saka',              flag: 'gb-eng', team: 'Inglaterra', pos: 'fwd', r: 88, days: [6] },
    { name: 'Osimhen',           flag: 'ng', team: 'Nigeria',     pos: 'fwd', r: 88, days: [4] },
    { name: 'Salah',             flag: 'eg', team: 'Egipto',      pos: 'fwd', r: 88, days: [4] },
    { name: 'L. Díaz',           flag: 'co', team: 'Colombia',    pos: 'fwd', r: 87, days: [6] },
    { name: 'Leão',              flag: 'pt', team: 'Portugal',    pos: 'fwd', r: 87, days: [6] },
    { name: 'Dybala',            flag: 'ar', team: 'Argentina',   pos: 'fwd', r: 86, days: [5] },
    { name: 'Barcola',           flag: 'fr', team: 'Francia',     pos: 'fwd', r: 85, days: [5] },
    { name: 'Rodallega',         flag: 'co', team: 'Colombia',    pos: 'fwd', r: 81, days: [6] },
    { name: 'Tadic',             flag: 'rs', team: 'Serbia',      pos: 'fwd', r: 84, days: [0] },
    { name: 'Neymar',            flag: 'br', team: 'Brasil',      pos: 'fwd', r: 89, days: [2] },
    { name: 'Vinícius',          flag: 'br', team: 'Brasil',      pos: 'fwd', r: 92, days: [2] },
    { name: 'Solanke',           flag: 'gb-eng', team: 'Inglaterra', pos: 'fwd', r: 83, days: [6] },
    { name: 'Lozano',            flag: 'mx', team: 'México',      pos: 'fwd', r: 84, days: [1, 2, 3] },
    { name: 'Son Heung-min',     flag: 'kr', team: 'Corea del Sur', pos: 'fwd', r: 88, days: [1, 2, 3] },
    { name: 'Giroud',            flag: 'fr', team: 'Francia',     pos: 'fwd', r: 82, days: [5] },
    { name: 'Griezmann',         flag: 'fr', team: 'Francia',     pos: 'fwd', r: 83, days: [5] },
    { name: 'Thuram',            flag: 'fr', team: 'Francia',     pos: 'fwd', r: 84, days: [5] },
    { name: 'Benzema',           flag: 'fr', team: 'Francia',     pos: 'fwd', r: 85, days: [5] },
    { name: 'Depay',             flag: 'nl', team: 'Países Bajos',pos: 'fwd', r: 84, days: [3] },
    { name: 'Gakpo',             flag: 'nl', team: 'Países Bajos',pos: 'fwd', r: 85, days: [3] },
    { name: 'Weghorst',          flag: 'nl', team: 'Países Bajos',pos: 'fwd', r: 83, days: [3] },
  ]
}

export const GROUPS: Group[] = buildOfficialGroups({
  A: [MEX, KOR, RSA, CZE],
  B: [CAN, SUI, QAT, BIH],
  C: [BRA, MAR, SCO, HAI],
  D: [USA, PAR, AUS, TUR],
  E: [GER, ECU, CIV, CUW],
  F: [NED, JPN, TUN, SWE],
  G: [BEL, IRN, EGY, NZL],
  H: [ESP, URU, KSA, CPV],
  I: [FRA, SEN, NOR, IRQ],
  J: [ARG, AUT, ALG, JOR],
  K: [POR, COL, UZB, COD],
  L: [ENG, CRO, PAN, GHA],
})

export const MATCH_LINEUPS: Record<string, { home: MatchLineup; away: MatchLineup }> = {}

export const PLAYER_MATCH_STATS: Record<string, Record<string, PlayerMatchStats>> = {}

export function getMatchLineup(matchId: string) {
  if (MATCH_LINEUPS[matchId]) return MATCH_LINEUPS[matchId]
  const match = getAllMatches().find(m => m.id === matchId)
  if (!match) return null
  return buildMatchLineup(match.home.abbr, match.away.abbr)
}

export function getPlayerStatsForCalendarDay(calendarDay: number): Record<string, PlayerMatchStats> {
  const stats: Record<string, PlayerMatchStats> = {}
  getMatchesByCalendarDay(calendarDay).forEach(m => {
    const matchStats = PLAYER_MATCH_STATS[m.id]
    if (matchStats) Object.assign(stats, matchStats)
  })
  return stats
}

export function getPlayerStatsForDay(day: number): Record<string, PlayerMatchStats> {
  return getPlayerStatsForCalendarDay(day)
}

export function calcFantasyPlayerPts(
  player: { name: string; pos: string },
  stats: PlayerMatchStats | undefined,
  isCaptain = false
): number {
  if (!stats || !stats.minutes) return 0
  let pts = 1 // aparición
  const gMult = player.pos === 'fwd' ? 4 : player.pos === 'mid' ? 5 : 6
  pts += (stats.goals || 0) * gMult
  pts += (stats.assists || 0) * 3
  if (stats.cleanSheet && (player.pos === 'gk' || player.pos === 'def')) pts += 4
  pts -= (stats.yellow || 0) * 1
  pts -= (stats.red || 0) * 3
  if (isCaptain) pts = Math.round(pts * 1.5)
  return pts
}

export function getPlayerStatsForLocalDay(localKey: number): Record<string, PlayerMatchStats> {
  const stats: Record<string, PlayerMatchStats> = {}
  getAllMatches().forEach(m => {
    const ld = getLocalDayFromKickoff(m.calendarDay, m.kickoff, 6)
    if (ld.sortKey !== localKey) return
    const matchStats = PLAYER_MATCH_STATS[m.id]
    if (matchStats) Object.assign(stats, matchStats)
  })
  return stats
}

export function calcFantasyLineupPts(
  lineup: {
    players: Record<string, { name: string; pos: string }>
    subs?: Record<string, { name: string; pos: string }>
    captain?: string
  } | null,
  localKey: number
): number {
  if (!lineup?.players) return 0
  const dayStats = getPlayerStatsForLocalDay(localKey)
  const subList = lineup.subs
    ? Object.keys(lineup.subs).sort().map(k => lineup.subs![k])
    : []
  const usedSubs = new Set<string>()
  let total = 0

  const starterIds = Object.keys(lineup.players).sort()
  for (const id of starterIds) {
    const starter = lineup.players[id]
    const starterStats = dayStats[starter.name]
    const starterPlayed = !!(starterStats?.minutes && starterStats.minutes > 0)

    let active = starter
    if (!starterPlayed && subList.length) {
      let replacement = subList.find(s => !usedSubs.has(s.name) && s.pos === starter.pos)
      if (!replacement) replacement = subList.find(s => !usedSubs.has(s.name))
      if (replacement) {
        usedSubs.add(replacement.name)
        active = replacement
      }
    }

    const isCaptain = starterPlayed && starter.name === lineup.captain
    total += calcFantasyPlayerPts(active, dayStats[active.name], isCaptain)
  }
  return total
}

export function calcFantasyTotal(fantasyAll: Record<number, { players: Record<string, any>; subs?: Record<string, any>; captain?: string }>): number {
  return getLocalScheduleDays('all').reduce((acc, d) => acc + calcFantasyLineupPts(fantasyAll[d] || null, d), 0)
}

export function calcFantasyByDay(fantasyAll: Record<number, { players: Record<string, any>; subs?: Record<string, any>; captain?: string }>, localKey: number): number {
  return calcFantasyLineupPts(fantasyAll[localKey] || null, localKey)
}

export function getMatchesByCalendarDay(calendarDay: number): Match[] {
  return getAllMatches().filter(m => m.calendarDay === calendarDay)
}

export function getCalendarDays(): number[] {
  const days = new Set(getAllMatches().map(m => m.calendarDay))
  return Array.from(days).sort((a, b) => a - b)
}

export function formatCalendarDate(month: number, day: number): string {
  const d = new Date(2026, month - 1, day)
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatCalendarDay(day: number): string {
  return formatCalendarDate(6, day)
}

export function getMatchesByDay(day: number): Match[] {
  return getAllMatches().filter(m => m.day === day)
}

export function getTeamCalendarDays(teamName: string): number[] {
  const days = new Set<number>()
  getAllMatches().forEach(m => {
    if (m.home.name === teamName || m.away.name === teamName) days.add(m.calendarDay)
  })
  return Array.from(days).sort((a, b) => a - b)
}

function buildTeamSquads() {
  const teamDays: Record<string, { flag: string; abbr: string; days: number[] }> = {}
  getAllMatches().forEach(m => {
    ;[m.home, m.away].forEach(t => {
      if (!teamDays[t.name]) teamDays[t.name] = { flag: t.flag, abbr: t.abbr, days: [] }
      if (!teamDays[t.name].days.includes(m.calendarDay)) teamDays[t.name].days.push(m.calendarDay)
    })
  })
  Object.values(teamDays).forEach(t => t.days.sort((a, b) => a - b))

  // Limpiar jugadores genéricos auto-generados
  ;(['gk', 'def', 'mid', 'fwd'] as const).forEach(pos => {
    PLAYERS_DB[pos] = PLAYERS_DB[pos].filter(p => !/ (Portero|Defensa|Medio|Delantero) \d/.test(p.name))
  })

  const existing = new Set(getAllPlayers().map(p => `${p.team}|${p.name}`))

  Object.entries(teamDays).forEach(([teamName, info]) => {
    const squad = getFullSquad(info.abbr)
    squad.forEach(entry => {
      const key = `${teamName}|${entry.name}`
      if (existing.has(key)) return
      const player: Player = {
        name: entry.name,
        flag: info.flag,
        team: teamName,
        pos: entry.pos,
        r: entry.r,
        days: info.days.map(d => getAllMatches().find(m => m.calendarDay === d)?.day || 1),
        calendarDays: info.days,
      }
      if (!PLAYERS_DB[entry.pos].find(x => x.name === entry.name && x.team === teamName)) {
        PLAYERS_DB[entry.pos].push(player)
      }
      existing.add(key)
    })
  })

  getAllPlayers().forEach(p => {
    const td = Object.entries(teamDays).find(([name]) => name === p.team)?.[1]
    if (td) {
      p.calendarDays = td.days
      p.days = [...new Set(td.days.map(cd => getAllMatches().find(m => m.calendarDay === cd)?.day || 1))]
    } else if (!p.calendarDays) {
      p.calendarDays = p.days
    }
  })
}

export function getTeamByAbbr(abbr: string): Team | undefined {
  for (const g of GROUPS) {
    for (const m of g.matches) {
      if (m.home.abbr === abbr) return m.home
      if (m.away.abbr === abbr) return m.away
    }
  }
  return undefined
}

export function getPlayersByTeam(teamName: string): Player[] {
  const team = GROUPS.flatMap(g => g.matches.flatMap(m => [m.home, m.away]))
    .find(t => t.name === teamName)
  if (!team) return getAllPlayers().filter(p => p.team === teamName)
  return getFullSquad(team.abbr).map(entry => ({
    name: entry.name,
    flag: team.flag,
    team: team.name,
    pos: entry.pos,
    r: entry.r,
    days: [],
    calendarDays: [],
  })).sort((a, b) => b.r - a.r)
}

export function getTeamMatches(abbr: string): Match[] {
  return getAllMatches().filter(m => m.home.abbr === abbr || m.away.abbr === abbr)
}

export function getPlayersForLocalDay(localKey: number): Player[] {
  const teamAbbrs = new Set<string>()

  if (isKnockoutLocalKey(localKey)) {
    GROUPS.forEach(g => g.matches.forEach(m => {
      teamAbbrs.add(m.home.abbr)
      teamAbbrs.add(m.away.abbr)
    }))
  } else {
    getAllMatches().forEach(m => {
      const ld = getLocalDayFromKickoff(m.calendarDay, m.kickoff, 6)
      if (ld.sortKey === localKey) {
        teamAbbrs.add(m.home.abbr)
        teamAbbrs.add(m.away.abbr)
      }
    })
  }

  const players: Player[] = []
  const seen = new Set<string>()
  teamAbbrs.forEach(abbr => {
    const team = getTeamByAbbr(abbr)
    if (!team) return
    getFullSquad(abbr).forEach(entry => {
      const key = `${team.name}|${entry.name}`
      if (seen.has(key)) return
      seen.add(key)
      players.push({
        name: entry.name,
        flag: team.flag,
        team: team.name,
        pos: entry.pos,
        r: entry.r,
        days: [],
        calendarDays: [],
      })
    })
  })
  return players.sort((a, b) => b.r - a.r)
}

/** @deprecated usa getPlayersForLocalDay */
export function getPlayersForCalendarDay(calendarDay: number): Player[] {
  const teams = new Set<string>()
  getMatchesByCalendarDay(calendarDay).forEach(m => {
    teams.add(m.home.name)
    teams.add(m.away.name)
  })
  return getAllPlayers().filter(p => teams.has(p.team) && p.calendarDays?.includes(calendarDay))
}

export function getAllMatches(): Match[] {
  return GROUPS.flatMap(g => g.matches.map(applyMatchOverride))
}

export function getCurrentDay(): number {
  // Retorna el día actual (1-6)
  const now = new Date()
  const start = new Date('2026-06-11')
  const diff = Math.floor((now.getTime() - start.getTime()) / 86400000)
  return Math.max(1, Math.min(6, Math.floor(diff / 2) + 1))
}

export function calcPts(pred: any, match: Match): number {
  if (!match.result || !pred?.pick) return 0
  const act = match.result.h > match.result.a ? '1' : match.result.h === match.result.a ? 'X' : '2'
  const ph = pred.homeScore ?? pred.h
  const pa = pred.awayScore ?? pred.a
  if (ph != null && pa != null && ph === match.result.h && pa === match.result.a) return 3
  return pred.pick === act ? 1 : 0
}

export function calcTotal(predictions: Record<string, any>): number {
  return getAllMatches().reduce((acc, m) => acc + calcPts(predictions[m.id], m), 0)
}

export function calcTotalByDay(predictions: Record<string, any>, day: number): number {
  return getMatchesByDay(day).reduce((acc, m) => acc + calcPts(predictions[m.id], m), 0)
}

export function getAllPlayers(): Player[] {
  return Object.values(PLAYERS_DB).flat()
}

/** flagcdn.com solo sirve anchos fijos: 20, 40, 80, 160, 320, 640, 1280, 2560 */
const FLAGCDN_WIDTHS = [20, 40, 80, 160, 320, 640, 1280, 2560] as const

export function flagcdnSnapWidth(requested: number): number {
  const n = Math.max(20, Math.round(requested))
  for (const w of FLAGCDN_WIDTHS) {
    if (n <= w) return w
  }
  return 2560
}

export function getFlagUrl(code: string, width = 40): string {
  if (!code || code === 'xx') return ''
  const w = flagcdnSnapWidth(width)
  return `https://flagcdn.com/w${w}/${code.toLowerCase()}.png`
}

export function getTeamFlag(teamNameOrCode: string): string {
  const team = getAllMatches()
    .flatMap(m => [m.home, m.away])
    .find(t => t.name === teamNameOrCode || t.abbr === teamNameOrCode || t.flag === teamNameOrCode)

  return getFlagUrl(team?.flag || teamNameOrCode, 80)
}

buildTeamSquads()