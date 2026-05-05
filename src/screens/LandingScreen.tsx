import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useT, useLang } from '@/context/LanguageContext'
import { useApp } from '@/context/AppContext'
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
  const [showLoginNote, setShowLoginNote] = useState(false)
  const isRtl = lang === 'he'

  const handleRegister = () => {
    setDontShowLanding()
    navigate('/onboarding')
  }

  const handleLoginClick = () => {
    setShowLoginNote(true)
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
            {/* Gradient scrim for text legibility */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)',
              }}
            />
            {/* Caption */}
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

        {/* Login — coming soon */}
        <button
          onClick={handleLoginClick}
          className="w-full h-12 rounded-xl font-semibold text-base border-2 transition-opacity"
          style={{
            borderColor: theme.primary,
            color: theme.primary,
            opacity: 0.45,
            cursor: 'default',
          }}
        >
          {t('landing_cta_login')}
        </button>
        {showLoginNote && (
          <p
            className="text-center text-xs leading-relaxed -mt-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t('landing_login_soon')}
          </p>
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
