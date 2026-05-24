import type { TickerSegment } from '../../hooks/useTickerItems'

interface Props {
  segments: TickerSegment[]
  label: string
  speed?: number
  variant?: 'top' | 'bottom'
  topOffset?: number
  badgePulse?: boolean
}

export default function TickerScroll({
  segments,
  label,
  speed = 45,
  variant = 'top',
  topOffset = 68,
  badgePulse = false,
}: Props) {
  const items = segments.length > 0 ? segments : [{ text: 'MUNDIAL 2026 · FQ26', type: 'gold' as const }]
  const doubled = [...items, ...items]

  return (
    <div
      className={`sport-ticker sport-ticker--${variant}`}
      style={variant === 'top' ? { top: topOffset } : undefined}
      aria-hidden="true"
    >
      <div className={`sport-ticker-badge${badgePulse ? ' sport-ticker-badge--pulse' : ''}`}>
        {badgePulse && <span className="sport-ticker-live-dot" />}
        <span className="sport-ticker-badge-text">{label}</span>
      </div>

      <div className="sport-ticker-track overflow-hidden">
        <div
          className="sport-ticker-marquee whitespace-nowrap"
          style={{ ['--ticker-duration' as string]: `${speed}s` }}
        >
          {doubled.map((seg, i) => (
            <span key={i} className={`sport-ticker-seg sport-ticker-seg--${seg.type ?? 'gold'}`}>
              <span className="sport-ticker-sep" aria-hidden>◆</span>
              {seg.text}
            </span>
          ))}
        </div>
      </div>

      <div className="sport-ticker-edge sport-ticker-edge--left" aria-hidden />
      <div className="sport-ticker-edge sport-ticker-edge--right" aria-hidden />
      <div className="sport-ticker-scanline" aria-hidden />
    </div>
  )
}
