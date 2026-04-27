import { Heart, Shield, Zap, Globe, Lock, WifiOff, BarChart2, Eye } from 'lucide-react'
import { PageHeader } from '@/components/Navigation'
import { useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { APP_CONFIG } from '@/config/appConfig'

export function AboutScreen() {
  const t = useT()
  const { theme } = useTheme()

  const VALUES = [
    {
      icon: Shield,
      gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
      title: 'Privacy First',
      desc: 'All your data lives on your device. We never access, collect, or transmit your personal information.',
    },
    {
      icon: Globe,
      gradient: 'linear-gradient(135deg, #10B981, #0891B2)',
      title: 'Cultural Respect',
      desc: 'We treat all religions and traditions with equal respect and care. Every holiday is presented with accuracy and sensitivity.',
    },
    {
      icon: Heart,
      gradient: 'linear-gradient(135deg, #F43F5E, #EC4899)',
      title: 'Human Connection',
      desc: 'Technology should strengthen relationships, not replace them. We help you show up for the people who matter.',
    },
    {
      icon: Zap,
      gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
      title: 'Smart Intelligence',
      desc: 'Our relationship engine helps you prioritize without overwhelming. The right message, at the right time, for the right person.',
    },
  ]

  const TECH = [
    { icon: Lock,     label: 'Data Storage',    value: 'Local device only', color: '#8B5CF6' },
    { icon: WifiOff,  label: 'External APIs',   value: 'None — fully offline', color: '#10B981' },
    { icon: BarChart2,label: 'Analytics',        value: 'None', color: '#3B82F6' },
    { icon: Eye,      label: 'Tracking / Ads',  value: 'None', color: '#F43F5E' },
  ]

  return (
    <div className="screen-container">
      <PageHeader title={t('about_title')} back />

      <div className="page-content space-y-4 pb-10">

        {/* Hero */}
        <div
          className="rounded-[var(--border-radius-lg)] p-5 text-center animate-scale-in"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
        >
          <div className="text-5xl mb-2 animate-float">💌</div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{APP_CONFIG.appName}</h2>
          <p className="text-sm text-white/80 mt-1">{APP_CONFIG.appTagline}</p>
          <div
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            v{APP_CONFIG.appVersion} · Build {APP_CONFIG.buildNumber}
          </div>
        </div>

        {/* Mission */}
        <div className="card stagger-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${theme.primary}25, ${theme.secondary}15)` }}>
              <Heart size={12} style={{ color: theme.primary }} />
            </div>
            <h3 className="font-extrabold text-sm text-[var(--color-text-primary)]">{t('about_mission')}</h3>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            NeverMiss helps people maintain meaningful relationships by combining smart CRM with
            cultural intelligence. We believe every important moment deserves acknowledgment —
            whether it's a colleague's religious holiday, a client's birthday, or simply checking in
            with someone you care about.
          </p>
        </div>

        {/* Core Values */}
        <div className="card stagger-2">
          <h3 className="font-extrabold text-sm text-[var(--color-text-primary)] mb-3">{t('about_values')}</h3>
          <div className="space-y-3">
            {VALUES.map(({ icon: Icon, gradient, title, desc }) => (
              <div key={title} className="flex gap-3 items-start">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ background: gradient }}
                >
                  <Icon size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">{title}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notice */}
        <div className="card stagger-3">
          <h3 className="font-extrabold text-sm text-[var(--color-text-primary)] mb-2">{t('about_notice')}</h3>
          <div
            className="p-3 rounded-[var(--border-radius)] border"
            style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)' }}
          >
            <p className="text-sm font-bold text-amber-700">{t('about_noAutoSend')}</p>
            <p className="text-xs text-amber-600 mt-1 leading-relaxed">{t('about_noAutoSendDesc')}</p>
          </div>
        </div>

        {/* Technical */}
        <div className="card stagger-4">
          <h3 className="font-extrabold text-sm text-[var(--color-text-primary)] mb-3">{t('about_technical')}</h3>
          <div className="space-y-2">
            {TECH.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={13} style={{ color }} />
                </div>
                <span className="flex-1 text-sm text-[var(--color-text-muted)]">{label}</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${color}15`, color }}
                >
                  {value}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)] mt-1">
              <span className="text-sm text-[var(--color-text-muted)]">Platform</span>
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                Web · Android · iOS (Capacitor)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
