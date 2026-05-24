/** Nombres que usa API-Football (inglés) por abreviatura local */
export const API_TEAM_ALIASES: Record<string, string[]> = {
  MEX: ['Mexico', 'México'],
  KOR: ['South Korea', 'Korea Republic', 'Corea'],
  RSA: ['South Africa', 'Sudáfrica'],
  CZE: ['Czech Republic', 'Czechia', 'Chequia'],
  CAN: ['Canada', 'Canadá'],
  SUI: ['Switzerland', 'Suiza'],
  QAT: ['Qatar'],
  BIH: ['Bosnia', 'Bosnia and Herzegovina'],
  BRA: ['Brazil', 'Brasil'],
  MAR: ['Morocco', 'Marruecos'],
  SCO: ['Scotland', 'Escocia'],
  HAI: ['Haiti', 'Haití'],
  USA: ['USA', 'United States', 'Estados Unidos'],
  PAR: ['Paraguay'],
  AUS: ['Australia'],
  TUR: ['Turkey', 'Turquía', 'Türkiye'],
  GER: ['Germany', 'Alemania'],
  ECU: ['Ecuador'],
  CIV: ['Ivory Coast', "Cote d'Ivoire", 'Costa de Marfil'],
  CUW: ['Curacao', 'Curazao', 'Curaçao'],
  NED: ['Netherlands', 'Holland', 'Países Bajos'],
  JPN: ['Japan', 'Japón'],
  TUN: ['Tunisia', 'Túnez'],
  SWE: ['Sweden', 'Suecia'],
  BEL: ['Belgium', 'Bélgica'],
  IRN: ['Iran', 'Irán'],
  EGY: ['Egypt', 'Egipto'],
  NZL: ['New Zealand', 'Nueva Zelanda'],
  ESP: ['Spain', 'España'],
  URU: ['Uruguay'],
  KSA: ['Saudi Arabia', 'Arabia Saudí'],
  CPV: ['Cape Verde', 'Cabo Verde'],
  FRA: ['France', 'Francia'],
  SEN: ['Senegal'],
  NOR: ['Norway', 'Noruega'],
  IRQ: ['Iraq'],
  ARG: ['Argentina'],
  AUT: ['Austria'],
  ALG: ['Algeria', 'Argelia'],
  JOR: ['Jordan', 'Jordania'],
  POR: ['Portugal'],
  COL: ['Colombia'],
  UZB: ['Uzbekistan', 'Uzbekistán'],
  COD: ['DR Congo', 'Congo DR', 'Congo', 'RD Congo'],
  ENG: ['England', 'Inglaterra'],
  CRO: ['Croatia', 'Croacia'],
  PAN: ['Panama', 'Panamá'],
  GHA: ['Ghana'],
}

export function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

export function apiTeamMatchesAbbr(apiTeamName: string, abbr: string): boolean {
  const aliases = API_TEAM_ALIASES[abbr]
  if (!aliases) return false
  const n = normalizeTeamName(apiTeamName)
  return aliases.some(a => {
    const alias = normalizeTeamName(a)
    return n === alias || n.includes(alias) || alias.includes(n)
  })
}
