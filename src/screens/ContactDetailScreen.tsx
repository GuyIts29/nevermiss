import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { Edit, MessageCircle, Calendar, Clock, Crown, Building2, Gift, Phone, Mail } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { PageHeader } from '@/components/Navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { HolidayCard } from '@/components/HolidayCard'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { calculateRelationshipScore } from '@/core/scoringSystem'
import { HOLIDAYS } from '@/data/holidays'
import type { TranslationKey } from '@/i18n'
import { generateGreeting } from '@/services/greetingService'
import { getAvatarGradient } from '@/utils/avatarUtils'

export function ContactDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { contacts, updateContact, isPremium } = useApp()
  const t = useT()
  const { theme } = useTheme()
  // Capture current timestamp once per mount via useState initializer (avoids impure Date.now() in render)
  const [nowMs] = useState<number>(() => Date.now())
  const [celebrating, setCelebrating] = useState(false)

  const contact = contacts.find(c => c.id === id)
  if (!contact) {
    return (
      <div className="screen-container">
        <PageHeader title={t('contactDetail_notFound')} back />
        <div className="page-content">
          <p className="text-[var(--color-text-muted)]">{t('holiday_notFoundDesc')}</p>
        </div>
      </div>
    )
  }
  const score = calculateRelationshipScore(contact, HOLIDAYS)
  const relatedHolidays = HOLIDAYS.filter(h => {
    const days = (new Date(h.date).getTime() - nowMs) / (1000 * 60 * 60 * 24)
    return h.religion === contact.religion && days >= 0 && days <= 60
  })

  const translatedActionLabel = (() => {
    const action = score.suggestedAction
    switch (action.type) {
      case 'wish_birthday': {
        if (!contact.birthday) return t('action_wish_birthday_today')
        const today = new Date()
        const bday = new Date(contact.birthday)
        const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
        if (thisYear < today) thisYear.setFullYear(today.getFullYear() + 1)
        const n = Math.max(0, Math.floor((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
        return n === 0 ? t('action_wish_birthday_today') : t('action_wish_birthday_days', { n })
      }
      case 'wish_holiday': {
        const h = action.relatedHolidayId ? HOLIDAYS.find(x => x.id === action.relatedHolidayId) : undefined
        if (!h) return action.label
        const days = Math.max(0, Math.floor((new Date(h.date).getTime() - nowMs) / (1000 * 60 * 60 * 24)))
        return t('action_wish_holiday_days', { name: h.name, n: days })
      }
      case 'reconnect':
        return t('action_reconnect_days', { n: score.daysSinceContact })
      case 'send_checkin':
        return t('action_checkin')
      case 'follow_up':
      default:
        return t('action_followup')
    }
  })()

  const markContacted = () => {
    updateContact({ ...contact, lastContactDate: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString() })
    // Haptic feedback
    try { navigator.vibrate?.(40) } catch { /* unsupported */ }
    // Celebration chord — C5/E5/G5 major triad arpeggio, max ~0.75s total
    try {
      const ctx = new AudioContext()
      const freqs = [523.25, 659.25, 783.99] // C5, E5, G5
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.04 + i * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55 + i * 0.08)
        osc.start(ctx.currentTime + i * 0.08)
        osc.stop(ctx.currentTime + 0.6 + i * 0.08)
      })
    } catch { /* blocked or unsupported */ }
    // Particle burst (respects prefers-reduced-motion)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCelebrating(true)
      setTimeout(() => setCelebrating(false), 1600)
    }
  }

  const urgencyColors = {
    critical: '#EF4444',
    high: '#F97316',
    medium: '#F59E0B',
    low: '#22C55E',
  }

  const previewMessage = generateGreeting({
    contact,
    tone: 'friendly',
    language: contact.language,
  })

  const avatarGradient = contact.avatarColor
    ? `linear-gradient(135deg, ${contact.avatarColor}, ${contact.avatarColor}88)`
    : getAvatarGradient(contact.name)

  // SVG ring progress for score
  const ringRadius = 36
  const ringCircumference = 2 * Math.PI * ringRadius
  const scorePct = Math.min(score.total / 100, 1)
  const ringDash = scorePct * ringCircumference
  const urgencyColor = urgencyColors[score.urgencyLevel]

  return (
    <div className="screen-container">
      <PageHeader
        title={contact.name}
        back
        right={
          <button
            onClick={() => navigate(`/contacts/${id}/edit`)}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
            aria-label={t('contactForm_edit')}
          >
            <Edit size={16} className="text-[var(--color-text-muted)]" aria-hidden="true" />
          </button>
        }
      />

      <div className="page-content space-y-4 pb-24">
        {/* Profile banner */}
        <div
          className="rounded-[var(--border-radius-lg)] overflow-hidden shadow-lg"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
        >
          <div className="px-5 pt-5 pb-6 flex items-center gap-4">
            {/* Large gradient avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-xl ring-4 ring-white/20"
              style={{ background: avatarGradient }}
            >
              {contact.name[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white">{contact.name}</h2>
                {contact.importanceLevel === 'vip' && <Badge variant="premium" size="sm"><Crown size={10} /> VIP</Badge>}
                {contact.contactType === 'internal' && <Badge variant="info" size="sm"><Building2 size={10} /> Internal</Badge>}
              </div>
              <p className="text-sm text-white/75 capitalize mt-0.5">
                {contact.relationshipType.replace('_', ' ')}
                {contact.role && ` · ${contact.role}`}
                {contact.department && ` · ${contact.department}`}
              </p>
              {contact.religion && (
                <p className="text-xs text-white/60 mt-0.5">
                  {t(`religion_${contact.religion}` as TranslationKey)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Relationship score with SVG ring */}
        <Card>
          <div className="flex items-center gap-4">
            {/* SVG ring */}
            <div className="relative shrink-0">
              <svg width="88" height="88" viewBox="0 0 88 88">
                {/* Track */}
                <circle
                  cx="44"
                  cy="44"
                  r={ringRadius}
                  fill="none"
                  stroke="var(--color-surface-2)"
                  strokeWidth="8"
                />
                {/* Progress arc */}
                <circle
                  cx="44"
                  cy="44"
                  r={ringRadius}
                  fill="none"
                  stroke={urgencyColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${ringDash} ${ringCircumference}`}
                  strokeDashoffset={ringCircumference * 0.25}
                  style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold" style={{ color: urgencyColor }}>{score.total}</span>
                <span className="text-[9px] text-[var(--color-text-muted)] uppercase font-medium">pts</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[var(--color-text-primary)]">{t('contactDetail_score')}</h3>
                <div
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${urgencyColor}22`,
                    color: urgencyColor,
                  }}
                >
                  {t(`urgency_${score.urgencyLevel}` as TranslationKey)}
                </div>
              </div>

              <div className="space-y-2">
                <ScoreBar label={t('contactDetail_timePenalty')} value={score.timePenalty} max={50} color="#F97316" />
                <ScoreBar label={t('contactDetail_importanceWeight')} value={score.importanceWeight} max={30} color="var(--color-primary)" />
                <ScoreBar label={t('contactDetail_upcomingEvents')} value={score.upcomingEventsWeight} max={20} color="#EC4899" />
              </div>
            </div>
          </div>

          <div className="mt-3 p-2.5 bg-[var(--color-surface-2)] rounded-lg">
            <p className="text-xs font-semibold text-[var(--color-text-primary)]">
              {t('contactDetail_suggestion', { label: translatedActionLabel })}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {score.suggestedAction.description}
            </p>
          </div>
        </Card>

        {/* Contact details */}
        <Card>
          <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">{t('contactDetail_contactDetails')}</h3>
          <div className="divide-y divide-[var(--color-border)]">
            {contact.phone && (
              <DetailRow icon={<Phone size={14} />} label={t('contactDetail_phone')} value={contact.phone} />
            )}
            {contact.email && isPremium && (
              <DetailRow icon={<Mail size={14} />} label={t('contactDetail_email')} value={contact.email} />
            )}
            {contact.lastContactDate && (
              <DetailRow
                icon={<Clock size={14} />}
                label={t('contactDetail_lastContact')}
                value={`${format(new Date(contact.lastContactDate), 'MMM d, yyyy')} (${formatDistanceToNow(new Date(contact.lastContactDate))} ago)`}
              />
            )}
            {contact.birthday && isPremium && (
              <DetailRow icon={<Gift size={14} />} label={t('contactDetail_birthday')} value={format(new Date(contact.birthday), 'MMMM d')} />
            )}
            <DetailRow
              icon={<Calendar size={14} />}
              label={t('contactDetail_frequency')}
              value={t(`freq_${contact.interactionFrequency}` as TranslationKey)}
            />
          </div>
        </Card>

        {/* Notes */}
        {contact.notes && (
          <Card>
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">{t('contactDetail_notes')}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{contact.notes}</p>
          </Card>
        )}

        {/* Upcoming holidays */}
        {relatedHolidays.length > 0 && (
          <section>
            <h3 className="section-title mb-2">{t('contactDetail_upcomingHolidays')}</h3>
            <div className="space-y-2">
              {relatedHolidays.slice(0, 3).map(h => (
                <HolidayCard key={h.id} holiday={h} compact />
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button
            className="btn w-full h-10 px-4 text-sm gap-2 text-white rounded-[var(--border-radius)] font-semibold shadow-md transition-all hover:opacity-90 active:scale-95 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
            onClick={() => navigate(`/greeting?contactId=${contact.id}`)}
          >
            <MessageCircle size={16} />
            {t('contactDetail_createGreeting')}
          </button>

          {contact.phone && (
            <WhatsAppButton
              phone={contact.phone}
              message={previewMessage}
              contactName={contact.name}
              fullWidth
            />
          )}

          <div className="relative">
            {celebrating && (
              <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 50 }}>
                {(['🎉', '✨', '🌟', '💫', '🎊', '⭐', '🎈', '🥳', '✨', '🌟'] as const).map((emoji, i) => {
                  const dirs = [
                    { tx: '-65px', ty: '-85px' }, { tx: '65px', ty: '-85px' },
                    { tx: '-35px', ty: '-105px' }, { tx: '35px', ty: '-105px' },
                    { tx: '-85px', ty: '-55px' }, { tx: '85px', ty: '-55px' },
                    { tx: '-50px', ty: '-75px' }, { tx: '50px', ty: '-75px' },
                    { tx: '-15px', ty: '-110px' }, { tx: '15px', ty: '-110px' },
                  ]
                  return (
                    <span
                      key={i}
                      className="absolute text-xl animate-particle"
                      style={{ left: '50%', bottom: '0', '--tx': dirs[i].tx, '--ty': dirs[i].ty, animationDelay: `${i * 50}ms` } as React.CSSProperties}
                    >
                      {emoji}
                    </span>
                  )
                })}
              </div>
            )}
            <Button
              variant="outline"
              size="md"
              fullWidth
              icon={<Clock size={16} />}
              onClick={markContacted}
            >
              {t('contactDetail_markContacted')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-[var(--color-text-muted)]">{label}</span>
        <span className="font-medium text-[var(--color-text-secondary)]">{value}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 py-2.5 first:pt-0 last:pb-0">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: 'var(--color-surface-2)' }}
      >
        <span className="text-[var(--color-primary)]">{icon}</span>
      </div>
      <div className="flex-1">
        <span className="text-xs text-[var(--color-text-muted)]">{label}: </span>
        <span className="text-sm text-[var(--color-text-primary)]">{value}</span>
      </div>
    </div>
  )
}
