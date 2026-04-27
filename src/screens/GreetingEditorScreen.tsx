import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Wand2, Copy, Check, RefreshCw, Save, ChevronDown, Pen } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { PageHeader } from '@/components/Navigation'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { generateGreeting } from '@/services/greetingService'
import { copyToClipboard } from '@/services/communicationService'
import { getHolidayById } from '@/data/holidays'
import { generateId } from '@/services/storageService'
import type { GreetingTone, Language } from '@/types'

interface Tier {
  value: GreetingTone
  emoji: string
  label: string
  labelHe: string
  desc: string
  color: string
  premium?: boolean
}

const TIERS: Tier[] = [
  {
    value: 'friendly',
    emoji: '😊',
    label: 'Casual',
    labelHe: 'ידידותי',
    desc: 'Warm & personal',
    color: '#10B981',
  },
  {
    value: 'business',
    emoji: '💼',
    label: 'Professional',
    labelHe: 'מקצועי',
    desc: 'Polished & clear',
    color: '#3B82F6',
  },
  {
    value: 'vip',
    emoji: '👑',
    label: 'VIP',
    labelHe: 'VIP',
    desc: 'Elevated & bespoke',
    color: '#F59E0B',
    premium: true,
  },
]

function CharCount({ count, max = 500 }: { count: number; max?: number }) {
  const pct = count / max
  const color = pct > 0.9 ? '#EF4444' : pct > 0.75 ? '#F59E0B' : 'var(--color-text-muted)'
  return (
    <span className="text-xs font-medium tabular-nums" style={{ color }}>
      {count} / {max}
    </span>
  )
}

