import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Wand2, Copy, Check, RefreshCw, Save, ChevronDown, Pen, Send, Sparkles, Crown } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { PageHeader } from '@/components/Navigation'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { MediaAttachmentPicker } from '@/components/MediaAttachmentPicker'
import { ChannelPicker } from '@/components/ChannelPicker'
import { generateGreeting } from '@/services/greetingService'
import { getAISuggestions } from '@/services/aiSuggestionsService'
import { copyToClipboard, CHANNEL_ICONS } from '@/services/communicationService'
import { getHolidayById } from '@/data/holidays'
import { generateId, getLastUsedChannel } from '@/services/storageService'
import type { GreetingTone, Language, MediaAttachment } from '@/types'

interface Tier {
  value: GreetingTone
  emoji: string
  labelKey: 'greeting_tier_casual' | 'greeting_tier_professional' | 'greeting_tier_vip'
  descKey: 'greeting_tier_casual_desc' | 'greeting_tier_professional_desc' | 'greeting_tier_vip_desc'
  color: string
  premium?: boolean
}

const TIERS: Tier[] = [
  {
    value: 'friendly',
    emoji: '😊',
    labelKey: 'greeting_tier_casual',
    descKey: 'greeting_tier_casual_desc',
    color: '#10B981',
  },
  {
    value: 'business',
    emoji: '💼',
    labelKey: 'greeting_tier_professional',
    descKey: 'greeting_tier_professional_desc',
    color: '#3B82F6',
  },
  {
    value: 'vip',
    emoji: '👑',
    labelKey: 'greeting_tier_vip',
    descKey: 'greeting_tier_vip_desc',
    color: '#F59E0B',
    premium: true,
  },
]

