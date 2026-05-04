import { useState } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { useT, useLang } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { markGuideSeen } from '@/utils/featureGuideUtils'

interface FeatureGuideProps {
  onDone: () => void
}

export function FeatureGuide({ onDone }: FeatureGuideProps) {
  const t = useT()
  const { lang } = useLang()
  const { theme } = useTheme()
  const [slide, setSlide] = useState(0)
  const isRTL = lang === 'he'

  const slides = [
    { emoji: '💛', title: t('guide_slide1_title'), body: t('guide_slide1_body') },
    { emoji: '👥', title: t('guide_slide2_title'), body: t('guide_slide2_body') },
    { emoji: '✉️', title: t('guide_slide3_title'), body: t('guide_slide3_body') },
  ]

  const isLast = slide === slides.length - 1

  const handleDone = () => {
    markGuideSeen()
    onDone()
  }

  const handleNext = () => {
    if (isLast) { handleDone(); return }
    setSlide(s => s + 1)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-hidden animate-slide-up"
        style={{ background: 'var(--color-surface)', boxShadow: '0 -8px 32px rgba(0,0,0,0.18)' }}
      >
        {/* Skip */}
        <div className="flex justify-end px-4 pt-3">
          <button
            type="button"
            onClick={handleDone}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
            aria-label={t('onboarding_skip')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Slide */}
        <div className="px-6 pb-4 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-float"
            style={{ background: `linear-gradient(135deg, ${theme.primary}33, ${theme.secondary}55)` }}
          >
            {slides[slide].emoji}
          </div>
          <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] mb-2">
            {slides[slide].title}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xs mx-auto leading-relaxed">
            {slides[slide].body}
          </p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {slides.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === slide ? '20px' : '6px',
                background: i === slide ? theme.primary : 'var(--color-border)',
              }}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-2 px-4 pb-6">
          {slide > 0 && (
            <button
              type="button"
              onClick={() => setSlide(s => s - 1)}
              className="w-12 h-12 rounded-[var(--border-radius)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors shrink-0"
              aria-label={t('go_back')}
            >
              {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 h-12 rounded-[var(--border-radius)] text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
          >
            {isLast ? t('guide_done') : t('guide_next')}
          </button>
        </div>
      </div>
    </>
  )
}
