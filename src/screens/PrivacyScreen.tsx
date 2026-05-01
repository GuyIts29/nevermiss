import { Shield, Lock, WifiOff, Eye, BarChart2, Smartphone, FileUp, MessageCircle, BookOpen, RefreshCw, Mail } from 'lucide-react'
import { PageHeader } from '@/components/Navigation'
import { useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { APP_CONFIG } from '@/config/appConfig'

export function PrivacyScreen() {
  const t = useT()
  const { theme } = useTheme()

  const SECTIONS = [
    { icon: Lock,          title: t('privacy_s1_title'),  color: '#8B5CF6', body: t('privacy_s1_body') },
    { icon: Shield,        title: t('privacy_s2_title'),  color: '#10B981', body: t('privacy_s2_body') },
    { icon: BarChart2,     title: t('privacy_s3_title'),  color: '#3B82F6', body: t('privacy_s3_body') },
    { icon: Eye,           title: t('privacy_s4_title'),  color: '#F59E0B', body: t('privacy_s4_body') },
    { icon: MessageCircle, title: t('privacy_s5_title'),  color: '#25D366', body: t('privacy_s5_body') },
    { icon: FileUp,        title: t('privacy_s6_title'),  color: '#0EA5E9', body: t('privacy_s6_body') },
    { icon: WifiOff,       title: t('privacy_s7_title'),  color: '#6366F1', body: t('privacy_s7_body') },
    { icon: Smartphone,    title: t('privacy_s8_title'),  color: '#F43F5E', body: t('privacy_s8_body') },
    { icon: RefreshCw,     title: t('privacy_s9_title'),  color: '#F97316', body: t('privacy_s9_body') },
    { icon: Mail,          title: t('privacy_s10_title'), color: '#A855F7', body: t('privacy_s10_body') },
  ]

  return (
    <div className="screen-container">
      <PageHeader title={t('privacy_title')} back />
      <div className="page-content space-y-3 pb-10">

        {/* Hero */}
        <div
          className="rounded-[var(--border-radius-lg)] p-5 text-center animate-scale-in relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
        >
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative">
            <div className="text-4xl mb-2 animate-float inline-block">🔒</div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">{t('privacy_hero_title')}</h2>
            <p className="text-white/75 text-xs mt-1">{t('privacy_last_updated')} {APP_CONFIG.releaseDate}</p>
            <div
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              <Shield size={10} />
              {t('privacy_badge')}
            </div>
          </div>
        </div>

        {/* Intro */}
        <div className="card stagger-1">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {t('privacy_intro', { appName: APP_CONFIG.appName })}
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map(({ icon: Icon, title, color, body }, idx) => (
          <div key={title} className={`card stagger-${Math.min(idx + 1, 5) as 1|2|3|4|5}`}>
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${color}25, ${color}12)` }}
              >
                <Icon size={14} style={{ color }} />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-sm text-[var(--color-text-primary)] mb-1">{title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{body}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div
          className="p-3 rounded-[var(--border-radius)] text-center"
          style={{ background: 'var(--color-surface-2)' }}
        >
          <p className="text-xs text-[var(--color-text-muted)]">
            <BookOpen size={10} className="inline me-1" />
            {t('privacy_footer')}
          </p>
        </div>
      </div>
    </div>
  )
}
