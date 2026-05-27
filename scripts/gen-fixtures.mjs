/** Genera fixtures.ts desde calendario oficial FIFA WC26 (fwclive / fifa.com) */
import { writeFileSync } from 'fs'

const teams = {
  MEX: ['México', 'mx'], KOR: ['Corea del Sur', 'kr'], RSA: ['Sudáfrica', 'za'], CZE: ['Chequia', 'cz'],
  CAN: ['Canadá', 'ca'], SUI: ['Suiza', 'ch'], QAT: ['Qatar', 'qa'], BIH: ['Bosnia', 'ba'],
  BRA: ['Brasil', 'br'], MAR: ['Marruecos', 'ma'], SCO: ['Escocia', 'gb-sct'], HAI: ['Haití', 'ht'],
  USA: ['Estados Unidos', 'us'], PAR: ['Paraguay', 'py'], AUS: ['Australia', 'au'], TUR: ['Turquía', 'tr'],
  GER: ['Alemania', 'de'], ECU: ['Ecuador', 'ec'], CIV: ['Costa de Marfil', 'ci'], CUW: ['Curazao', 'cw'],
  NED: ['Países Bajos', 'nl'], JPN: ['Japón', 'jp'], TUN: ['Túnez', 'tn'], SWE: ['Suecia', 'se'],
  BEL: ['Bélgica', 'be'], IRN: ['Irán', 'ir'], EGY: ['Egipto', 'eg'], NZL: ['Nueva Zelanda', 'nz'],
  ESP: ['España', 'es'], URU: ['Uruguay', 'uy'], KSA: ['Arabia Saudí', 'sa'], CPV: ['Cabo Verde', 'cv'],
  FRA: ['Francia', 'fr'], SEN: ['Senegal', 'sn'], NOR: ['Noruega', 'no'], IRQ: ['Iraq', 'iq'],
  ARG: ['Argentina', 'ar'], AUT: ['Austria', 'at'], ALG: ['Argelia', 'dz'], JOR: ['Jordania', 'jo'],
  POR: ['Portugal', 'pt'], COL: ['Colombia', 'co'], UZB: ['Uzbekistán', 'uz'], COD: ['RD Congo', 'cd'],
  ENG: ['Inglaterra', 'gb-eng'], CRO: ['Croacia', 'hr'], PAN: ['Panamá', 'pa'], GHA: ['Ghana', 'gh'],
}

const V = {
  'Mexico City': ['Estadio Azteca', 'Ciudad de México'],
  Guadalajara: ['Estadio Guadalajara', 'Guadalajara'],
  Toronto: ['BMO Field', 'Toronto'],
  'Los Angeles': ['SoFi Stadium', 'Los Ángeles'],
  Boston: ['Gillette Stadium', 'Boston'],
  Vancouver: ['BC Place', 'Vancouver'],
  'New York': ['MetLife Stadium', 'Nueva York/NJ'],
  'San Francisco': ["Levi's Stadium", 'San Francisco'],
  Philadelphia: ['Lincoln Financial Field', 'Filadelfia'],
  Houston: ['NRG Stadium', 'Houston'],
  Dallas: ['AT&T Stadium', 'Dallas'],
  Monterrey: ['Estadio BBVA', 'Monterrey'],
  Miami: ['Hard Rock Stadium', 'Miami'],
  Atlanta: ['Mercedes-Benz Stadium', 'Atlanta'],
  Seattle: ['Lumen Field', 'Seattle'],
  'Kansas City': ['Arrowhead Stadium', 'Kansas City'],
}

