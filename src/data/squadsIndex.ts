import { SQUADS, type SquadEntry } from './squads'
import { SQUAD_EXTRAS } from './squadExtras'

/** Plantilla completa (~23-26 jugadores) por selección */
export function getFullSquad(abbr: string): SquadEntry[] {
  const base = SQUADS[abbr] || []
  const extra = SQUAD_EXTRAS[abbr] || []
  const seen = new Set<string>()
  const out: SquadEntry[] = []
  for (const p of [...base, ...extra]) {
    if (seen.has(p.name)) continue
    seen.add(p.name)
    out.push(p)
  }
  return out
}

export { SQUADS, type SquadEntry }
