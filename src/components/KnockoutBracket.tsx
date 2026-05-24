import { KNOCKOUT_ROUNDS, KNOCKOUT_MATCHES, type KnockoutMatch } from '../data/knockout'
import FlagImg from './FlagImg'
import { IconTrophy } from './Icons'

function MatchSlot({ m, compact }: { m: KnockoutMatch; compact?: boolean }) {
  return (
    <div className="wc-bracket-slot fade-up" style={{
      background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', borderRadius: 8,
      padding: compact ? '8px 10px' : '10px 12px', minWidth: compact ? 160 : 200,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        {m.home ? <FlagImg code={m.home.flag} size={16} /> : <span style={{ width: 22, height: 16, background: 'rgba(255,255,255,.08)', borderRadius: 2, display: 'inline-block' }} />}
        <span style={{ fontSize: compact ? 10 : 11, fontWeight: 700, flex: 1, color: m.home ? 'var(--text)' : 'var(--text2)' }}>
          {m.home?.abbr || m.homeLabel}
        </span>
      </div>
      <div style={{ textAlign: 'center', fontSize: 9, color: 'var(--gold)', fontWeight: 800, margin: '2px 0' }}>VS</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {m.away ? <FlagImg code={m.away.flag} size={16} /> : <span style={{ width: 22, height: 16, background: 'rgba(255,255,255,.08)', borderRadius: 2, display: 'inline-block' }} />}
        <span style={{ fontSize: compact ? 10 : 11, fontWeight: 700, flex: 1, color: m.away ? 'var(--text)' : 'var(--text2)' }}>
          {m.away?.abbr || m.awayLabel}
        </span>
      </div>
      <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: 'var(--text3)' }}>{m.date.split(' ').slice(0, 3).join(' ')}</span>
        <span className="wc-tag" style={{ fontSize: 8, padding: '2px 6px' }}>Próximamente</span>
      </div>
    </div>
  )
}

interface Props {
  view?: 'bracket' | 'list'
}

export default function KnockoutBracket({ view = 'bracket' }: Props) {
  if (view === 'list') {
    return (
      <div>
        {KNOCKOUT_ROUNDS.map(round => {
          const matches = KNOCKOUT_MATCHES.filter(m => m.roundKey === round.key)
          return (
            <div key={round.key} style={{ marginBottom: 28 }}>
              <div className="wc-day-header" style={{ marginBottom: 12 }}>
                <IconTrophy size={20} color="var(--gold)" />
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{round.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text2)' }}>{round.dates}</p>
                </div>
                <span className="wc-tag" style={{ marginLeft: 'auto' }}>Próximamente</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                {matches.map(m => (
                  <div key={m.id} className="wc-match-row" style={{ padding: 14 }}>
                    <p style={{ margin: '0 0 8px', fontSize: 10, color: 'var(--text2)' }}>{m.venue} · {m.city}</p>
                    <MatchSlot m={m} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="wc-bracket-wrap" style={{ overflowX: 'auto', padding: '10px 0 30px' }}>
      <div style={{ display: 'flex', gap: 24, minWidth: 1100, alignItems: 'stretch' }}>
        {KNOCKOUT_ROUNDS.filter(r => r.key !== '3rd').map(round => {
          const matches = KNOCKOUT_MATCHES.filter(m => m.roundKey === round.key)
          const isFinal = round.key === 'final'
          return (
            <div key={round.key} style={{ flex: isFinal ? '0 0 220px' : '0 0 200px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: 'var(--gold)' }}>{round.label}</p>
                <p style={{ margin: '4px 0 0', fontSize: 9, color: 'var(--text3)' }}>{round.dates}</p>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: 12 }}>
                {matches.map(m => <MatchSlot key={m.id} m={m} compact />)}
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 24, maxWidth: 400 }}>
        <p style={{ margin: '0 0 10px', fontWeight: 800, fontSize: 14, color: 'var(--text2)' }}>Partido por el tercer puesto</p>
        <MatchSlot m={KNOCKOUT_MATCHES.find(m => m.roundKey === '3rd')!} />
      </div>
      <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text2)', textAlign: 'center' }}>
        Los cruces de terceros clasificados y el cuadro definitivo se confirmarán al terminar la fase de grupos.
      </p>
    </div>
  )
}