// [id, group, home, away, cal, kick, venueKey, md]
const FIX = [
  ['A1','A','MEX','RSA',11,'15:00 ET','Mexico City',1],
  ['A2','A','KOR','CZE',11,'22:00 ET','Guadalajara',1],
  ['B1','B','CAN','BIH',12,'15:00 ET','Toronto',1],
  ['D1','D','USA','PAR',12,'21:00 ET','Los Angeles',1],
  ['C1','C','HAI','SCO',13,'21:00 ET','Boston',1],
  ['D2','D','AUS','TUR',13,'00:00 ET','Vancouver',1],
  ['C2','C','BRA','MAR',13,'18:00 ET','New York',1],
  ['B2','B','QAT','SUI',13,'15:00 ET','San Francisco',1],
  ['E1','E','CIV','ECU',14,'19:00 ET','Philadelphia',1],
  ['E2','E','GER','CUW',14,'13:00 ET','Houston',1],
  ['F1','F','NED','JPN',14,'16:00 ET','Dallas',1],
  ['F2','F','SWE','TUN',14,'22:00 ET','Monterrey',1],
  ['H1','H','KSA','URU',15,'18:00 ET','Miami',1],
  ['H2','H','ESP','CPV',15,'12:00 ET','Atlanta',1],
  ['G1','G','IRN','NZL',15,'21:00 ET','Los Angeles',1],
  ['G2','G','BEL','EGY',15,'15:00 ET','Seattle',1],
  ['I1','I','FRA','SEN',16,'15:00 ET','New York',1],
  ['I2','I','IRQ','NOR',16,'18:00 ET','Boston',1],
  ['J1','J','ARG','ALG',16,'21:00 ET','Kansas City',1],
  ['J2','J','AUT','JOR',16,'00:00 ET','San Francisco',1],
  ['L1','L','GHA','PAN',17,'19:00 ET','Toronto',1],
  ['L2','L','ENG','CRO',17,'16:00 ET','Dallas',1],
  ['K1','K','POR','COD',17,'13:00 ET','Houston',1],
  ['K2','K','UZB','COL',17,'22:00 ET','Mexico City',1],
  // MD2
  ['A3','A','CZE','RSA',18,'12:00 ET','Atlanta',2],
  ['B3','B','SUI','BIH',18,'15:00 ET','Los Angeles',2],
  ['B4','B','CAN','QAT',18,'18:00 ET','Vancouver',2],
  ['A4','A','MEX','KOR',18,'21:00 ET','Guadalajara',2],
  ['C3','C','BRA','HAI',19,'20:30 ET','Philadelphia',2],
  ['C4','C','SCO','MAR',19,'18:00 ET','Boston',2],
  ['D3','D','TUR','PAR',19,'23:00 ET','San Francisco',2],
  ['D4','D','USA','AUS',19,'15:00 ET','Seattle',2],
  ['E3','E','GER','CIV',20,'16:00 ET','Toronto',2],
  ['E4','E','ECU','CUW',20,'20:00 ET','Kansas City',2],
  ['F3','F','NED','SWE',20,'13:00 ET','Houston',2],
  ['F4','F','TUN','JPN',20,'00:00 ET','Monterrey',2],
  ['H3','H','URU','CPV',21,'18:00 ET','Miami',2],
  ['H4','H','ESP','KSA',21,'12:00 ET','Atlanta',2],
  ['G3','G','BEL','IRN',21,'15:00 ET','Los Angeles',2],
  ['G4','G','NZL','EGY',21,'21:00 ET','Vancouver',2],
  ['I3','I','NOR','SEN',22,'20:00 ET','New York',2],
  ['I4','I','FRA','IRQ',22,'17:00 ET','Philadelphia',2],
  ['J3','J','ARG','AUT',22,'13:00 ET','Dallas',2],
  ['J4','J','JOR','ALG',22,'23:00 ET','San Francisco',2],
  ['L3','L','ENG','GHA',23,'16:00 ET','Boston',2],
  ['L4','L','PAN','CRO',23,'19:00 ET','Toronto',2],
  ['K3','K','POR','UZB',23,'13:00 ET','Houston',2],
  ['K4','K','COL','COD',23,'22:00 ET','Guadalajara',2],
  // MD3
  ['C5','C','SCO','BRA',24,'18:00 ET','Miami',3],
  ['C6','C','MAR','HAI',24,'18:00 ET','Atlanta',3],
  ['B5','B','SUI','CAN',24,'15:00 ET','Vancouver',3],
  ['B6','B','BIH','QAT',24,'15:00 ET','Seattle',3],
  ['A5','A','CZE','MEX',24,'21:00 ET','Mexico City',3],
  ['A6','A','RSA','KOR',24,'21:00 ET','Monterrey',3],
  ['E5','E','CUW','CIV',25,'16:00 ET','Philadelphia',3],
  ['E6','E','ECU','GER',25,'16:00 ET','New York',3],
  ['F5','F','JPN','SWE',25,'19:00 ET','Dallas',3],
  ['F6','F','TUN','NED',25,'19:00 ET','Kansas City',3],
  ['D5','D','TUR','USA',25,'22:00 ET','Los Angeles',3],
  ['D6','D','PAR','AUS',25,'22:00 ET','San Francisco',3],
  ['I5','I','NOR','FRA',26,'15:00 ET','Boston',3],
  ['I6','I','SEN','IRQ',26,'15:00 ET','Toronto',3],
  ['G5','G','EGY','IRN',26,'23:00 ET','Seattle',3],
  ['G6','G','NZL','BEL',26,'23:00 ET','Vancouver',3],
  ['H5','H','CPV','KSA',26,'20:00 ET','Houston',3],
  ['H6','H','URU','ESP',26,'20:00 ET','Guadalajara',3],
  ['L5','L','PAN','ENG',27,'17:00 ET','New York',3],
  ['L6','L','CRO','GHA',27,'17:00 ET','Philadelphia',3],
  ['J5','J','ALG','AUT',27,'22:00 ET','Kansas City',3],
  ['J6','J','JOR','ARG',27,'22:00 ET','Dallas',3],
  ['K5','K','COL','POR',27,'19:30 ET','Miami',3],
  ['K6','K','COD','UZB',27,'19:30 ET','Atlanta',3],
]

