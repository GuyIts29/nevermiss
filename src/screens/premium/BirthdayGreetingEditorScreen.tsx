import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Wand2, Copy, Check, RefreshCw } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { PageHeader } from '@/components/Navigation'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { generateBirthdayGreeting } from '@/services/greetingService'
import { copyToClipboard } from '@/services/communicationService'
import type { GreetingTone, Language } from '@/types'
import { getInitials, getAvatarGradient } from '@/utils/avatarUtils'

interface TierOption {
  value: GreetingTone
  label: string
  emoji: string
  desc: string
}

const BIRTHDAY_TIERS: TierOption[] = [
  { value: 'friendly', label: 'Heartfelt', emoji: '💝', desc: 'Warm & personal' },
  { value: 'internal', label: 'Celebratory', emoji: '🎉', desc: 'Fun & festive' },
  { value: 'vip', label: 'Elegant', emoji: '🌹', desc: 'Formal & refined' },
]

export function BirthdayGreetingEditorScreen() {
  const { id } = useParams<{ id: string }>()
  const { contacts } = useApp()

  const contact = contacts.find(c => c.id === id)
  const t = useT()
  const [tone, setTone] = useState<GreetingTone>('friendly')
  const [language, setLanguage] = useState<Language>(contact?.language ?? 'english')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const generate = () => {
    if (!contact) return
    setMessage(generateBirthdayGreeting(contact, tone, language))
  }

  useEffect(() => {
    if (contact) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguage(contact.language)
      generate()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact])

  const handleCopy = async () => {
    await copyToClipboard(message)
    setCopied(true)
    setShowConfetti(true)
    setTimeout(() => setCopied(false), 2000)
    setTimeout(() => setShowConfetti(false), 800)
  }

  if (!contact) {
    return (
      <div className="screen-container">
        <PageHeader title={t('birthday_title')} back />
        <div className="page-content">
          <p className="text-[var(--color-text-muted)]">{t('contactDetail_notFound')}</p>
        </div>
      </div>
    )
  }

  const activeTier = BIRTHDAY_TIERS.find(t => t.value === tone) ?? BIRTHDAY_TIERS[0]

  return (
    <div className="screen-container">
      <PageHeader title={`🎂 ${contact.name}`} subtitle="Birthday Greeting" back />

      <div className="page-content space-y-4 pb-10">
        {/* Birthday themed header */}
        <div
          className="rounded-[var(--border-radius-lg)] p-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #EC4899 0%, #A855F7 60%, #6366F1 100%)' }}
        >
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0 shadow-lg"
              style={{ background: getAvatarGradient(contact.name) }}
            >
              {getInitials(contact.name)}
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-base leading-tight">{contact.name}</p>
              <p className="text-white/75 text-xs mt-0.5">Craft a perfect birthday message</p>
            </div>
            <span className="text-3xl animate-float">🎂</span>
          </div>
        </div>

        {/* Tier selector */}
        <div>
          <p className="form-label mb-2">Choose Style</p>
          <div className="flex gap-2">
            {BIRTHDAY_TIERS.map(tier => (
              <button
                key={tier.value}
                onClick={() => setTone(tier.value)}
                className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-[var(--border-radius)] border-2 transition-all"
                style={tone === tier.value ? {
                  borderColor: '#EC4899',
                  background: 'linear-gradient(135deg, #FCE7F3, #F3E8FF)',
                  boxShadow: '0 2px 12px rgba(236,72,153,0.25)',
                } : {
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-surface)',
                }}
              >
                <span className="text-xl">{tier.emoji}</span>
                <span
                  className="text-xs font-bold"
                  style={tone === tier.value ? { color: '#EC4899' } : { color: 'var(--color-text-primary)' }}
                >
                  {tier.label}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">{tier.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language selector */}
        <Card>
          <Select
            label={t('greeting_language')}
            value={language}
            onChange={e => setLanguage(e.target.value as Language)}
            options={[
              { value: 'english', label: '🇬🇧 English' },
              { value: 'hebrew', label: '🇮🇱 Hebrew' },
              { value: 'arabic', label: '🇸🇦 Arabic' },
              { value: 'russian', label: '🇷🇺 Russian' },
              { value: 'french', label: '🇫🇷 French' },
              { value: 'spanish', label: '🇪🇸 Spanish' },
            ]}
          />
        </Card>

        {/* Generate button */}
        <button
          onClick={generate}
          className="w-full h-12 rounded-[var(--border-radius)] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all"
          style={{ background: 'linear-gradient(135deg, #EC4899, #A855F7)' }}
        >
          <Wand2 size={16} />
          {t('greeting_generateBtn')} {activeTier.emoji}
        </button>

        {/* Message editor + preview */}
        {message && (
          <div className="space-y-3 animate-slide-up">
            {/* Live gift card preview */}
            <div>
              <p className="form-label mb-2">Preview</p>
              <div
                className="relative rounded-[var(--border-radius-lg)] p-4"
                style={{
                  background: 'linear-gradient(135deg, #FCE7F3 0%, #F3E8FF 100%)',
                  border: '1.5px solid #FBCFE8',
                }}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-lg">{activeTier.emoji}</span>
                  <span className="text-xs font-semibold text-[#EC4899]">Birthday Message — {activeTier.label}</span>
                </div>
                <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">{message}</p>
                {/* Chat bubble tail */}
                <div
                  className="absolute -bottom-2 left-5 w-4 h-2"
                  style={{
                    background: '#F3E8FF',
                    clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                  }}
                />
              </div>
            </div>

            {/* Editable textarea */}
            <Card>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[var(--color-text-primary)]">{t('greeting_yourMessage')}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={generate}
                    className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
                    title="Regenerate"
                  >
                    <RefreshCw size={13} className="text-[var(--color-text-muted)]" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-2)] transition-colors relative"
                    title="Copy"
                  >
                    {showConfetti && (
                      <span className="absolute -top-1 -right-1 text-base animate-confetti pointer-events-none">🎉</span>
                    )}
                    {copied
                      ? <Check size={13} className="text-green-500" />
                      : <Copy size={13} className="text-[var(--color-text-muted)]" />
                    }
                  </button>
                </div>
              </div>
              <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={7} className="text-sm" />
              <p className="text-right text-[10px] text-[var(--color-text-muted)] mt-1.5">
                {message.length} characters
              </p>
            </Card>
          </div>
        )}

        {message && contact.phone && (
          <WhatsAppButton
            phone={contact.phone}
            message={message}
            contactName={contact.name}
            fullWidth
            size="lg"
          />
        )}

        {message && (
          <button
            onClick={handleCopy}
            className="w-full h-11 rounded-[var(--border-radius)] font-semibold text-sm flex items-center justify-center gap-2 border-2 transition-all hover:opacity-90 active:scale-[0.99]"
            style={copied ? {
              borderColor: '#10B981',
              color: '#10B981',
              background: '#D1FAE5',
            } : {
              borderColor: '#EC4899',
              color: '#EC4899',
              background: 'transparent',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t('copied') : t('greeting_copy')}
          </button>
        )}
      </div>
    </div>
  )
}
