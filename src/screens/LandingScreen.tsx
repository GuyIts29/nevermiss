import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useT, useLang } from '@/context/LanguageContext'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { type TranslationKey } from '@/i18n'
import { setDontShowLanding, isOnboardingDone, markOnboardingDone } from '@/services/storageService'
import { isProfileSetup } from '@/services/userProfileService'

import imgRomantic from '@/assets/landing/Romantic.webp'
import imgFamily   from '@/assets/landing/Family.webp'
import imgFriends  from '@/assets/landing/Friends.webp'
import imgWork     from '@/assets/landing/work.webp'

interface Scene {
  key: string
  src: string
  labelKey: TranslationKey
  captionKey: TranslationKey
}

const SCENES: Scene[] = [
  { key: 'romantic', src: imgRomantic, labelKey: 'landing_scene_romantic', captionKey: 'landing_caption_romantic' },
  { key: 'family',   src: imgFamily,   labelKey: 'landing_scene_family',   captionKey: 'landing_caption_family'   },
  { key: 'friends',  src: imgFriends,  labelKey: 'landing_scene_friends',  captionKey: 'landing_caption_friends'  },
  { key: 'work',     src: imgWork,     labelKey: 'landing_scene_work',     captionKey: 'landing_caption_work'     },
]

type LoginStep = 'idle' | 'input' | 'sending' | 'sent' | 'error'

function postLandingDestination(): string {
  if (!isOnboardingDone()) return '/onboarding'
  if (!isProfileSetup()) return '/setup'
  return '/dashboard'
}

export function LandingScreen() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const t = useT()
  const { lang } = useLang()
  const { enableDemo } = useApp()
  const { isAuthenticated, isLoading: authLoading, signIn } = useAuth()
  const isRtl = lang === 'he'

  const [loginStep, setLoginStep] = useState<LoginStep>('idle')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginError, setLoginError] = useState('')

  // Authenticated users should not sit on landing — send them into the app
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(postLandingDestination(), { replace: true })
    }
  }, [authLoading, isAuthenticated, navigate])

  const handleRegister = () => {
    setDontShowLanding()
    navigate(postLandingDestination())
  }

  const handleSendLink = async () => {
    const email = loginEmail.trim()
    if (!email) return
    setLoginStep('sending')
    const { error } = await signIn(email)
    if (error) {
      setLoginError(error)
      setLoginStep('error')
    } else {
      setLoginStep('sent')
    }
  }

  const handleLoginCancel = () => {
    setLoginStep('idle')
    setLoginEmail('')
    setLoginError('')
  }

  const handleDemo = () => {
    setDontShowLanding()
    markOnboardingDone()
    enableDemo()
    // enableDemo() triggers window.location.reload() internally
  }

  const handleDontShow = () => {
    setDontShowLanding()
    navigate(postLandingDestination())
  }

  const isSending = loginStep === 'sending'

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen overflow-y-auto flex flex-col"
      style={{ backgroundColor: 'var(--color-background)', maxWidth: 480, margin: '0 auto' }}
    >
      {/* Hero */}
      <div className="flex flex-col items-center pt-12 pb-5 px-6 text-center">
        <span
          className="text-sm font-bold tracking-widest uppercase mb-4"
          style={{ color: theme.primary, letterSpacing: '0.18em' }}
        >
          NeverMiss
        </span>
        <h1
          className="text-3xl font-bold leading-tight"
          style={{ color: 'var(--color-text)' }}
        >
          {t('landing_tagline')}
        </h1>
      </div>

      {/* Relationship image grid */}
      <div className="grid grid-cols-2 gap-2.5 px-4 mb-6">
        {SCENES.map((scene, i) => (
          <div
            key={scene.key}
            className="relative rounded-2xl overflow-hidden"
            style={{ aspectRatio: '4 / 3' }}
          >
            <img
              src={scene.src}
              alt={t(scene.labelKey)}
              loading={i === 0 ? 'eager' : 'lazy'}
              className="w-full h-full object-cover"
              style={{ display: 'block' }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)',
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
              <p className="text-white text-xs font-semibold leading-tight">
                {t(scene.labelKey)}
              </p>
              <p className="text-white/75 text-xs leading-snug mt-0.5">
                {t(scene.captionKey)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Value subtitle */}
      <p
        className="text-center px-8 mb-8 text-sm leading-relaxed"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {t('landing_subtitle')}
      </p>

      {/* CTA buttons */}
      <div className="px-6 flex flex-col gap-3 mb-2">
        {/* Register — primary */}
        <button
          onClick={handleRegister}
          className="w-full h-12 rounded-xl font-semibold text-white text-base transition-opacity active:opacity-80"
          style={{ backgroundColor: theme.primary }}
        >
          {t('landing_cta_register')}
        </button>

        {/* Login — magic link flow */}
        {loginStep === 'idle' && (
          <button
            onClick={() => setLoginStep('input')}
            className="w-full h-12 rounded-xl font-semibold text-base border-2 transition-opacity active:opacity-70"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            {t('landing_cta_login')}
          </button>
        )}

        {(loginStep === 'input' || loginStep === 'sending' || loginStep === 'error') && (
          <div className="flex flex-col gap-2">
            <input
              type="email"
              dir="ltr"
              autoFocus
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleSendLink() }}
              placeholder={t('landing_login_email_placeholder')}
              disabled={isSending}
              className="w-full h-12 px-4 rounded-xl border text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] focus:outline-none disabled:opacity-50"
              style={{ textAlign: 'left' }}
            />
            {loginStep === 'error' && (
              <p className="text-xs text-red-500 px-1">{loginError || t('landing_login_error')}</p>
            )}
            <button
              onClick={() => void handleSendLink()}
              disabled={isSending || !loginEmail.trim()}
              className="w-full h-12 rounded-xl font-semibold text-white text-base transition-opacity active:opacity-80 disabled:opacity-50"
              style={{ backgroundColor: theme.primary }}
            >
              {isSending ? t('landing_login_sending') : t('landing_login_send')}
            </button>
            <button
              onClick={handleLoginCancel}
              className="w-full py-2 text-sm transition-opacity active:opacity-60"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {t('landing_login_cancel')}
            </button>
          </div>
        )}

        {loginStep === 'sent' && (
          <div
            className="w-full rounded-xl p-4 text-center text-sm font-medium border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: theme.primary,
              color: 'var(--color-text-primary)',
            }}
          >
            {t('landing_login_sent')}
          </div>
        )}

        {/* Demo — ghost */}
        <button
          onClick={handleDemo}
          className="w-full h-12 rounded-xl font-semibold text-base transition-opacity active:opacity-70"
          style={{ color: theme.primary }}
        >
          {t('landing_cta_demo')}
        </button>
      </div>

      {/* Don't show again */}
      <div className="flex justify-center pt-4 pb-10">
        <button
          onClick={handleDontShow}
          className="text-xs underline underline-offset-2 transition-opacity active:opacity-60"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {t('landing_dont_show')}
        </button>
      </div>
    </div>
  )
}
