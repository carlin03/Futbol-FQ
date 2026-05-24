import { getFlagUrl } from '../data/worldcup'

interface Props {
  code: string
  size?: number
  width?: number
  height?: number
  style?: React.CSSProperties
  className?: string
  title?: string
}

/** Banderas oficiales (flagcdn.com) — tamaño visual vía CSS, URL con ancho válido del CDN */
export default function FlagImg({ code, size = 40, width, height, style, className, title }: Props) {
  const displayW = width ?? Math.round(size * 1.35)
  const displayH = height ?? Math.round(size * 0.75)

  if (!code || code === 'xx') {
    return (
      <span
        style={{
          width: displayW, height: displayH, display: 'inline-block',
          background: 'rgba(255,255,255,.08)', borderRadius: 3, flexShrink: 0, ...style,
        }}
      />
    )
  }

  const src = getFlagUrl(code, size)
  if (!src) return null

  return (
    <img
      src={src}
      alt=""
      title={title}
      className={className}
      loading="lazy"
      decoding="async"
      style={{
        width: displayW,
        height: displayH,
        objectFit: 'cover',
        borderRadius: 3,
        flexShrink: 0,
        display: 'block',
        ...style,
      }}
    />
  )
}