const groupMatches = {}
for (const [id, g, h, a, cal, kick, vk, md] of FIX) {
  if (!groupMatches[g]) groupMatches[g] = []
  groupMatches[g].push({ id, h, a, cal, kick, vk, md })
}

const order = 'ABCDEFGHIJKL'.split('')
let out = `import type { Match, Team, Group } from './worldcup'

type Fx = { home: Team; away: Team; cal: number; venue: string; city: string; kick: string; md: number }
type GroupTeamMap = Record<string, Team>

function teamsByAbbr(teams: readonly Team[]): GroupTeamMap {
  return Object.fromEntries(teams.map(team => [team.abbr, team])) as GroupTeamMap
}

function pick(map: GroupTeamMap, abbr: string): Team {
  const team = map[abbr]
  if (!team) throw new Error(\`Equipo \${abbr} no existe en el grupo\`)
  return team
}

function m(id: string, group: string, fx: Fx): Match {
  return {
    id, group,
    home: fx.home, away: fx.away,
    date: \`\${fx.cal} Jun 2026\`,
    kickoff: fx.kick,
    venue: fx.venue, city: fx.city,
    status: 'upcoming',
    day: fx.md,
    calendarDay: fx.cal,
  }
}

/** Calendario oficial FIFA WC26 — 72 partidos fase de grupos (11–27 Jun 2026) */
export function buildOfficialGroups(teams: Record<string, readonly Team[]>): Group[] {
`

for (const g of order) {
  out += `  const ${g} = teamsByAbbr(teams.${g})\n`
}

out += `\n  return [\n`
for (const g of order) {
  out += `    { id: '${g}', name: 'Grupo ${g}',\n      matches: [\n`
  for (const x of groupMatches[g]) {
    const [venue, city] = V[x.vk]
    out += `        m('${x.id}', '${g}', { home: pick(${g}, '${x.h}'), away: pick(${g}, '${x.a}'), cal: ${x.cal}, venue: '${venue.replace(/'/g, "\\'")}', city: '${city.replace(/'/g, "\\'")}', kick: '${x.kick}', md: ${x.md} }),\n`
  }
  out += `      ],\n    },\n`
}
out += `  ]\n}\n`

writeFileSync('src/data/fixtures.ts', out)
console.log('Wrote', FIX.length, 'matches')
