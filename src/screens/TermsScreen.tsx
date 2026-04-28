import { CheckCircle, MessageCircle, Calendar, CreditCard, HardDrive, AlertTriangle, Scale, RefreshCw, FileText, Gavel } from 'lucide-react'
import { PageHeader } from '@/components/Navigation'
import { useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { APP_CONFIG } from '@/config/appConfig'
import type { TranslationKey } from '@/i18n'

export function TermsScreen() {
  const t = useT()
  const { theme } = useTheme()

  const SECTIONS = [
    { icon: FileText,      titleKey: 'terms_s1_title',  bodyKey: 'terms_s1_body',  color: '#3B82F6' },
    { icon: CheckCircle,   titleKey: 'terms_s2_title',  bodyKey: 'terms_s2_body',  color: '#10B981' },
    { icon: AlertTriangle, titleKey: 'terms_s3_title',  bodyKey: 'terms_s3_body',  color: '#F97316' },
    { icon: MessageCircle, titleKey: 'terms_s4_title',  bodyKey: 'terms_s4_body',  color: '#25D366' },
    { icon: Calendar,      titleKey: 'terms_s5_title',  bodyKey: 'terms_s5_body',  color: '#8B5CF6' },
    { icon: CreditCard,    titleKey: 'terms_s6_title',  bodyKey: 'terms_s6_body',  color: '#F59E0B' },
    { icon: HardDrive,     titleKey: 'terms_s7_title',  bodyKey: 'terms_s7_body',  color: '#0EA5E9' },
    { icon: Scale,         titleKey: 'terms_s8_title',  bodyKey: 'terms_s8_body',  color: '#6366F1' },
    { icon: Gavel,         titleKey: 'terms_s9_title',  bodyKey: 'terms_s9_body',  color: '#F43F5E' },
    { icon: RefreshCw,     titleKey: 'terms_s10_title', bodyKey: 'terms_s10_body', color: '#A855F7' },
  ] as const

  return (
    <div className="screen-container">
      <PageHeader title={t('terms_title')} back />
      <div className="page-content space-y-3 pb-10">

        {/* Hero */}
        <div
          className="rounded-[var(--border-radius-lg)] p-5 text-center animate-scale-in relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
        >
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative">
            <div className="text-4xl mb-2 animate-float inline-block">📋</div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              {APP_CONFIG.appName} — {t('terms_title')}
            </h2>
            <p className="text-white/75 text-xs mt-1">
              {t('terms_lastUpdated', { date: APP_CONFIG.releaseDate })}
            </p>
          </div>
        </div>

        {/* Intro */}
        <div className="card stagger-1">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {t('terms_intro', { appName: APP_CONFIG.appName })}
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map(({ icon: Icon, titleKey, bodyKey, color }, idx) => (
          <div key={titleKey} className={`card stagger-${Math.min(idx + 1, 5) as 1|2|3|4|5}`}>
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${color}25, ${color}12)` }}
              >
                <Icon size={14} style={{ color }} />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-sm text-[var(--color-text-primary)] mb-1">
                  {t(titleKey as TranslationKey)}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {t(bodyKey as TranslationKey)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
