import type { Match, Team, Group } from './worldcup'

type Fx = { home: Team; away: Team; cal: number; venue: string; city: string; kick: string; md: number }

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
export function buildOfficialGroups(teams: Record<string, [Team, Team, Team, Team]>): Group[] {
  const [MEX, RSA, KOR, CZE] = teams.A
  const [CAN, BIH, QAT, SUI] = teams.B
  const [HAI, SCO, BRA, MAR] = teams.C
  const [USA, PAR, AUS, TUR] = teams.D
  const [CIV, ECU, GER, CUW] = teams.E
  const [NED, JPN, SWE, TUN] = teams.F
  const [IRN, NZL, BEL, EGY] = teams.G
  const [KSA, URU, ESP, CPV] = teams.H
  const [FRA, SEN, IRQ, NOR] = teams.I
  const [ARG, ALG, AUT, JOR] = teams.J
  const [POR, COD, UZB, COL] = teams.K
  const [GHA, PAN, ENG, CRO] = teams.L

  return [
    { id: 'A', name: 'Grupo A',
      matches: [
        m('A1', 'A', { home: MEX, away: RSA, cal: 11, venue: 'Estadio Azteca', city: 'Ciudad de México', kick: '15:00 ET', md: 1 }),
        m('A2', 'A', { home: KOR, away: CZE, cal: 11, venue: 'Estadio Guadalajara', city: 'Guadalajara', kick: '22:00 ET', md: 1 }),
        m('A3', 'A', { home: CZE, away: RSA, cal: 18, venue: 'Mercedes-Benz Stadium', city: 'Atlanta', kick: '12:00 ET', md: 2 }),
        m('A4', 'A', { home: MEX, away: KOR, cal: 18, venue: 'Estadio Guadalajara', city: 'Guadalajara', kick: '21:00 ET', md: 2 }),
        m('A5', 'A', { home: CZE, away: MEX, cal: 24, venue: 'Estadio Azteca', city: 'Ciudad de México', kick: '21:00 ET', md: 3 }),
        m('A6', 'A', { home: RSA, away: KOR, cal: 24, venue: 'Estadio BBVA', city: 'Monterrey', kick: '21:00 ET', md: 3 }),
      ],
    },
    { id: 'B', name: 'Grupo B',
      matches: [
        m('B1', 'B', { home: CAN, away: BIH, cal: 12, venue: 'BMO Field', city: 'Toronto', kick: '15:00 ET', md: 1 }),
        m('B2', 'B', { home: QAT, away: SUI, cal: 13, venue: 'Levi\'s Stadium', city: 'San Francisco', kick: '15:00 ET', md: 1 }),
        m('B3', 'B', { home: SUI, away: BIH, cal: 18, venue: 'SoFi Stadium', city: 'Los Ángeles', kick: '15:00 ET', md: 2 }),
        m('B4', 'B', { home: CAN, away: QAT, cal: 18, venue: 'BC Place', city: 'Vancouver', kick: '18:00 ET', md: 2 }),
        m('B5', 'B', { home: SUI, away: CAN, cal: 24, venue: 'BC Place', city: 'Vancouver', kick: '15:00 ET', md: 3 }),
        m('B6', 'B', { home: BIH, away: QAT, cal: 24, venue: 'Lumen Field', city: 'Seattle', kick: '15:00 ET', md: 3 }),
      ],
    },
    { id: 'C', name: 'Grupo C',
      matches: [
        m('C1', 'C', { home: HAI, away: SCO, cal: 13, venue: 'Gillette Stadium', city: 'Boston', kick: '21:00 ET', md: 1 }),
        m('C2', 'C', { home: BRA, away: MAR, cal: 13, venue: 'MetLife Stadium', city: 'Nueva York/NJ', kick: '18:00 ET', md: 1 }),
        m('C3', 'C', { home: BRA, away: HAI, cal: 19, venue: 'Lincoln Financial Field', city: 'Filadelfia', kick: '20:30 ET', md: 2 }),
        m('C4', 'C', { home: SCO, away: MAR, cal: 19, venue: 'Gillette Stadium', city: 'Boston', kick: '18:00 ET', md: 2 }),
        m('C5', 'C', { home: SCO, away: BRA, cal: 24, venue: 'Hard Rock Stadium', city: 'Miami', kick: '18:00 ET', md: 3 }),
        m('C6', 'C', { home: MAR, away: HAI, cal: 24, venue: 'Mercedes-Benz Stadium', city: 'Atlanta', kick: '18:00 ET', md: 3 }),
      ],
    },
    { id: 'D', name: 'Grupo D',
      matches: [
        m('D1', 'D', { home: USA, away: PAR, cal: 12, venue: 'SoFi Stadium', city: 'Los Ángeles', kick: '21:00 ET', md: 1 }),
        m('D2', 'D', { home: AUS, away: TUR, cal: 13, venue: 'BC Place', city: 'Vancouver', kick: '00:00 ET', md: 1 }),
        m('D3', 'D', { home: TUR, away: PAR, cal: 19, venue: 'Levi\'s Stadium', city: 'San Francisco', kick: '23:00 ET', md: 2 }),
        m('D4', 'D', { home: USA, away: AUS, cal: 19, venue: 'Lumen Field', city: 'Seattle', kick: '15:00 ET', md: 2 }),
        m('D5', 'D', { home: TUR, away: USA, cal: 25, venue: 'SoFi Stadium', city: 'Los Ángeles', kick: '22:00 ET', md: 3 }),
        m('D6', 'D', { home: PAR, away: AUS, cal: 25, venue: 'Levi\'s Stadium', city: 'San Francisco', kick: '22:00 ET', md: 3 }),
      ],
    },
    { id: 'E', name: 'Grupo E',
      matches: [
        m('E1', 'E', { home: CIV, away: ECU, cal: 14, venue: 'Lincoln Financial Field', city: 'Filadelfia', kick: '19:00 ET', md: 1 }),
        m('E2', 'E', { home: GER, away: CUW, cal: 14, venue: 'NRG Stadium', city: 'Houston', kick: '13:00 ET', md: 1 }),
        m('E3', 'E', { home: GER, away: CIV, cal: 20, venue: 'BMO Field', city: 'Toronto', kick: '16:00 ET', md: 2 }),
        m('E4', 'E', { home: ECU, away: CUW, cal: 20, venue: 'Arrowhead Stadium', city: 'Kansas City', kick: '20:00 ET', md: 2 }),
        m('E5', 'E', { home: CUW, away: CIV, cal: 25, venue: 'Lincoln Financial Field', city: 'Filadelfia', kick: '16:00 ET', md: 3 }),
        m('E6', 'E', { home: ECU, away: GER, cal: 25, venue: 'MetLife Stadium', city: 'Nueva York/NJ', kick: '16:00 ET', md: 3 }),
      ],
    },
    { id: 'F', name: 'Grupo F',
      matches: [
        m('F1', 'F', { home: NED, away: JPN, cal: 14, venue: 'AT&T Stadium', city: 'Dallas', kick: '16:00 ET', md: 1 }),
        m('F2', 'F', { home: SWE, away: TUN, cal: 14, venue: 'Estadio BBVA', city: 'Monterrey', kick: '22:00 ET', md: 1 }),
        m('F3', 'F', { home: NED, away: SWE, cal: 20, venue: 'NRG Stadium', city: 'Houston', kick: '13:00 ET', md: 2 }),
        m('F4', 'F', { home: TUN, away: JPN, cal: 20, venue: 'Estadio BBVA', city: 'Monterrey', kick: '00:00 ET', md: 2 }),
        m('F5', 'F', { home: JPN, away: SWE, cal: 25, venue: 'AT&T Stadium', city: 'Dallas', kick: '19:00 ET', md: 3 }),
        m('F6', 'F', { home: TUN, away: NED, cal: 25, venue: 'Arrowhead Stadium', city: 'Kansas City', kick: '19:00 ET', md: 3 }),
      ],
    },
    { id: 'G', name: 'Grupo G',
      matches: [
        m('G1', 'G', { home: IRN, away: NZL, cal: 15, venue: 'SoFi Stadium', city: 'Los Ángeles', kick: '21:00 ET', md: 1 }),
        m('G2', 'G', { home: BEL, away: EGY, cal: 15, venue: 'Lumen Field', city: 'Seattle', kick: '15:00 ET', md: 1 }),
        m('G3', 'G', { home: BEL, away: IRN, cal: 21, venue: 'SoFi Stadium', city: 'Los Ángeles', kick: '15:00 ET', md: 2 }),
        m('G4', 'G', { home: NZL, away: EGY, cal: 21, venue: 'BC Place', city: 'Vancouver', kick: '21:00 ET', md: 2 }),
        m('G5', 'G', { home: EGY, away: IRN, cal: 26, venue: 'Lumen Field', city: 'Seattle', kick: '23:00 ET', md: 3 }),
        m('G6', 'G', { home: NZL, away: BEL, cal: 26, venue: 'BC Place', city: 'Vancouver', kick: '23:00 ET', md: 3 }),
      ],
    },
    { id: 'H', name: 'Grupo H',
      matches: [
        m('H1', 'H', { home: KSA, away: URU, cal: 15, venue: 'Hard Rock Stadium', city: 'Miami', kick: '18:00 ET', md: 1 }),
        m('H2', 'H', { home: ESP, away: CPV, cal: 15, venue: 'Mercedes-Benz Stadium', city: 'Atlanta', kick: '12:00 ET', md: 1 }),
        m('H3', 'H', { home: URU, away: CPV, cal: 21, venue: 'Hard Rock Stadium', city: 'Miami', kick: '18:00 ET', md: 2 }),
        m('H4', 'H', { home: ESP, away: KSA, cal: 21, venue: 'Mercedes-Benz Stadium', city: 'Atlanta', kick: '12:00 ET', md: 2 }),
        m('H5', 'H', { home: CPV, away: KSA, cal: 26, venue: 'NRG Stadium', city: 'Houston', kick: '20:00 ET', md: 3 }),
        m('H6', 'H', { home: URU, away: ESP, cal: 26, venue: 'Estadio Guadalajara', city: 'Guadalajara', kick: '20:00 ET', md: 3 }),
      ],
    },
    { id: 'I', name: 'Grupo I',
      matches: [
        m('I1', 'I', { home: FRA, away: SEN, cal: 16, venue: 'MetLife Stadium', city: 'Nueva York/NJ', kick: '15:00 ET', md: 1 }),
        m('I2', 'I', { home: IRQ, away: NOR, cal: 16, venue: 'Gillette Stadium', city: 'Boston', kick: '18:00 ET', md: 1 }),
        m('I3', 'I', { home: NOR, away: SEN, cal: 22, venue: 'MetLife Stadium', city: 'Nueva York/NJ', kick: '20:00 ET', md: 2 }),
        m('I4', 'I', { home: FRA, away: IRQ, cal: 22, venue: 'Lincoln Financial Field', city: 'Filadelfia', kick: '17:00 ET', md: 2 }),
        m('I5', 'I', { home: NOR, away: FRA, cal: 26, venue: 'Gillette Stadium', city: 'Boston', kick: '15:00 ET', md: 3 }),
        m('I6', 'I', { home: SEN, away: IRQ, cal: 26, venue: 'BMO Field', city: 'Toronto', kick: '15:00 ET', md: 3 }),
      ],
    },
    { id: 'J', name: 'Grupo J',
      matches: [
        m('J1', 'J', { home: ARG, away: ALG, cal: 16, venue: 'Arrowhead Stadium', city: 'Kansas City', kick: '21:00 ET', md: 1 }),
        m('J2', 'J', { home: AUT, away: JOR, cal: 16, venue: 'Levi\'s Stadium', city: 'San Francisco', kick: '00:00 ET', md: 1 }),
        m('J3', 'J', { home: ARG, away: AUT, cal: 22, venue: 'AT&T Stadium', city: 'Dallas', kick: '13:00 ET', md: 2 }),
        m('J4', 'J', { home: JOR, away: ALG, cal: 22, venue: 'Levi\'s Stadium', city: 'San Francisco', kick: '23:00 ET', md: 2 }),
        m('J5', 'J', { home: ALG, away: AUT, cal: 27, venue: 'Arrowhead Stadium', city: 'Kansas City', kick: '22:00 ET', md: 3 }),
        m('J6', 'J', { home: JOR, away: ARG, cal: 27, venue: 'AT&T Stadium', city: 'Dallas', kick: '22:00 ET', md: 3 }),
      ],
    },
    { id: 'K', name: 'Grupo K',
      matches: [
        m('K1', 'K', { home: POR, away: COD, cal: 17, venue: 'NRG Stadium', city: 'Houston', kick: '13:00 ET', md: 1 }),
        m('K2', 'K', { home: UZB, away: COL, cal: 17, venue: 'Estadio Azteca', city: 'Ciudad de México', kick: '22:00 ET', md: 1 }),
        m('K3', 'K', { home: POR, away: UZB, cal: 23, venue: 'NRG Stadium', city: 'Houston', kick: '13:00 ET', md: 2 }),
        m('K4', 'K', { home: COL, away: COD, cal: 23, venue: 'Estadio Guadalajara', city: 'Guadalajara', kick: '22:00 ET', md: 2 }),
        m('K5', 'K', { home: COL, away: POR, cal: 27, venue: 'Hard Rock Stadium', city: 'Miami', kick: '19:30 ET', md: 3 }),
        m('K6', 'K', { home: COD, away: UZB, cal: 27, venue: 'Mercedes-Benz Stadium', city: 'Atlanta', kick: '19:30 ET', md: 3 }),
      ],
    },
    { id: 'L', name: 'Grupo L',
      matches: [
        m('L1', 'L', { home: GHA, away: PAN, cal: 17, venue: 'BMO Field', city: 'Toronto', kick: '19:00 ET', md: 1 }),
        m('L2', 'L', { home: ENG, away: CRO, cal: 17, venue: 'AT&T Stadium', city: 'Dallas', kick: '16:00 ET', md: 1 }),
        m('L3', 'L', { home: ENG, away: GHA, cal: 23, venue: 'Gillette Stadium', city: 'Boston', kick: '16:00 ET', md: 2 }),
        m('L4', 'L', { home: PAN, away: CRO, cal: 23, venue: 'BMO Field', city: 'Toronto', kick: '19:00 ET', md: 2 }),
        m('L5', 'L', { home: PAN, away: ENG, cal: 27, venue: 'MetLife Stadium', city: 'Nueva York/NJ', kick: '17:00 ET', md: 3 }),
        m('L6', 'L', { home: CRO, away: GHA, cal: 27, venue: 'Lincoln Financial Field', city: 'Filadelfia', kick: '17:00 ET', md: 3 }),
      ],
    },
  ]
}
