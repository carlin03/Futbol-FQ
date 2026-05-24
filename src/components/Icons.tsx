interface IconProps {
  size?: number
  color?: string
  className?: string
}

const base = (size: number, color: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export function IconBall({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7l3.5 2.5L14 13h-4l-1.5-3.5L12 7z" />
    </svg>
  )
}

export function IconHome({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

export function IconGroups({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

export function IconLive({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <circle cx="12" cy="12" r="3" fill={color} stroke="none" />
      <path d="M12 2a10 10 0 0 1 0 20" />
      <path d="M12 2a10 10 0 0 0 0 20" opacity="0.4" />
    </svg>
  )
}

export function IconFantasy({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <circle cx="12" cy="7" r="3" />
      <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8" opacity="0.5" />
      <path d="M8 3.1a4 4 0 0 0 0 7.8" opacity="0.5" />
    </svg>
  )
}

export function IconTrophy({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

export function IconForum({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function IconUser({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 12 0v1" />
    </svg>
  )
}

export function IconSettings({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  )
}

export function IconLogout({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export function IconLike({ size = 16, color = 'currentColor', filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  )
}

export function IconComment({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-9-8.4 8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 9 8.4z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  )
}

export function IconTrash({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  )
}

export function IconEdit({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  )
}

export function IconCalendar({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export function IconClock({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function IconLocation({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function IconChevron({ size = 14, color = 'currentColor', dir = 'down' }: IconProps & { dir?: 'up' | 'down' | 'left' | 'right' }) {
  const rot = { down: 0, up: 180, left: 90, right: -90 }[dir]
  return (
    <svg {...base(size, color)} style={{ transform: `rotate(${rot}deg)` }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function IconClose({ size = 16, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function IconStats({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

export function IconTarget({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
