import { useState, useMemo } from 'react'
import { Bell, Check, Info } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useLang, useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { PageHeader } from '@/components/Navigation'
import { Card } from '@/components/ui/Card'
import { PremiumFeaturePrompt } from '@/components/PremiumBadge'
import { getReminderSettings, saveReminderSettings, type HolidayReminderSettings } from '@/services/reminderService'
import { getInitials, getAvatarGradient } from '@/utils/avatarUtils'

const DAYS_OPTIONS: { value: 1 | 3 | 7; labelKey: 'reminders_1day' | 'reminders_3days' | 'reminders_7days' }[] = [
  { value: 1, labelKey: 'reminders_1day' },
  { value: 3, labelKey: 'reminders_3days' },
  { value: 7, labelKey: 'reminders_7days' },
]

export function HolidayRemindersScreen() {
  const { isPremium, contacts, holidays } = useApp()
  const t = useT()
  const { lang } = useLang()
  const { theme } = useTheme()
  const [settings, setSettings] = useState<HolidayReminderSettings>(() => getReminderSettings())
  const [saved, setSaved] = useState(false)

  const upcomingPairs = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const cutoff = new Date(today)
    cutoff.setDate(cutoff.getDate() + 30)
    const pairs: { contact: typeof contacts[0]; holiday: typeof holidays[0]; daysUntil: number }[] = []

    for (const holiday of holidays) {
      const hDate = new Date(holiday.date)
      hDate.setFullYear(today.getFullYear())
      hDate.setHours(0, 0, 0, 0)
      if (hDate < today) hDate.setFullYear(today.getFullYear() + 1)
      if (hDate > cutoff) continue
      const daysUntil = Math.round((hDate.getTime() - today.getTime()) / 86_400_000)

      for (const contact of contacts) {
        if (contact.religion === holiday.religion) {
          pairs.push({ contact, holiday, daysUntil })
        }
      }
    }

    pairs.sort((a, b) => a.daysUntil - b.daysUntil)
    return pairs
  }, [contacts, holidays])

  const handleSave = () => {
    saveReminderSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggle = (field: keyof HolidayReminderSettings['channels']) => {
    setSettings(s => ({ ...s, channels: { ...s.channels, [field]: !s.channels[field] } }))
  }

  if (!isPremium) {
    return (
      <div className="screen-container">
        <PageHeader title={t('reminders_title')} back />
        <div className="page-content">
          <PremiumFeaturePrompt feature={t('reminders_title')} />
        </div>
      </div>
    )
  }

  const hasExternalChannels = settings.channels.sms || settings.channels.email || settings.channels.whatsapp

  return (
    <div className="screen-container">
      <PageHeader title={t('reminders_title')} back />

      <div className="page-content space-y-4 pb-24">
        {/* Hero */}
        <div
          className="rounded-[var(--border-radius-lg)] p-4 flex items-center gap-3"
          style={{ background: `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}08)`, border: `1px solid ${theme.primary}25` }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
          >
            <Bell size={18} color="white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">{t('reminders_title')}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{t('reminders_subtitle')}</p>
          </div>
        </div>

        {/* Master toggle */}
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{t('reminders_enabled')}</p>
            <button
              onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
              aria-label={t('reminders_enabled')}
              className="relative w-11 h-6 rounded-full transition-colors shrink-0"
              style={{ background: settings.enabled ? theme.primary : 'var(--color-border)' }}
            >
              <span
                className={`absolute top-0.5 ${lang === 'he' ? 'right-0.5' : 'left-0.5'} w-5 h-5 rounded-full bg-white shadow transition-transform`}
                style={{ transform: settings.enabled ? `translateX(${lang === 'he' ? '-20px' : '20px'})` : 'translateX(0)' }}
              />
            </button>
          </div>
        </Card>

        {settings.enabled && (
          <>
            {/* Days ahead */}
            <Card>
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">{t('reminders_daysAhead')}</p>
              <div className="flex gap-2">
                {DAYS_OPTIONS.map(({ value, labelKey }) => (
                  <button
                    key={value}
                    onClick={() => setSettings(s => ({ ...s, daysAhead: value }))}
                    className="flex-1 py-2 rounded-[var(--border-radius)] text-xs font-semibold transition-all"
                    style={{
                      background: settings.daysAhead === value
                        ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                        : 'var(--color-surface-2)',
                      color: settings.daysAhead === value ? 'white' : 'var(--color-text-secondary)',
                      border: `1px solid ${settings.daysAhead === value ? theme.primary : 'var(--color-border)'}`,
                    }}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </Card>

            {/* Channel toggles */}
            <Card>
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">{t('reminders_channels')}</p>
              <div className="space-y-3">
                {(
                  [
                    { key: 'push', label: t('reminders_push'), available: true },
                    { key: 'sms', label: t('reminders_sms'), available: false },
                    { key: 'email', label: t('reminders_email'), available: false },
                    { key: 'whatsapp', label: t('reminders_whatsapp'), available: false },
                  ] as const
                ).map(({ key, label, available }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-[var(--color-text-primary)]">{label}</p>
                      {!available && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
                        >
                          {t('new')}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggle(key)}
                      aria-label={label}
                      className="relative w-11 h-6 rounded-full transition-colors shrink-0"
                      style={{ background: settings.channels[key] ? theme.primary : 'var(--color-border)' }}
                    >
                      <span
                        className={`absolute top-0.5 ${lang === 'he' ? 'right-0.5' : 'left-0.5'} w-5 h-5 rounded-full bg-white shadow transition-transform`}
                        style={{ transform: settings.channels[key] ? `translateX(${lang === 'he' ? '-20px' : '20px'})` : 'translateX(0)' }}
                      />
                    </button>
                  </div>
                ))}
              </div>
              {hasExternalChannels && (
                <div
                  className="mt-3 p-2.5 rounded-[var(--border-radius)] flex gap-2 items-start"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
                >
                  <Info size={13} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{t('reminders_providerNote')}</p>
                </div>
              )}
            </Card>

            {/* Upcoming contact+holiday pairs */}
            <div>
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">{t('reminders_upcoming')}</p>
              {upcomingPairs.length === 0 ? (
                <Card>
                  <p className="text-sm text-[var(--color-text-muted)] text-center py-2">{t('reminders_noUpcoming')}</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {upcomingPairs.slice(0, 10).map(({ contact, holiday, daysUntil }) => (
                    <div
                      key={`${contact.id}:${holiday.id}`}
                      className="flex items-center gap-3 p-3 rounded-[var(--border-radius)]"
                      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: getAvatarGradient(contact.name) }}
                      >
                        {getInitials(contact.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{contact.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">{holiday.emoji} {holiday.name}</p>
                      </div>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: `${holiday.color}22`, color: holiday.color }}
                      >
                        {daysUntil === 0
                          ? t('reminders_today')
                          : daysUntil === 1
                            ? t('reminders_tomorrow')
                            : t('reminders_inDays', { n: daysUntil })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Fixed save bar */}
      <div
        className="fixed bottom-16 left-0 right-0 z-20 px-4 py-3"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, var(--color-background) 30%)',
          maxWidth: '480px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <button
          onClick={handleSave}
          className="w-full h-12 rounded-[var(--border-radius)] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99]"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
        >
          {saved ? <><Check size={15} /> {t('reminders_saved')}</> : t('save')}
        </button>
      </div>
    </div>
  )
}
