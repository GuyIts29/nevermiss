import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Calendar, Users, FolderOpen, Settings } from 'lucide-react'
import { clsx } from 'clsx'
import { useT, useLang } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'

export function BottomNav() {
  const location = useLocation()
  const t = useT()
  const { theme } = useTheme()

  const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav_dashboard') },
    { to: '/calendar', icon: Calendar, label: t('nav_calendar') },
    { to: '/contacts', icon: Users, label: t('nav_contacts') },
    { to: '/groups', icon: FolderOpen, label: t('nav_groups') },
    { to: '/settings', icon: Settings, label: t('nav_settings') },
  ] as const

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
        const active = location.pathname === to || location.pathname.startsWith(to + '/')
        return (
          <NavLink
            key={to}
            to={to}
            className={clsx('bottom-nav-item', active && 'active')}
          >
            <div className="relative flex items-center justify-center w-8 h-8">
              {active && (
                <div
                  className="absolute inset-0 rounded-xl opacity-15"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                />
              )}
              <Icon
                size={active ? 22 : 20}
                strokeWidth={active ? 2.5 : 1.8}
                style={active ? { color: theme.primary } : undefined}
                className="transition-all duration-200 relative z-10"
              />
            </div>
            <span
              className="transition-all duration-200 font-semibold"
              style={active ? { color: theme.primary, fontWeight: 800 } : undefined}
            >
              {label}
            </span>
            {active && (
              <div
                className="w-1 h-1 rounded-full mt-0.5"
                style={{ background: theme.primary }}
              />
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  right?: React.ReactNode
  back?: boolean
}

export function PageHeader({ title, subtitle, right, back }: PageHeaderProps) {
  const { lang } = useLang()
  const t = useT()
  const isRtl = lang === 'he'

  return (
    <header className="page-header">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {back && (
          <button
            onClick={() => window.history.back()}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl hover:bg-[var(--color-surface-2)] transition-all active:scale-90 shrink-0"
            aria-label={t('go_back')}
          >
            <svg
              className="w-5 h-5 text-[var(--color-text-secondary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={isRtl ? { transform: 'scaleX(-1)' } : undefined}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-base font-extrabold text-[var(--color-text-primary)] truncate tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  )
}
