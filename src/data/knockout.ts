import type { Team } from './worldcup'

export interface KnockoutMatch {
  id: string
  round: string
  roundKey: 'r32' | 'r16' | 'qf' | 'sf' | '3rd' | 'final'
  home: Team | null
  away: Team | null
  homeLabel: string
  awayLabel: string
  date: string
  kickoff: string
  venue: string
  city: string
  status: 'upcoming'
}

const TBD = (label: string): Team => ({ name: label, flag: 'xx', abbr: 'TBD' })

export const KNOCKOUT_ROUNDS: { key: KnockoutMatch['roundKey']; label: string; dates: string }[] = [
  { key: 'r32', label: 'Dieciseisavos de final', dates: '28 Jun – 3 Jul 2026' },
  { key: 'r16', label: 'Octavos de final', dates: '4 – 7 Jul 2026' },
  { key: 'qf', label: 'Cuartos de final', dates: '9 – 11 Jul 2026' },
  { key: 'sf', label: 'Semifinales', dates: '14 – 15 Jul 2026' },
  { key: '3rd', label: 'Tercer puesto', dates: '18 Jul 2026' },
  { key: 'final', label: 'Gran Final', dates: '19 Jul 2026' },
]

/** Horarios oficiales FIFA WC26 (ET) — rivales TBD pero fecha/hora confirmadas */
export const KNOCKOUT_MATCHES: KnockoutMatch[] = [
  { id: 'R32-1', round: 'Dieciseisavos', roundKey: 'r32', home: null, away: null, homeLabel: '2º Grupo A', awayLabel: '2º Grupo B', date: '28 Jun 2026', kickoff: '15:00 ET', venue: 'SoFi Stadium', city: 'Los Ángeles', status: 'upcoming' },
  { id: 'R32-2', round: 'Dieciseisavos', roundKey: 'r32', home: null, away: null, homeLabel: '1º Grupo E', awayLabel: '3º A/B/C/D/F', date: '28 Jun 2026', kickoff: '18:00 ET', venue: 'Gillette Stadium', city: 'Boston', status: 'upcoming' },
  { id: 'R32-3', round: 'Dieciseisavos', roundKey: 'r32', home: null, away: null, homeLabel: '1º Grupo I', awayLabel: '3º C/D/F/G', date: '29 Jun 2026', kickoff: '13:00 ET', venue: 'MetLife Stadium', city: 'Nueva York/NJ', status: 'upcoming' },
  { id: 'R32-4', round: 'Dieciseisavos', roundKey: 'r32', home: null, away: null, homeLabel: '1º Grupo A', awayLabel: '3º C/E/F/H', date: '29 Jun 2026', kickoff: '16:00 ET', venue: 'Estadio Azteca', city: 'Ciudad de México', status: 'upcoming' },
  { id: 'R32-5', round: 'Dieciseisavos', roundKey: 'r32', home: null, away: null, homeLabel: '1º Grupo L', awayLabel: '3º E/H/I/J', date: '29 Jun 2026', kickoff: '20:00 ET', venue: 'Mercedes-Benz Stadium', city: 'Atlanta', status: 'upcoming' },
  { id: 'R32-6', round: 'Dieciseisavos', roundKey: 'r32', home: null, away: null, homeLabel: '1º Grupo D', awayLabel: '3º B/E/F/I', date: '30 Jun 2026', kickoff: '13:00 ET', venue: 'BC Place', city: 'Vancouver', status: 'upcoming' },
  { id: 'R32-7', round: 'Dieciseisavos', roundKey: 'r32', home: null, away: null, homeLabel: '1º Grupo G', awayLabel: '3º A/E/H/I', date: '30 Jun 2026', kickoff: '16:00 ET', venue: 'NRG Stadium', city: 'Houston', status: 'upcoming' },
  { id: 'R32-8', round: 'Dieciseisavos', roundKey: 'r32', home: null, away: null, homeLabel: '2º Grupo E', awayLabel: '2º Grupo I', date: '30 Jun 2026', kickoff: '20:00 ET', venue: 'Hard Rock Stadium', city: 'Miami', status: 'upcoming' },
  { id: 'R32-9', round: 'Dieciseisavos', roundKey: 'r32', home: null, away: null, homeLabel: '1º Grupo H', awayLabel: '3º J/K/L', date: '1 Jul 2026', kickoff: '13:00 ET', venue: 'AT&T Stadium', city: 'Dallas', status: 'upcoming' },
  { id: 'R32-10', round: 'Dieciseisavos', roundKey: 'r32', home: null, away: null, homeLabel: '1º Grupo K', awayLabel: '3º D/E/I/J', date: '1 Jul 2026', kickoff: '16:00 ET', venue: 'Lumen Field', city: 'Seattle', status: 'upcoming' },
  { id: 'R32-11', round: 'Dieciseisavos', roundKey: 'r32', home: null, away: null, homeLabel: '2º Grupo D', awayLabel: '2º Grupo G', date: '1 Jul 2026', kickoff: '20:00 ET', venue: "Levi's Stadium", city: 'San Francisco', status: 'upcoming' },
  { id: 'R32-12', round: 'Dieciseisavos', roundKey: 'r32', home: null, away: null, homeLabel: '1º Grupo B', awayLabel: '3º F/G/H/I', date: '2 Jul 2026', kickoff: '15:00 ET', venue: 'BMO Field', city: 'Toronto', status: 'upcoming' },
  { id: 'R32-13', round: 'Dieciseisavos', roundKey: 'r32', home: null, away: null, homeLabel: '1º Grupo J', awayLabel: '3º E/F/G/H', date: '2 Jul 2026', kickoff: '18:00 ET', venue: 'Lincoln Financial Field', city: 'Filadelfia', status: 'upcoming' },
  { id: 'R32-14', round: 'Dieciseisavos', roundKey: 'r32', home: null, away: null, homeLabel: '2º Grupo K', awayLabel: '2º Grupo L', date: '2 Jul 2026', kickoff: '21:00 ET', venue: 'Arrowhead Stadium', city: 'Kansas City', status: 'upcoming' },
  { id: 'R32-15', round: 'Dieciseisavos', roundKey: 'r32', home: null, away: null, homeLabel: '1º Grupo F', awayLabel: '3º A/B/C/D', date: '3 Jul 2026', kickoff: '16:00 ET', venue: 'Estadio BBVA', city: 'Monterrey', status: 'upcoming' },
  { id: 'R32-16', round: 'Dieciseisavos', roundKey: 'r32', home: null, away: null, homeLabel: '2º Grupo C', awayLabel: '2º Grupo F', date: '3 Jul 2026', kickoff: '20:00 ET', venue: 'Estadio Guadalajara', city: 'Guadalajara', status: 'upcoming' },
  { id: 'R16-1', round: 'Octavos', roundKey: 'r16', home: null, away: null, homeLabel: 'Ganador R32-2', awayLabel: 'Ganador R32-1', date: '4 Jul 2026', kickoff: '13:00 ET', venue: 'MetLife Stadium', city: 'Nueva York/NJ', status: 'upcoming' },
  { id: 'R16-2', round: 'Octavos', roundKey: 'r16', home: null, away: null, homeLabel: 'Ganador R32-4', awayLabel: 'Ganador R32-3', date: '4 Jul 2026', kickoff: '17:00 ET', venue: 'Estadio Azteca', city: 'Ciudad de México', status: 'upcoming' },
  { id: 'R16-3', round: 'Octavos', roundKey: 'r16', home: null, away: null, homeLabel: 'Ganador R32-5', awayLabel: 'Ganador R32-6', date: '5 Jul 2026', kickoff: '13:00 ET', venue: 'SoFi Stadium', city: 'Los Ángeles', status: 'upcoming' },
  { id: 'R16-4', round: 'Octavos', roundKey: 'r16', home: null, away: null, homeLabel: 'Ganador R32-7', awayLabel: 'Ganador R32-8', date: '5 Jul 2026', kickoff: '17:00 ET', venue: 'NRG Stadium', city: 'Houston', status: 'upcoming' },
  { id: 'R16-5', round: 'Octavos', roundKey: 'r16', home: null, away: null, homeLabel: 'Ganador R32-9', awayLabel: 'Ganador R32-10', date: '6 Jul 2026', kickoff: '13:00 ET', venue: 'Lumen Field', city: 'Seattle', status: 'upcoming' },
  { id: 'R16-6', round: 'Octavos', roundKey: 'r16', home: null, away: null, homeLabel: 'Ganador R32-11', awayLabel: 'Ganador R32-12', date: '6 Jul 2026', kickoff: '17:00 ET', venue: 'AT&T Stadium', city: 'Dallas', status: 'upcoming' },
  { id: 'R16-7', round: 'Octavos', roundKey: 'r16', home: null, away: null, homeLabel: 'Ganador R32-13', awayLabel: 'Ganador R32-14', date: '7 Jul 2026', kickoff: '13:00 ET', venue: 'Mercedes-Benz Stadium', city: 'Atlanta', status: 'upcoming' },
  { id: 'R16-8', round: 'Octavos', roundKey: 'r16', home: null, away: null, homeLabel: 'Ganador R32-15', awayLabel: 'Ganador R32-16', date: '7 Jul 2026', kickoff: '17:00 ET', venue: 'Hard Rock Stadium', city: 'Miami', status: 'upcoming' },
  { id: 'QF-1', round: 'Cuartos', roundKey: 'qf', home: null, away: null, homeLabel: 'Ganador R16-1', awayLabel: 'Ganador R16-2', date: '9 Jul 2026', kickoff: '16:00 ET', venue: 'Gillette Stadium', city: 'Boston', status: 'upcoming' },
  { id: 'QF-2', round: 'Cuartos', roundKey: 'qf', home: null, away: null, homeLabel: 'Ganador R16-3', awayLabel: 'Ganador R16-4', date: '10 Jul 2026', kickoff: '16:00 ET', venue: 'SoFi Stadium', city: 'Los Ángeles', status: 'upcoming' },
  { id: 'QF-3', round: 'Cuartos', roundKey: 'qf', home: null, away: null, homeLabel: 'Ganador R16-5', awayLabel: 'Ganador R16-6', date: '11 Jul 2026', kickoff: '13:00 ET', venue: 'AT&T Stadium', city: 'Dallas', status: 'upcoming' },
  { id: 'QF-4', round: 'Cuartos', roundKey: 'qf', home: null, away: null, homeLabel: 'Ganador R16-7', awayLabel: 'Ganador R16-8', date: '11 Jul 2026', kickoff: '17:00 ET', venue: 'MetLife Stadium', city: 'Nueva York/NJ', status: 'upcoming' },
  { id: 'SF-1', round: 'Semifinal', roundKey: 'sf', home: null, away: null, homeLabel: 'Ganador QF-1', awayLabel: 'Ganador QF-2', date: '14 Jul 2026', kickoff: '15:00 ET', venue: 'Mercedes-Benz Stadium', city: 'Atlanta', status: 'upcoming' },
  { id: 'SF-2', round: 'Semifinal', roundKey: 'sf', home: null, away: null, homeLabel: 'Ganador QF-3', awayLabel: 'Ganador QF-4', date: '15 Jul 2026', kickoff: '15:00 ET', venue: 'Hard Rock Stadium', city: 'Miami', status: 'upcoming' },
  { id: '3RD', round: 'Tercer puesto', roundKey: '3rd', home: null, away: null, homeLabel: 'Perdedor SF-1', awayLabel: 'Perdedor SF-2', date: '18 Jul 2026', kickoff: '17:00 ET', venue: 'Hard Rock Stadium', city: 'Miami', status: 'upcoming' },
  { id: 'FINAL', round: 'Final', roundKey: 'final', home: null, away: null, homeLabel: 'Ganador SF-1', awayLabel: 'Ganador SF-2', date: '19 Jul 2026', kickoff: '15:00 ET', venue: 'MetLife Stadium', city: 'Nueva York/NJ', status: 'upcoming' },
]

export function getKnockoutByRound(key: KnockoutMatch['roundKey']) {
  return KNOCKOUT_MATCHES.filter(m => m.roundKey === key)
}

export { TBD }
