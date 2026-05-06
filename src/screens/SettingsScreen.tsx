import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { Palette, Crown, Info, Shield, FileText, Download, Trash2, ChevronRight, ChevronLeft, Sparkles, Globe, Check, Calendar, Bell, ArchiveRestore, User, LogOut, LogIn } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
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
import { clearAllData, exportBackupJSON, importBackupJSON } from '@/services/storageService'
import { requestPermission, notificationPermission } from '@/services/notificationService'
import { exportContactsToCSV } from '@/services/exportService'
import { resetGuide } from '@/utils/featureGuideUtils'

export function SettingsScreen() {
  const navigate = useNavigate()
  const { isPremium, showPremiumUI, deactivatePremium, premiumExpiresAt, settings, saveSettings, contacts, isDemoMode, clearDemo } = useApp()
  const [exportDone, setExportDone] = useState(false)
  const [backupDone, setBackupDone] = useState(false)
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const restoreInputRef = useRef<HTMLInputElement>(null)
  const { theme, themeId, setTheme } = useTheme()
  const { lang, setLang } = useLang()
  const t = useT()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [cleared, setCleared] = useState(false)
  const [notifBlocked, setNotifBlocked] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const { user, isAuthenticated, signOut } = useAuth()

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
  }

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
              {/* Active indicator: physical `left`/`width` in inline styles — calc() with spaces must be
                  inline to avoid Tailwind arbitrary-value whitespace stripping (which generates invalid CSS) */}
              <div
                className="absolute top-1 bottom-1 transition-all duration-300 shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  left: lang === 'en' ? '4px' : 'calc(50%)',
                  width: 'calc(50% - 4px)',
                  borderRadius: 'calc(var(--border-radius) - 2px)',
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
                  className={`absolute top-0.5 ${lang === 'he' ? 'right-0.5' : 'left-0.5'} w-5 h-5 rounded-full bg-white shadow transition-transform`}
                  style={{ transform: settings.notificationsEnabled ? `translateX(${lang === 'he' ? '-20px' : '20px'})` : 'translateX(0)' }}
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

        {/* Premium — hidden when showPremiumUI is false (TEMP_PREMIUM_UNLOCK active) */}
        {showPremiumUI && (
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
                    {t('upgrade')} — <span dir="ltr">{APP_CONFIG.pricing.monthly}{t('upgrade_month')}</span>
                  </Button>
                </div>
              )}
            </Card>
          </section>
        )}

        {/* Premium features nav */}
        {isPremium && (
          <section>
            {showPremiumUI && <h3 className="section-title mb-2">{t('settings_premiumFeatures')}</h3>}
            <Card noPadding>
              {[
                { label: t('settings_importContacts'), icon: Download, to: '/import' },
                { label: t('settings_birthdayCenter'), icon: showPremiumUI ? Crown : Sparkles, to: '/birthdays' },
                { label: t('reminders_title'), icon: Bell, to: '/reminders' },
              ].map(({ label, icon: Icon, to }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-[var(--color-surface-2)] transition-colors border-b border-[var(--color-border)] last:border-0"
                >
                  <Icon size={16} className="text-[var(--color-primary)]" />
                  <span className="flex-1 text-sm text-[var(--color-text-primary)] text-start">{label}</span>
                  {lang === 'he' ? <ChevronLeft size={14} className="text-[var(--color-text-muted)]" /> : <ChevronRight size={14} className="text-[var(--color-text-muted)]" />}
                </button>
              ))}
              <button
                onClick={() => {
                  exportContactsToCSV(contacts)
                  setExportDone(true)
                  setTimeout(() => setExportDone(false), 2500)
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-[var(--color-surface-2)] transition-colors border-b border-[var(--color-border)]"
              >
                <FileText size={16} className="text-[var(--color-primary)]" />
                <span className="flex-1 text-sm text-[var(--color-text-primary)] text-start">
                  {exportDone ? t('settings_exportSuccess') : t('settings_exportContacts')}
                </span>
                {exportDone
                  ? <Check size={14} className="text-green-500" />
                  : lang === 'he' ? <ChevronLeft size={14} className="text-[var(--color-text-muted)]" /> : <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
                }
              </button>
              <p className="px-3 py-1.5 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                {t('settings_exportGroupWarning')}
              </p>
              <button
                onClick={() => {
                  exportBackupJSON()
                  setBackupDone(true)
                  setTimeout(() => setBackupDone(false), 2500)
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-[var(--color-surface-2)] transition-colors border-b border-[var(--color-border)]"
              >
                <Download size={16} className="text-[var(--color-primary)]" />
                <span className="flex-1 text-sm text-[var(--color-text-primary)] text-start">
                  {backupDone ? t('settings_backupSuccess') : t('settings_backupData')}
                </span>
                {backupDone
                  ? <Check size={14} className="text-green-500" />
                  : lang === 'he' ? <ChevronLeft size={14} className="text-[var(--color-text-muted)]" /> : <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
                }
              </button>
              <input
                ref={restoreInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={async e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const result = await importBackupJSON(file)
                  if (result.ok) {
                    setRestoreStatus('success')
                    setTimeout(() => window.location.reload(), 1200)
                  } else {
                    setRestoreStatus('error')
                    setTimeout(() => setRestoreStatus('idle'), 3000)
                  }
                  e.target.value = ''
                }}
              />
              <button
                onClick={() => restoreInputRef.current?.click()}
                className="w-full flex items-center gap-3 p-3 hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <ArchiveRestore size={16} className={restoreStatus === 'error' ? 'text-red-500' : 'text-[var(--color-primary)]'} />
                <span className="flex-1 text-sm text-[var(--color-text-primary)] text-start">
                  {restoreStatus === 'success'
                    ? t('settings_restoreSuccess')
                    : restoreStatus === 'error'
                    ? t('settings_restoreError')
                    : t('settings_restoreData')}
                </span>
                {restoreStatus === 'success'
                  ? <Check size={14} className="text-green-500" />
                  : restoreStatus === 'error'
                  ? <span className="text-xs text-red-500">✕</span>
                  : lang === 'he' ? <ChevronLeft size={14} className="text-[var(--color-text-muted)]" /> : <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
                }
              </button>
            </Card>
          </section>
        )}

        {/* Demo mode exit */}
        {isDemoMode && (
          <section>
            <div
              className="rounded-[var(--border-radius-lg)] p-4 border border-purple-200"
              style={{ backgroundColor: '#F5F3FF' }}
            >
              <p className="text-xs font-semibold text-purple-700 mb-2">{t('demo_banner')}</p>
              <Button
                variant="outline"
                size="sm"
                icon={<Trash2 size={13} />}
                onClick={clearDemo}
              >
                {t('demo_clear')}
              </Button>
            </div>
          </section>
        )}

        {/* Account section */}
        <section>
          <h3 className="section-title mb-2 flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
            >
              <User size={10} color="white" />
            </span>
            {t('settings_account')}
          </h3>
          <Card>
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--color-text-muted)]">{t('settings_signedIn')}</p>
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate mt-0.5" dir="ltr">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={() => void handleSignOut()}
                  disabled={signingOut}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-opacity active:opacity-70 disabled:opacity-40"
                  style={{ borderColor: theme.primary, color: theme.primary }}
                >
                  <LogOut size={13} />
                  {t('settings_signOut')}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-[var(--color-text-muted)]">{t('settings_notSignedIn')}</p>
                <button
                  onClick={() => navigate('/landing')}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-opacity active:opacity-70"
                  style={{ borderColor: theme.primary, color: theme.primary }}
                >
                  <LogIn size={13} />
                  {t('settings_signIn')}
                </button>
              </div>
            )}
          </Card>
        </section>

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
            <button
              onClick={() => { resetGuide(); navigate('/dashboard') }}
              className="w-full flex items-center gap-3 p-3 hover:bg-[var(--color-surface-2)] transition-colors border-b border-[var(--color-border)]"
            >
              <Sparkles size={16} className="text-[var(--color-text-muted)]" />
              <span className="flex-1 text-sm text-[var(--color-text-primary)] text-start">{t('guide_viewGuide')}</span>
              {lang === 'he' ? <ChevronLeft size={14} className="text-[var(--color-text-muted)]" /> : <ChevronRight size={14} className="text-[var(--color-text-muted)]" />}
            </button>
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
                <span className="flex-1 text-sm text-[var(--color-text-primary)] text-start">{label}</span>
                {lang === 'he' ? <ChevronLeft size={14} className="text-[var(--color-text-muted)]" /> : <ChevronRight size={14} className="text-[var(--color-text-muted)]" />}
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

        {/* Danger zone — dev only, never shown in production */}
        {import.meta.env.DEV && (
          <section>
            <div
              className="rounded-[var(--border-radius-lg)] p-4 border border-red-200"
              style={{ backgroundColor: '#FFF1F2' }}
            >
              <h3 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1.5">
                <span className="w-3 h-full border-s-2 border-red-500 rounded-full" />
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
        )}
      </div>

      {import.meta.env.DEV && (
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
      )}
    </div>
  )
}
