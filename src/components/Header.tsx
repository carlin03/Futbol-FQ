import { useState } from 'react'
import { signOut } from '../services/database'
import { IconBall, IconHome, IconGroups, IconFantasy, IconTrophy, IconForum, IconUser, IconSettings, IconLogout, IconChevron, IconStats, IconTarget } from './Icons'

interface Props {
  page: string
  navPage?: string
  setPage: (p: string) => void
  username: string
  onAdminClick: () => void
}

const NAV = [
  { id: 'home', label: 'Inicio', Icon: IconHome },
  { id: 'groups', label: 'Grupos', Icon: IconGroups },
  { id: 'quiniela', label: 'Quiniela', Icon: IconTarget },
  { id: 'fantasy', label: 'Mi Once', Icon: IconFantasy },
  { id: 'ranking', label: 'Ranking', Icon: IconTrophy },
  { id: 'stats', label: 'Stats', Icon: IconStats },
  { id: 'forum', label: 'Foro', Icon: IconForum },
]

export default function Header({ page, navPage, setPage, username, onAdminClick }: Props) {
  const [open, setOpen] = useState(false)
  const active = navPage ?? page

  return (
    <header className="wc-header">
      <button type="button" onClick={() => setPage('home')} className="wc-logo" aria-label="Ir a inicio">
        <IconBall size={22} color="var(--gold)" />
        <span>FQ26</span>
      </button>

      <nav className="wc-nav" aria-label="Principal">
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPage(id)}
            className={`wc-nav-btn ${active === id ? 'active' : ''}`}
            aria-current={active === id ? 'page' : undefined}
          >
            <Icon size={16} color={active === id ? 'var(--gold)' : 'var(--text2)'} />
            {label}
          </button>
        ))}
      </nav>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" onClick={onAdminClick} className="wc-icon-btn" aria-label="Panel admin" title="Admin">
          <IconSettings size={18} />
        </button>
        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => setOpen(!open)} className="wc-user-btn" aria-expanded={open} aria-haspopup="menu">
            <IconUser size={16} color="var(--gold)" />
            <span>{username.substring(0, 12)}</span>
            <IconChevron size={12} dir={open ? 'up' : 'down'} />
          </button>
          {open && (
            <div className="wc-dropdown" role="menu">
              <button type="button" onClick={() => { setPage('profile'); setOpen(false) }} className="wc-dropdown-item" role="menuitem">
                <IconUser size={14} /> Mi Perfil
              </button>
              <button type="button" onClick={() => { signOut().then(() => window.location.reload()).catch(console.error) }} className="wc-dropdown-item danger" role="menuitem">
                <IconLogout size={14} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
