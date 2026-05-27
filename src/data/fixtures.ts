import type { Match, Team, Group } from './worldcup'

type Fx = { home: Team; away: Team; cal: number; venue: string; city: string; kick: string; md: number }
type GroupTeamMap = Record<string, Team>

function teamsByAbbr(teams: readonly Team[]): GroupTeamMap {
  return Object.fromEntries(teams.map(team => [team.abbr, team])) as GroupTeamMap
}

function pick(map: GroupTeamMap, abbr: string): Team {
  const team = map[abbr]
  if (!team) throw new Error(`Equipo ${abbr} no existe en el grupo`)
  return team
}

function m(id: string, group: string, fx: Fx): Match {
  return {
    id, group,
    home: fx.home, away: fx.away,
    date: `${fx.cal} Jun 2026`,
    kickoff: fx.kick,
    venue: fx.venue, city: fx.city,
    status: 'upcoming',
    day: fx.md,
    calendarDay: fx.cal,
  }
}

/** Calendario oficial FIFA WC26 — 72 partidos fase de grupos (11–27 Jun 2026) */
export function buildOfficialGroups(teams: Record<string, readonly Team[]>): Group[] {
  const A = teamsByAbbr(teams.A)
  const B = teamsByAbbr(teams.B)
  const C = teamsByAbbr(teams.C)
  const D = teamsByAbbr(teams.D)
  const E = teamsByAbbr(teams.E)
  const F = teamsByAbbr(teams.F)
  const G = teamsByAbbr(teams.G)
  const H = teamsByAbbr(teams.H)
  const I = teamsByAbbr(teams.I)
  const J = teamsByAbbr(teams.J)
  const K = teamsByAbbr(teams.K)
  const L = teamsByAbbr(teams.L)

  return [
    { id: 'A', name: 'Grupo A',
      matches: [
        m('A1', 'A', { home: pick(A, 'MEX'), away: pick(A, 'RSA'), cal: 11, venue: 'Estadio Azteca', city: 'Ciudad de México', kick: '15:00 ET', md: 1 }),
        m('A2', 'A', { home: pick(A, 'KOR'), away: pick(A, 'CZE'), cal: 11, venue: 'Estadio Guadalajara', city: 'Guadalajara', kick: '22:00 ET', md: 1 }),
        m('A3', 'A', { home: pick(A, 'CZE'), away: pick(A, 'RSA'), cal: 18, venue: 'Mercedes-Benz Stadium', city: 'Atlanta', kick: '12:00 ET', md: 2 }),
        m('A4', 'A', { home: pick(A, 'MEX'), away: pick(A, 'KOR'), cal: 18, venue: 'Estadio Guadalajara', city: 'Guadalajara', kick: '21:00 ET', md: 2 }),
        m('A5', 'A', { home: pick(A, 'CZE'), away: pick(A, 'MEX'), cal: 24, venue: 'Estadio Azteca', city: 'Ciudad de México', kick: '21:00 ET', md: 3 }),
        m('A6', 'A', { home: pick(A, 'RSA'), away: pick(A, 'KOR'), cal: 24, venue: 'Estadio BBVA', city: 'Monterrey', kick: '21:00 ET', md: 3 }),
      ],
    },
    { id: 'B', name: 'Grupo B',
      matches: [
        m('B1', 'B', { home: pick(B, 'CAN'), away: pick(B, 'BIH'), cal: 12, venue: 'BMO Field', city: 'Toronto', kick: '15:00 ET', md: 1 }),
        m('B2', 'B', { home: pick(B, 'QAT'), away: pick(B, 'SUI'), cal: 13, venue: 'Levi\'s Stadium', city: 'San Francisco', kick: '15:00 ET', md: 1 }),
        m('B3', 'B', { home: pick(B, 'SUI'), away: pick(B, 'BIH'), cal: 18, venue: 'SoFi Stadium', city: 'Los Ángeles', kick: '15:00 ET', md: 2 }),
        m('B4', 'B', { home: pick(B, 'CAN'), away: pick(B, 'QAT'), cal: 18, venue: 'BC Place', city: 'Vancouver', kick: '18:00 ET', md: 2 }),
        m('B5', 'B', { home: pick(B, 'SUI'), away: pick(B, 'CAN'), cal: 24, venue: 'BC Place', city: 'Vancouver', kick: '15:00 ET', md: 3 }),
        m('B6', 'B', { home: pick(B, 'BIH'), away: pick(B, 'QAT'), cal: 24, venue: 'Lumen Field', city: 'Seattle', kick: '15:00 ET', md: 3 }),
      ],
    },
    { id: 'C', name: 'Grupo C',
      matches: [
        m('C1', 'C', { home: pick(C, 'HAI'), away: pick(C, 'SCO'), cal: 13, venue: 'Gillette Stadium', city: 'Boston', kick: '21:00 ET', md: 1 }),
        m('C2', 'C', { home: pick(C, 'BRA'), away: pick(C, 'MAR'), cal: 13, venue: 'MetLife Stadium', city: 'Nueva York/NJ', kick: '18:00 ET', md: 1 }),
        m('C3', 'C', { home: pick(C, 'BRA'), away: pick(C, 'HAI'), cal: 19, venue: 'Lincoln Financial Field', city: 'Filadelfia', kick: '20:30 ET', md: 2 }),
        m('C4', 'C', { home: pick(C, 'SCO'), away: pick(C, 'MAR'), cal: 19, venue: 'Gillette Stadium', city: 'Boston', kick: '18:00 ET', md: 2 }),
        m('C5', 'C', { home: pick(C, 'SCO'), away: pick(C, 'BRA'), cal: 24, venue: 'Hard Rock Stadium', city: 'Miami', kick: '18:00 ET', md: 3 }),
        m('C6', 'C', { home: pick(C, 'MAR'), away: pick(C, 'HAI'), cal: 24, venue: 'Mercedes-Benz Stadium', city: 'Atlanta', kick: '18:00 ET', md: 3 }),
      ],
    },
    { id: 'D', name: 'Grupo D',
      matches: [
        m('D1', 'D', { home: pick(D, 'USA'), away: pick(D, 'PAR'), cal: 12, venue: 'SoFi Stadium', city: 'Los Ángeles', kick: '21:00 ET', md: 1 }),
        m('D2', 'D', { home: pick(D, 'AUS'), away: pick(D, 'TUR'), cal: 13, venue: 'BC Place', city: 'Vancouver', kick: '00:00 ET', md: 1 }),
        m('D3', 'D', { home: pick(D, 'TUR'), away: pick(D, 'PAR'), cal: 19, venue: 'Levi\'s Stadium', city: 'San Francisco', kick: '23:00 ET', md: 2 }),
        m('D4', 'D', { home: pick(D, 'USA'), away: pick(D, 'AUS'), cal: 19, venue: 'Lumen Field', city: 'Seattle', kick: '15:00 ET', md: 2 }),
        m('D5', 'D', { home: pick(D, 'TUR'), away: pick(D, 'USA'), cal: 25, venue: 'SoFi Stadium', city: 'Los Ángeles', kick: '22:00 ET', md: 3 }),
        m('D6', 'D', { home: pick(D, 'PAR'), away: pick(D, 'AUS'), cal: 25, venue: 'Levi\'s Stadium', city: 'San Francisco', kick: '22:00 ET', md: 3 }),
      ],
    },
    { id: 'E', name: 'Grupo E',
      matches: [
        m('E1', 'E', { home: pick(E, 'CIV'), away: pick(E, 'ECU'), cal: 14, venue: 'Lincoln Financial Field', city: 'Filadelfia', kick: '19:00 ET', md: 1 }),
        m('E2', 'E', { home: pick(E, 'GER'), away: pick(E, 'CUW'), cal: 14, venue: 'NRG Stadium', city: 'Houston', kick: '13:00 ET', md: 1 }),
        m('E3', 'E', { home: pick(E, 'GER'), away: pick(E, 'CIV'), cal: 20, venue: 'BMO Field', city: 'Toronto', kick: '16:00 ET', md: 2 }),
        m('E4', 'E', { home: pick(E, 'ECU'), away: pick(E, 'CUW'), cal: 20, venue: 'Arrowhead Stadium', city: 'Kansas City', kick: '20:00 ET', md: 2 }),
        m('E5', 'E', { home: pick(E, 'CUW'), away: pick(E, 'CIV'), cal: 25, venue: 'Lincoln Financial Field', city: 'Filadelfia', kick: '16:00 ET', md: 3 }),
        m('E6', 'E', { home: pick(E, 'ECU'), away: pick(E, 'GER'), cal: 25, venue: 'MetLife Stadium', city: 'Nueva York/NJ', kick: '16:00 ET', md: 3 }),
      ],
    },
    { id: 'F', name: 'Grupo F',
      matches: [
        m('F1', 'F', { home: pick(F, 'NED'), away: pick(F, 'JPN'), cal: 14, venue: 'AT&T Stadium', city: 'Dallas', kick: '16:00 ET', md: 1 }),
        m('F2', 'F', { home: pick(F, 'SWE'), away: pick(F, 'TUN'), cal: 14, venue: 'Estadio BBVA', city: 'Monterrey', kick: '22:00 ET', md: 1 }),
        m('F3', 'F', { home: pick(F, 'NED'), away: pick(F, 'SWE'), cal: 20, venue: 'NRG Stadium', city: 'Houston', kick: '13:00 ET', md: 2 }),
        m('F4', 'F', { home: pick(F, 'TUN'), away: pick(F, 'JPN'), cal: 20, venue: 'Estadio BBVA', city: 'Monterrey', kick: '00:00 ET', md: 2 }),
        m('F5', 'F', { home: pick(F, 'JPN'), away: pick(F, 'SWE'), cal: 25, venue: 'AT&T Stadium', city: 'Dallas', kick: '19:00 ET', md: 3 }),
        m('F6', 'F', { home: pick(F, 'TUN'), away: pick(F, 'NED'), cal: 25, venue: 'Arrowhead Stadium', city: 'Kansas City', kick: '19:00 ET', md: 3 }),
      ],
    },
    { id: 'G', name: 'Grupo G',
      matches: [
        m('G1', 'G', { home: pick(G, 'IRN'), away: pick(G, 'NZL'), cal: 15, venue: 'SoFi Stadium', city: 'Los Ángeles', kick: '21:00 ET', md: 1 }),
        m('G2', 'G', { home: pick(G, 'BEL'), away: pick(G, 'EGY'), cal: 15, venue: 'Lumen Field', city: 'Seattle', kick: '15:00 ET', md: 1 }),
        m('G3', 'G', { home: pick(G, 'BEL'), away: pick(G, 'IRN'), cal: 21, venue: 'SoFi Stadium', city: 'Los Ángeles', kick: '15:00 ET', md: 2 }),
        m('G4', 'G', { home: pick(G, 'NZL'), away: pick(G, 'EGY'), cal: 21, venue: 'BC Place', city: 'Vancouver', kick: '21:00 ET', md: 2 }),
        m('G5', 'G', { home: pick(G, 'EGY'), away: pick(G, 'IRN'), cal: 26, venue: 'Lumen Field', city: 'Seattle', kick: '23:00 ET', md: 3 }),
        m('G6', 'G', { home: pick(G, 'NZL'), away: pick(G, 'BEL'), cal: 26, venue: 'BC Place', city: 'Vancouver', kick: '23:00 ET', md: 3 }),
      ],
    },
    { id: 'H', name: 'Grupo H',
      matches: [
        m('H1', 'H', { home: pick(H, 'KSA'), away: pick(H, 'URU'), cal: 15, venue: 'Hard Rock Stadium', city: 'Miami', kick: '18:00 ET', md: 1 }),
        m('H2', 'H', { home: pick(H, 'ESP'), away: pick(H, 'CPV'), cal: 15, venue: 'Mercedes-Benz Stadium', city: 'Atlanta', kick: '12:00 ET', md: 1 }),
        m('H3', 'H', { home: pick(H, 'URU'), away: pick(H, 'CPV'), cal: 21, venue: 'Hard Rock Stadium', city: 'Miami', kick: '18:00 ET', md: 2 }),
        m('H4', 'H', { home: pick(H, 'ESP'), away: pick(H, 'KSA'), cal: 21, venue: 'Mercedes-Benz Stadium', city: 'Atlanta', kick: '12:00 ET', md: 2 }),
        m('H5', 'H', { home: pick(H, 'CPV'), away: pick(H, 'KSA'), cal: 26, venue: 'NRG Stadium', city: 'Houston', kick: '20:00 ET', md: 3 }),
        m('H6', 'H', { home: pick(H, 'URU'), away: pick(H, 'ESP'), cal: 26, venue: 'Estadio Guadalajara', city: 'Guadalajara', kick: '20:00 ET', md: 3 }),
      ],
    },
    { id: 'I', name: 'Grupo I',
      matches: [
        m('I1', 'I', { home: pick(I, 'FRA'), away: pick(I, 'SEN'), cal: 16, venue: 'MetLife Stadium', city: 'Nueva York/NJ', kick: '15:00 ET', md: 1 }),
        m('I2', 'I', { home: pick(I, 'IRQ'), away: pick(I, 'NOR'), cal: 16, venue: 'Gillette Stadium', city: 'Boston', kick: '18:00 ET', md: 1 }),
        m('I3', 'I', { home: pick(I, 'NOR'), away: pick(I, 'SEN'), cal: 22, venue: 'MetLife Stadium', city: 'Nueva York/NJ', kick: '20:00 ET', md: 2 }),
        m('I4', 'I', { home: pick(I, 'FRA'), away: pick(I, 'IRQ'), cal: 22, venue: 'Lincoln Financial Field', city: 'Filadelfia', kick: '17:00 ET', md: 2 }),
        m('I5', 'I', { home: pick(I, 'NOR'), away: pick(I, 'FRA'), cal: 26, venue: 'Gillette Stadium', city: 'Boston', kick: '15:00 ET', md: 3 }),
        m('I6', 'I', { home: pick(I, 'SEN'), away: pick(I, 'IRQ'), cal: 26, venue: 'BMO Field', city: 'Toronto', kick: '15:00 ET', md: 3 }),
      ],
    },
    { id: 'J', name: 'Grupo J',
      matches: [
        m('J1', 'J', { home: pick(J, 'ARG'), away: pick(J, 'ALG'), cal: 16, venue: 'Arrowhead Stadium', city: 'Kansas City', kick: '21:00 ET', md: 1 }),
        m('J2', 'J', { home: pick(J, 'AUT'), away: pick(J, 'JOR'), cal: 16, venue: 'Levi\'s Stadium', city: 'San Francisco', kick: '00:00 ET', md: 1 }),
        m('J3', 'J', { home: pick(J, 'ARG'), away: pick(J, 'AUT'), cal: 22, venue: 'AT&T Stadium', city: 'Dallas', kick: '13:00 ET', md: 2 }),
        m('J4', 'J', { home: pick(J, 'JOR'), away: pick(J, 'ALG'), cal: 22, venue: 'Levi\'s Stadium', city: 'San Francisco', kick: '23:00 ET', md: 2 }),
        m('J5', 'J', { home: pick(J, 'ALG'), away: pick(J, 'AUT'), cal: 27, venue: 'Arrowhead Stadium', city: 'Kansas City', kick: '22:00 ET', md: 3 }),
        m('J6', 'J', { home: pick(J, 'JOR'), away: pick(J, 'ARG'), cal: 27, venue: 'AT&T Stadium', city: 'Dallas', kick: '22:00 ET', md: 3 }),
      ],
    },
    { id: 'K', name: 'Grupo K',
      matches: [
        m('K1', 'K', { home: pick(K, 'POR'), away: pick(K, 'COD'), cal: 17, venue: 'NRG Stadium', city: 'Houston', kick: '13:00 ET', md: 1 }),
        m('K2', 'K', { home: pick(K, 'UZB'), away: pick(K, 'COL'), cal: 17, venue: 'Estadio Azteca', city: 'Ciudad de México', kick: '22:00 ET', md: 1 }),
        m('K3', 'K', { home: pick(K, 'POR'), away: pick(K, 'UZB'), cal: 23, venue: 'NRG Stadium', city: 'Houston', kick: '13:00 ET', md: 2 }),
        m('K4', 'K', { home: pick(K, 'COL'), away: pick(K, 'COD'), cal: 23, venue: 'Estadio Guadalajara', city: 'Guadalajara', kick: '22:00 ET', md: 2 }),
        m('K5', 'K', { home: pick(K, 'COL'), away: pick(K, 'POR'), cal: 27, venue: 'Hard Rock Stadium', city: 'Miami', kick: '19:30 ET', md: 3 }),
        m('K6', 'K', { home: pick(K, 'COD'), away: pick(K, 'UZB'), cal: 27, venue: 'Mercedes-Benz Stadium', city: 'Atlanta', kick: '19:30 ET', md: 3 }),
      ],
    },
    { id: 'L', name: 'Grupo L',
      matches: [
        m('L1', 'L', { home: pick(L, 'GHA'), away: pick(L, 'PAN'), cal: 17, venue: 'BMO Field', city: 'Toronto', kick: '19:00 ET', md: 1 }),
        m('L2', 'L', { home: pick(L, 'ENG'), away: pick(L, 'CRO'), cal: 17, venue: 'AT&T Stadium', city: 'Dallas', kick: '16:00 ET', md: 1 }),
        m('L3', 'L', { home: pick(L, 'ENG'), away: pick(L, 'GHA'), cal: 23, venue: 'Gillette Stadium', city: 'Boston', kick: '16:00 ET', md: 2 }),
        m('L4', 'L', { home: pick(L, 'PAN'), away: pick(L, 'CRO'), cal: 23, venue: 'BMO Field', city: 'Toronto', kick: '19:00 ET', md: 2 }),
        m('L5', 'L', { home: pick(L, 'PAN'), away: pick(L, 'ENG'), cal: 27, venue: 'MetLife Stadium', city: 'Nueva York/NJ', kick: '17:00 ET', md: 3 }),
        m('L6', 'L', { home: pick(L, 'CRO'), away: pick(L, 'GHA'), cal: 27, venue: 'Lincoln Financial Field', city: 'Filadelfia', kick: '17:00 ET', md: 3 }),
      ],
    },
  ]
}
