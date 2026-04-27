import { Sparkles, Zap, Wrench, Shield } from 'lucide-react'
import { PageHeader } from '@/components/Navigation'
import { CHANGELOG } from '@/data/changelog'
import { useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import type { ChangeType } from '@/types'

export function WhatsNewScreen() {
  const t = useT()
  const { theme } = useTheme()

  const TYPE_META: Record<ChangeType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    feature:     { icon: Sparkles, color: '#fff', bg: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', label: t('changelog_feature') },
    improvement: { icon: Zap,      color: '#fff', bg: 'linear-gradient(135deg, #10B981, #059669)', label: t('changelog_improvement') },
    bugfix:      { icon: Wrench,   color: '#fff', bg: 'linear-gradient(135deg, #F97316, #EA580C)', label: t('changelog_bugfix') },
    security:    { icon: Shield,   color: '#fff', bg: 'linear-gradient(135deg, #8B5CF6, #6366F1)', label: t('changelog_security') },
  }

  return (
    <div className="screen-container">
      <PageHeader title={t('whatsNew_title')} back />

      <div className="page-content pb-10">
        {/* Hero */}
        <div
          className="rounded-[var(--border-radius-lg)] p-4 mb-5 flex items-center gap-3 animate-scale-in"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
        >
          <div className="text-3xl animate-float">✨</div>
          <div>
            <p className="text-white font-extrabold text-base">{t('whatsNew_title')}</p>
            <p className="text-white/75 text-xs mt-0.5">v{CHANGELOG[0]?.version} — {CHANGELOG[0]?.title}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div
            className="absolute left-[19px] top-0 bottom-0 w-0.5 rounded-full"
            style={{ background: `linear-gradient(180deg, ${theme.primary}, transparent)` }}
          />

          <div className="space-y-6">
            {CHANGELOG.map((entry, idx) => (
              <div key={entry.version} className={`relative pl-10 stagger-${Math.min(idx + 1, 5)}`}>
                {/* Timeline dot */}
                <div
                  className="absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-extrabold shadow-sm z-10"
                  style={{
                    background: idx === 0
                      ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                      : 'var(--color-surface-2)',
                    border: `2px solid ${idx === 0 ? theme.primary : 'var(--color-border)'}`,
                    color: idx === 0 ? '#fff' : 'var(--color-text-muted)',
                  }}
                >
                  v{entry.version.split('.').pop()}
                </div>

                <div className="card">
                  {/* Version header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[var(--color-text-primary)]">
                          v{entry.version}
                        </span>
                        {idx === 0 && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                          >
                            {t('whatsNew_latest')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-[var(--color-text-secondary)] mt-0.5">
                        {entry.title}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)] shrink-0 ml-2">{entry.date}</span>
                  </div>

                  {/* Changes list */}
                  <ul className="space-y-2">
                    {entry.changes.map((change, i) => {
                      const { icon: Icon, color, bg, label } = TYPE_META[change.type]
                      return (
                        <li key={i} className="flex items-start gap-2.5">
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0"
                            style={{ background: bg }}
                          >
                            <Icon size={10} color={color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span
                              className="text-[10px] font-extrabold mr-1.5 uppercase tracking-wide"
                              style={{ color: bg.includes('#3B82F6') ? '#3B82F6' : bg.includes('#10B981') ? '#10B981' : bg.includes('#F97316') ? '#F97316' : '#8B5CF6' }}
                            >
                              {label}
                            </span>
                            <span className="text-sm text-[var(--color-text-secondary)]">
                              {change.description}
                            </span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