export function GreetingEditorScreen() {
  const [searchParams] = useSearchParams()
  const { contacts, holidays, saveDraft, isPremium } = useApp()
  const t = useT()
  const { theme } = useTheme()

  const contactId = searchParams.get('contactId')
  const holidayId = searchParams.get('holidayId')

  const contact = contactId ? contacts.find(c => c.id === contactId) : undefined

  const [selectedContactId, setSelectedContactId] = useState(contactId ?? '')
  const [selectedHolidayId, setSelectedHolidayId] = useState(holidayId ?? '')
  const [tone, setTone] = useState<GreetingTone>('friendly')
  const [language, setLanguage] = useState<Language>(contact?.language ?? 'english')
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [showSignature, setShowSignature] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [celebrating, setCelebrating] = useState(false)

  const selectedContact = contacts.find(c => c.id === selectedContactId)
  const selectedHoliday = getHolidayById(selectedHolidayId)

  const fullMessage = signature.trim()
    ? `${message}\n\n– ${signature.trim()}`
    : message

  const generate = () => {
    if (!selectedContact) return
    const text = generateGreeting({
      contact: selectedContact,
      holiday: selectedHoliday,
      tone,
      language,
    })
    setMessage(text)
    setSaved(false)
    setCopied(false)
  }

  useEffect(() => {
    if (selectedContact) {
      setLanguage(selectedContact.language)
      if (selectedContact.contactType === 'internal') setTone('internal')
      else if (selectedContact.importanceLevel === 'vip') setTone('vip')
      else if (
        selectedContact.relationshipType === 'client' ||
        selectedContact.relationshipType === 'business_partner'
      ) setTone('business')
      else setTone('friendly')
    }
  }, [selectedContact])

  useEffect(() => {
    if (selectedContact && !message) generate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContactId, selectedHolidayId])

  const handleCopy = async () => {
    await copyToClipboard(fullMessage)
    setCopied(true)
    setCelebrating(true)
    setTimeout(() => setCopied(false), 2500)
    setTimeout(() => setCelebrating(false), 700)
  }

  const handleSaveDraft = () => {
    if (!selectedContactId || !message) return
    saveDraft({
      id: generateId(),
      contactId: selectedContactId,
      holidayId: selectedHolidayId || undefined,
      message: fullMessage,
      language,
      tone,
      status: 'draft',
      createdAt: new Date().toISOString(),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const activeTier = TIERS.find(t => t.value === tone) ?? TIERS[0]
  const isHebrew = language === 'hebrew'

  return (
    <div className="screen-container">
      <PageHeader title={t('greeting_title')} back />

      <div className="page-content space-y-4 pb-28">

        {/* Contact & Occasion selectors */}
        <div
          className="rounded-[var(--border-radius-lg)] p-4 space-y-3"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}12, ${theme.secondary}08)`,
            border: `1px solid ${theme.primary}25`,
          }}
        >
          <h3 className="font-extrabold text-[var(--color-text-primary)] text-sm">
            {t('greeting_generate')}
          </h3>

          <Select
            label={t('greeting_contact')}
            value={selectedContactId}
            onChange={e => setSelectedContactId(e.target.value)}
            options={[
              { value: '', label: t('greeting_selectContact') },
              ...contacts.map(c => ({ value: c.id, label: c.name })),
            ]}
          />

          <Select
            label={t('greeting_occasion')}
            value={selectedHolidayId}
            onChange={e => setSelectedHolidayId(e.target.value)}
            options={[
              { value: '', label: t('greeting_noHoliday') },
              ...holidays.map(h => ({ value: h.id, label: `${h.emoji} ${h.name}` })),
            ]}
          />
        </div>

        {/* Tier selector */}
        <div>
          <p className="section-title mb-2">Greeting Tier</p>
          <div className="flex gap-2">
            {TIERS.map(tier => {
              const active = tone === tier.value
              const disabled = tier.premium && !isPremium
              return (
                <button
                  key={tier.value}
                  className="tier-card"
                  style={
                    active
                      ? {
                          borderColor: tier.color,
                          background: `linear-gradient(135deg, ${tier.color}18, ${tier.color}08)`,
                          boxShadow: `0 4px 14px ${tier.color}30`,
                        }
                      : {}
                  }
                  onClick={() => {
                    if (!disabled) setTone(tier.value)
                  }}
                >
                  <span className="text-2xl">{tier.emoji}</span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: active ? tier.color : 'var(--color-text-secondary)' }}
                  >
                    {isHebrew ? tier.labelHe : tier.label}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)] text-center leading-tight">
                    {tier.desc}
                  </span>
                  {tier.premium && !isPremium && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: '#fff' }}>
                      PRO
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Language + Advanced toggle */}
        <div className="space-y-2">
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

          <button
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium"
            onClick={() => setShowAdvanced(v => !v)}
          >
            <ChevronDown
              size={14}
              style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
            Advanced tone options
          </button>

          {showAdvanced && (
            <Select
              label={t('greeting_tone')}
              value={tone}
              onChange={e => setTone(e.target.value as GreetingTone)}
              options={[
                { value: 'friendly', label: t('greeting_tone_friendly') },
                { value: 'business', label: t('greeting_tone_business') },
                { value: 'formal', label: t('greeting_tone_formal') },
                { value: 'internal', label: t('greeting_tone_internal') },
                ...(isPremium ? [{ value: 'vip', label: t('greeting_tone_vip') }] : []),
              ]}
            />
          )}
        </div>

        {/* Generate button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={<Wand2 size={16} />}
          onClick={generate}
          disabled={!selectedContactId}
        >
          {t('greeting_generateBtn')}
        </Button>

        {/* Message editor */}
        {message && (
          <div className="animate-slide-up space-y-3">
            {/* Editor card */}
            <div
              className="rounded-[var(--border-radius-lg)] overflow-hidden"
              style={{ border: `1px solid ${activeTier.color}40`, boxShadow: `0 4px 16px ${activeTier.color}18` }}
            >
              {/* Editor header */}
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ background: `linear-gradient(135deg, ${activeTier.color}18, ${activeTier.color}08)` }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{activeTier.emoji}</span>
                  <span className="text-xs font-bold" style={{ color: activeTier.color }}>
                    {isHebrew ? activeTier.labelHe : activeTier.label} Greeting
                  </span>
                  {selectedContact && (
                    <span className="text-xs text-[var(--color-text-muted)]">
                      · for {selectedContact.name.split(' ')[0]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={generate}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
                    title={t('greeting_regenerate')}
                  >
                    <RefreshCw size={13} className="text-[var(--color-text-muted)]" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    {copied
                      ? <Check size={13} className="text-green-500" />
                      : <Copy size={13} className="text-[var(--color-text-muted)]" />
                    }
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <div className="bg-[var(--color-surface)] p-3">
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={7}
                  className="text-sm"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <button
                    className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] font-medium hover:text-[var(--color-primary)] transition-colors"
                    onClick={() => setShowSignature(v => !v)}
                  >
                    <Pen size={11} />
                    {showSignature ? 'Hide signature' : 'Add signature'}
                  </button>
                  <CharCount count={fullMessage.length} />
                </div>

                {showSignature && (
                  <div className="mt-2 border-t border-[var(--color-border)] pt-2 animate-slide-up">
                    <input
                      className="form-input text-sm"
                      placeholder="Your name or signature..."
                      value={signature}
                      onChange={e => setSignature(e.target.value)}
                    />
                    {signature && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-1 italic">
                        Will append: "– {signature}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Live preview */}
            <div>
              <p className="section-title mb-2">Live Preview</p>
              <div
                className="rounded-[var(--border-radius-lg)] p-3"
                style={{ background: `linear-gradient(135deg, ${theme.primary}10, ${theme.secondary}06)` }}
              >
                <div
                  className="message-preview"
                  style={{ direction: isHebrew ? 'rtl' : 'ltr' }}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed text-[var(--color-text-primary)]">
                    {fullMessage || message}
                  </p>
                </div>
                {selectedHoliday && (
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-2 text-center">
                    {selectedHoliday.emoji} {selectedHoliday.name}
                  </p>
                )}
              </div>
            </div>

            {/* Celebration indicator */}
            {celebrating && (
              <div className="text-center animate-confetti text-3xl pointer-events-none">
                🎉
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              {selectedContact?.phone && (
                <WhatsAppButton
                  phone={selectedContact.phone}
                  message={fullMessage}
                  contactName={selectedContact.name}
                  fullWidth
                  size="lg"
                />
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={copied ? 'success' : 'outline'}
                  size="md"
                  icon={copied ? <Check size={14} /> : <Copy size={14} />}
                  onClick={handleCopy}
                  className={copied ? 'animate-scale-in' : ''}
                >
                  {copied ? t('copied') : t('greeting_copy')}
                </Button>
                <Button
                  variant={saved ? 'success' : 'ghost'}
                  size="md"
                  icon={saved ? <Check size={14} /> : <Save size={14} />}
                  onClick={handleSaveDraft}
                  className={saved ? 'animate-scale-in' : ''}
                >
                  {saved ? t('saved') : t('greeting_saveDraft')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Holiday examples when no contact selected */}
        {selectedHoliday && !message && (
          <div
            className="rounded-[var(--border-radius-lg)] overflow-hidden animate-fade-in"
            style={{ border: `1px solid ${selectedHoliday.color}40` }}
          >
            <div
              className="px-4 py-3"
              style={{ background: `linear-gradient(135deg, ${selectedHoliday.color}dd, ${selectedHoliday.color}99)` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedHoliday.emoji}</span>
                <h3 className="font-bold text-white">{selectedHoliday.name}</h3>
              </div>
              <p className="text-xs text-white/80 mt-1">{selectedHoliday.greetingGuidance}</p>
            </div>
            <div className="p-3 bg-[var(--color-surface)] space-y-2">
              {selectedHoliday.greetings.english.map((g, i) => (
                <p
                  key={i}
                  className="text-sm text-[var(--color-text-secondary)] p-3 rounded-[var(--border-radius)] leading-relaxed"
                  style={{ background: `${selectedHoliday.color}0d`, borderLeft: `2px solid ${selectedHoliday.color}` }}
                >
                  {g}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
