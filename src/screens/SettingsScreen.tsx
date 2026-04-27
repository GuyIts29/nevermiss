import { useNavigate } from 'react-router-dom'
import { Palette, Crown, Info, Shield, FileText, Download, Trash2, ChevronRight, Sparkles, Globe, Check, Calendar, Bell } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useTheme } from '@/context/ThemeContext'
import { useLang, useT } from '@/context/LanguageContext'
import { PageHeader } from '@/components/Navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { THEME_LIST } from '@/data/themes'
import type { TranslationKey } from '@/i18n'
import { APP_CONFIG } from '@/config/appConfig'
import { useState } from 'react'
import { clearAllData } from '@/services/storageService'
import { requestPermission, notificationPermission } from '@/services/notificationService'

export function SettingsScreen() {
  const navigate = useNavigate()
  const { isPremium, deactivatePremium, premiumExpiresAt, settings, saveSettings } = useApp()
  const { theme, themeId, setTheme } = useTheme()
  const { lang, setLang } = useLang()
  const t = useT()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [cleared, setCleared] = useState(false)
  const [notifBlocked, setNotifBlocked] = useState(false)

  const handleNotifToggle = async () => {
    if (settings.notificationsEnabled) {
      saveSettings({ notificationsEnabled: false })
      return
    }
    const perm = notificationPermission()
    if (perm === 'denied') { setNotifBlocked(true); return }
    const granted = await requestPermission()
    if (granted) saveSettings({ notificationsEnabled: true })
    else setNotifBlocked(true)
  }

  const handleClearData = () => {
    clearAllData()
    setCleared(true)
    setTimeout(() => window.location.reload(), 1000)
  }

  return (
    <div className="screen-container">
      <PageHeader title={t('settings_title')} />

      <div className="page-content space-y-5 pb-20">
        {/* Language section */}
        <section>
          <h3 className="section-title mb-2 flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
            >
              <Globe size={10} color="white" />
            </span>
            {t('settings_uiLanguage')}
          </h3>
          <Card>
            {/* Pill toggle — always LTR so button order never flips */}
            <div dir="ltr" className="flex gap-0 p-1 bg-[var(--color-surface-2)] rounded-[var(--border-radius)] relative">
              {/* Active indicator: physical `left` so transition is clean regardless of document dir */}
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[calc(var(--border-radius)-2px)] transition-all duration-300 shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  left: lang === 'en' ? '4px' : 'calc(50%)',
                }}
              />
              <button
                onClick={() => setLang('en')}
                className="relative flex-1 py-2.5 rounded-[calc(var(--border-radius)-2px)] text-sm font-semibold transition-colors z-10"
                style={{ color: lang === 'en' ? 'white' : 'var(--color-text-secondary)' }}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => setLang('he')}
                className="relative flex-1 py-2.5 rounded-[calc(var(--border-radius)-2px)] text-sm font-semibold transition-colors z-10"
                style={{ color: lang === 'he' ? 'white' : 'var(--color-text-secondary)' }}
              >
                🇮🇱 עברית
              </button>
            </div>
          </Card>
        </section>

        {/* Notifications section */}
        <section>
          <h3 className="section-title mb-2 flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
            >
              <Bell size={10} color="white" />
            </span>
            {t('notif_settings_title')}
          </h3>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{t('notif_settings_title')}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{t('notif_settings_desc')}</p>
              </div>
              <button
                onClick={handleNotifToggle}
                aria-label={t('notif_settings_title')}
                className="relative w-11 h-6 rounded-full transition-colors shrink-0"
                style={{ background: settings.notificationsEnabled ? theme.primary : 'var(--color-border)' }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: settings.notificationsEnabled ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </button>
            </div>
            {notifBlocked && (
              <p className="text-xs text-red-500 mt-2">{t('notif_blocked')}</p>
            )}
          </Card>
        </section>

        {/* Theme section */}
        <section>
          <h3 className="section-title mb-2 flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
            >
              <Palette size={10} color="white" />
            </span>
            {t('settings_appearance')}
          </h3>
          <Card>
            <p className="text-xs text-[var(--color-text-muted)] mb-3">{t('settings_chooseTheme')}</p>
            <div className="grid grid-cols-3 gap-3">
              {THEME_LIST.map(th => {
                const isActive = themeId === th.id
                return (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className="rounded-[var(--border-radius)] overflow-hidden transition-all"
                    style={{
                      outline: isActive ? `3px solid ${th.primary}` : '2px solid transparent',
                      outlineOffset: '2px',
                      boxShadow: isActive ? `0 0 12px ${th.primary}44` : undefined,
                    }}
                  >
                    <div
                      className="h-14 flex items-center justify-center relative"
                      style={{ background: `linear-gradient(135deg, ${th.primary}, ${th.secondary})` }}
                    >
                      {/* Color swatch circles */}
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded-full opacity-80" style={{ backgroundColor: th.primary }} />
                        <div className="w-4 h-4 rounded-full opacity-80" style={{ backgroundColor: th.secondary }} />
                        <div className="w-4 h-4 rounded-full opacity-80" style={{ backgroundColor: th.accent }} />
                      </div>
                      {isActive && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                          <Check size={11} style={{ color: th.primary }} />
                        </div>
                      )}
                    </div>
                    <div
                      className="p-1.5 text-center"
                      style={{ backgroundColor: th.surface, color: th.textPrimary }}
                    >
                      <p className="text-xs font-semibold truncate">{t(`theme_${th.id}` as TranslationKey)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            {!isPremium && (
              <button
                onClick={() => navigate('/upgrade')}
                className="mt-2 w-full text-xs text-center font-medium py-2 hover:underline"
                style={{ color: theme.primary }}
              >
                {t('settings_unlockCustomTheme')}
              </button>
            )}
          </Card>
        </section>

        {/* Premium */}
        <section>
          <h3 className="section-title mb-2 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500">
              <Crown size={10} color="white" />
            </span>
            {t('settings_premium')}
          </h3>
          <Card noPadding>
            {isPremium ? (
              <div>
                {/* Gold gradient banner */}
                <div
                  className="p-4 flex items-center gap-3 rounded-t-[var(--border-radius-lg)]"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}
                >
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Crown size={20} color="white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t('settings_premiumActive')}</p>
                    <p className="text-xs text-white/80">{t('settings_allUnlocked')}</p>
                  </div>
                </div>
                <div className="p-3">
                  {premiumExpiresAt && (
                    <div className="flex items-center gap-2 mt-2 px-1">
                      <Calendar size={13} className="text-[var(--color-text-muted)] shrink-0" />
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {t('coupon_active_until', {
                          date: new Date(premiumExpiresAt).toLocaleDateString(undefined, {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })
                        })}
                      </p>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={deactivatePremium}
                  >
                    {t('settings_restoreFree')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  icon={<Sparkles size={14} />}
                  onClick={() => navigate('/upgrade')}
                >
                  {t('upgrade')} — {APP_CONFIG.pricing.monthly}/mo
                </Button>
              </div>
            )}
          </Card>
        </section>

        {/* Premium features nav */}
        {isPremium && (
          <section>
            <h3 className="section-title mb-2">{t('settings_premiumFeatures')}</h3>
            <Card noPadding>
              {[
                { label: t('settings_importContacts'), icon: Download, to: '/import' },
                { label: t('settings_birthdayCenter'), icon: Crown, to: '/birthdays' },
              ].map(({ label, icon: Icon, to }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-[var(--color-surface-2)] transition-colors border-b border-[var(--color-border)] last:border-0"
                >
                  <Icon size={16} className="text-[var(--color-primary)]" />
                  <span className="flex-1 text-sm text-[var(--color-text-primary)] text-left">{label}</span>
                  <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
                </button>
              ))}
            </Card>
          </section>
        )}

        {/* App info */}
        <section>
          <h3 className="section-title mb-2 flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
            >
              <Info size={10} color="white" />
            </span>
            {t('settings_about')}
          </h3>
          <Card noPadding>
            {[
              { label: t('settings_whatsNew'), to: '/whats-new', icon: Sparkles },
              { label: t('settings_about'), to: '/about', icon: Info },
              { label: t('settings_privacy'), to: '/privacy', icon: Shield },
              { label: t('settings_terms'), to: '/terms', icon: FileText },
            ].map(({ label, to, icon: Icon }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="w-full flex items-center gap-3 p-3 hover:bg-[var(--color-surface-2)] transition-colors border-b border-[var(--color-border)] last:border-0"
              >
                <Icon size={16} className="text-[var(--color-text-muted)]" />
                <span className="flex-1 text-sm text-[var(--color-text-primary)] text-left">{label}</span>
                <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
              </button>
            ))}
          </Card>
        </section>

        {/* Version */}
        <div className="text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            {APP_CONFIG.appName} v{APP_CONFIG.appVersion} · Build {APP_CONFIG.buildNumber}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {t('settings_released', { date: APP_CONFIG.releaseDate })}
          </p>
        </div>

        {/* Danger zone */}
        <section>
          <div
            className="rounded-[var(--border-radius-lg)] p-4 border border-red-200"
            style={{ backgroundColor: '#FFF1F2' }}
          >
            <h3 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1.5">
              <span className="w-3 h-full border-l-2 border-red-500 rounded-full" />
              {t('settings_dangerZone')}
            </h3>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={13} />}
              onClick={() => setShowClearConfirm(true)}
            >
              {t('settings_clearData')}
            </Button>
          </div>
        </section>
      </div>

      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title={t('settings_clearData')}
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" fullWidth onClick={() => setShowClearConfirm(false)}>{t('cancel')}</Button>
            <Button variant="danger" size="sm" fullWidth onClick={handleClearData}>
              {cleared ? t('done') : t('settings_clearData')}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('settings_clearConfirm')}
        </p>
      </Modal>
    </div>
  )
}