function SendButton({
  contactId,
  onClick,
  theme,
  t,
}: {
  contactId: string
  onClick: () => void
  theme: { primary: string; secondary: string }
  t: (key: import('@/i18n').TranslationKey) => string
}) {
  const lastChannel = getLastUsedChannel(contactId)
  const icon = lastChannel ? CHANNEL_ICONS[lastChannel] : null
  const label = lastChannel
    ? `${icon} ${lastChannel === 'whatsapp' ? 'WhatsApp' : lastChannel === 'sms' ? 'SMS' : lastChannel === 'email' ? 'Email' : lastChannel === 'copy' ? t('channel_copy') : t('channel_share')}`
    : t('channel_picker_title')

  return (
    <button
      onClick={onClick}
      className="w-full h-12 rounded-[var(--border-radius)] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-[0.99] transition-all"
      style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
    >
      <Send size={15} />
      {label}
    </button>
  )
}

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
  const navigate = useNavigate()
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
  const [mediaAttachment, setMediaAttachment] = useState<MediaAttachment | null>(null)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [showChannelPicker, setShowChannelPicker] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [aiGenerating, setAiGenerating] = useState(false)

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
    setMediaAttachment(null)
    setSaved(false)
    setCopied(false)
  }

  const handleGetSuggestions = () => {
    if (!selectedContact) return
    setAiGenerating(true)
    setShowAISuggestions(false)
    setTimeout(() => {
      const suggestions = getAISuggestions({
        contactName: selectedContact.name,
        holiday: selectedHoliday,
        tone,
        language,
      })
      setAiSuggestions(suggestions)
      setAiGenerating(false)
      setShowAISuggestions(true)
    }, 400)
  }

  const handleUseSuggestion = (text: string) => {
    setMessage(text)
    setShowAISuggestions(false)
    setSaved(false)
    setCopied(false)
  }

  useEffect(() => {
    if (selectedContact) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
          <p className="section-title mb-2">{t('greeting_tier')}</p>
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
                    {t(tier.labelKey)}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)] text-center leading-tight">
                    {t(tier.descKey)}
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
            aria-expanded={showAdvanced}
          >
            <ChevronDown
              size={14}
              aria-hidden="true"
              style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
            {t('greeting_advanced_tone')}
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

        {/* AI Suggestions button */}
        {!isPremium ? (
          <button
            onClick={() => navigate('/upgrade')}
            className="w-full h-11 rounded-[var(--border-radius)] flex items-center justify-center gap-2 text-sm font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <Sparkles size={14} className="text-amber-400" aria-hidden="true" />
            {t('ai_suggestions_btn')}
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ml-0.5"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
            >
              <Crown size={8} className="inline mr-0.5" aria-hidden="true" />PRO
            </span>
          </button>
        ) : (
          <button
            onClick={handleGetSuggestions}
            disabled={!selectedContactId || aiGenerating}
            className="w-full h-11 rounded-[var(--border-radius)] flex items-center justify-center gap-2 text-sm font-semibold border-2 disabled:opacity-50 transition-all hover:opacity-90"
            style={{ borderColor: '#8B5CF6', background: 'linear-gradient(135deg, #8B5CF620, #6366F110)', color: '#7C3AED' }}
          >
            <Sparkles size={14} aria-hidden="true" />
            {aiGenerating ? t('ai_suggestions_generating') : t('ai_suggestions_btn')}
          </button>
        )}

        {/* AI Suggestions panel */}
        {showAISuggestions && aiSuggestions.length > 0 && (
          <div className="rounded-[var(--border-radius-lg)] overflow-hidden animate-slide-up border-2" style={{ borderColor: '#8B5CF640' }}>
            <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #8B5CF618, #6366F108)' }}>
              <Sparkles size={13} style={{ color: '#8B5CF6' }} aria-hidden="true" />
              <p className="text-xs font-bold" style={{ color: '#7C3AED' }}>{t('ai_suggestions_title')}</p>
              <p className="text-xs text-[var(--color-text-muted)] ml-1">{t('ai_suggestions_subtitle')}</p>
            </div>
            <div className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
              {aiSuggestions.map((suggestion, i) => (
                <div key={i} className="p-3 space-y-2">
                  <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                    {t('ai_suggestions_option', { n: String(i + 1) })}
                  </p>
                  <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">
                    {suggestion}
                  </p>
                  <button
                    onClick={() => handleUseSuggestion(suggestion)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}
                  >
                    {t('ai_suggestions_use')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
                    {t(activeTier.labelKey)} {t('greeting_greeting')}
                  </span>
                  {selectedContact && (
                    <span className="text-xs text-[var(--color-text-muted)]">
                      · {t('greeting_for')} {selectedContact.name.split(' ')[0]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={generate}
                    className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
                    aria-label={t('greeting_regenerate')}
                  >
                    <RefreshCw size={13} className="text-[var(--color-text-muted)]" aria-hidden="true" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
                    aria-label={t('greeting_copy')}
                  >
                    {copied
                      ? <Check size={13} className="text-green-500" aria-hidden="true" />
                      : <Copy size={13} className="text-[var(--color-text-muted)]" aria-hidden="true" />
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
                    aria-expanded={showSignature}
                  >
                    <Pen size={11} aria-hidden="true" />
                    {showSignature ? t('greeting_hide_signature') : t('greeting_add_signature')}
                  </button>
                  <CharCount count={fullMessage.length} />
                </div>

                {showSignature && (
                  <div className="mt-2 border-t border-[var(--color-border)] pt-2 animate-slide-up">
                    <input
                      className="form-input text-sm"
                      placeholder={t('greeting_signature_placeholder')}
                      value={signature}
                      onChange={e => setSignature(e.target.value)}
                    />
                    {signature && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-1 italic">
                        {t('greeting_signature_append', { sig: signature })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Media Attachment */}
            <div className="space-y-2">
              <MediaAttachmentPicker
                value={mediaAttachment}
                onChange={setMediaAttachment}
                isPremium={isPremium}
              />
            </div>

            {/* Live preview */}
            <div>
              <p className="section-title mb-2">{t('greeting_live_preview')}</p>
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
              {selectedContact && (
                <>
                  <SendButton
                    contactId={selectedContact.id}
                    onClick={() => setShowChannelPicker(true)}
                    theme={theme}
                    t={t}
                  />
                  {showChannelPicker && (
                    <ChannelPicker
                      contact={selectedContact}
                      message={fullMessage}
                      media={mediaAttachment}
                      onClose={() => setShowChannelPicker(false)}
                    />
                  )}
                </>
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
