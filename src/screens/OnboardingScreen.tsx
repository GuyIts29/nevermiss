import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Heart, PartyPopper, Building2, Sparkles } from 'lucide-react'
import { markOnboardingDone } from '@/services/storageService'
import { useTheme } from '@/context/ThemeContext'
import { useT } from '@/context/LanguageContext'
import { useApp } from '@/context/AppContext'
import { APP_CONFIG } from '@/config/appConfig'

const SLIDE_ICONS = [Heart, PartyPopper, Building2, Sparkles]
const SLIDE_EMOJIS = ['💌', '🎉', '👥', '✨']
const SLIDE_COLORS = ['#E11D48', '#2563EB', '#16A34A', '#7C3AED']
const SLIDE_COLORS_SECONDARY = ['#F43F5E', '#3B82F6', '#22C55E', '#A855F7']

export function OnboardingScreen() {
  const [slide, setSlide] = useState(0)
  const navigate = useNavigate()
  const { theme } = useTheme()
  const t = useT()
  const { enableDemo } = useApp()
  const isLast = slide === 3

  const SLIDE_KEYS = [
    { title: 'onboarding_slide1_title', desc: 'onboarding_slide1_desc' },
    { title: 'onboarding_slide2_title', desc: 'onboarding_slide2_desc' },
    { title: 'onboarding_slide3_title', desc: 'onboarding_slide3_desc' },
    { title: 'onboarding_slide4_title', desc: 'onboarding_slide4_desc' },
  ] as const

  const handleNext = () => {
    if (isLast) {
      markOnboardingDone()
      navigate('/dashboard', { replace: true })
    } else {
      setSlide(s => s + 1)
    }
  }

  const handleSkip = () => {
    markOnboardingDone()
    navigate('/dashboard', { replace: true })
  }

  const color = SLIDE_COLORS[slide]
  const colorSecondary = SLIDE_COLORS_SECONDARY[slide]
  const Icon = SLIDE_ICONS[slide]

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: `${color}11` }}
    >
      {/* Skip */}
      <div className="flex justify-end p-4">
        <button
          onClick={handleSkip}
          className="text-sm font-medium text-[var(--color-text-muted)] px-3 py-1 rounded-full hover:bg-[var(--color-surface)] transition-colors"
        >
          {t('onboarding_skip')}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-fade-in stagger-1" key={slide}>
        {/* Large gradient circle with emoji */}
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center text-6xl mb-6 shadow-xl animate-float"
          style={{ background: `linear-gradient(135deg, ${color}33, ${colorSecondary}66)` }}
        >
          {SLIDE_EMOJIS[slide]}
        </div>

        {/* Icon badge */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-md"
          style={{ background: `linear-gradient(135deg, ${color}, ${colorSecondary})` }}
        >
          <Icon size={22} color="white" />
        </div>

        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3 leading-tight animate-slide-up stagger-2">
          {t(SLIDE_KEYS[slide].title)}
        </h2>
        <p className="text-[var(--color-text-secondary)] text-base leading-relaxed max-w-sm animate-slide-up stagger-3">
          {t(SLIDE_KEYS[slide].desc)}
        </p>
      </div>

      {/* Bottom */}
      <div className="p-6 space-y-4">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 items-center">
          {[0, 1, 2, 3].map(i => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === slide ? 28 : 8,
                height: 8,
                background: i === slide
                  ? `linear-gradient(90deg, ${color}, ${colorSecondary})`
                  : `${color}44`,
                transform: i === slide ? 'scaleY(1.2)' : 'scaleY(1)',
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="btn w-full h-14 px-8 text-lg gap-2.5 text-white rounded-[var(--border-radius)] font-semibold shadow-lg transition-all hover:opacity-90 active:scale-95 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
        >
          {isLast ? t('onboarding_getStarted') : t('continue')}
          <ChevronRight size={18} />
        </button>

        {isLast && (
          <>
            <button
              onClick={() => {
                markOnboardingDone()
                enableDemo()
              }}
              className="w-full h-11 text-sm font-semibold rounded-[var(--border-radius)] border-2 transition-all hover:opacity-80 active:scale-95"
              style={{ borderColor: theme.primary, color: theme.primary }}
            >
              {t('demo_loadData')}
            </button>
            <p className="text-center text-xs text-[var(--color-text-muted)]">
              {t('onboarding_privacy', { app: APP_CONFIG.appName, version: APP_CONFIG.appVersion })}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
