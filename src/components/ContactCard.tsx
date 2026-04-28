import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Crown, Building2 } from 'lucide-react'
import type { Contact, RelationshipScore, SuggestedActionType } from '@/types'
import { getInitials, getAvatarGradient } from '@/utils/avatarUtils'
import { useT } from '@/context/LanguageContext'
import type { TranslationKey } from '@/i18n'

interface ContactCardProps {
  contact: Contact
  score?: RelationshipScore
  onClick?: () => void
  staggerIndex?: number
}

const ACTION_KEY: Record<SuggestedActionType, TranslationKey> = {
  send_greeting: 'action_followup',
  send_checkin: 'action_checkin',
  wish_holiday: 'action_followup',
  wish_birthday: 'action_wish_birthday_today',
  reconnect: 'action_reconnect_days',
  follow_up: 'action_followup',
}

export const ContactCard = memo(function ContactCard({ contact, score, onClick, staggerIndex }: ContactCardProps) {
  const navigate = useNavigate()
  const t = useT()
  const handleClick = onClick ?? (() => navigate(`/contacts/${contact.id}`))

  const urgencyColor = score
    ? score.urgencyLevel === 'critical' ? '#EF4444'
    : score.urgencyLevel === 'high' ? '#F97316'
    : score.urgencyLevel === 'medium' ? '#F59E0B'
    : 'var(--color-border)'
    : 'var(--color-border)'

  const urgencyGlow = score
    ? score.urgencyLevel === 'critical' ? 'rgba(239,68,68,0.15)'
    : score.urgencyLevel === 'high' ? 'rgba(249,115,22,0.12)'
    : score.urgencyLevel === 'medium' ? 'rgba(245,158,11,0.10)'
    : 'transparent'
    : 'transparent'

  const scorePercent = score ? Math.min(Math.round(score.total), 100) : 0
  const avatarGradient = contact.avatarColor
    ? `linear-gradient(135deg, ${contact.avatarColor}, ${contact.avatarColor}88)`
    : getAvatarGradient(contact.name)

  const staggerClass = staggerIndex != null
    ? `stagger-${Math.min(staggerIndex + 1, 5)}`
    : 'animate-slide-up'

  return (
    <button
      type="button"
      className={`card card-interactive flex items-center gap-3 w-full text-left ${staggerClass}`}
      style={{
        borderLeft: `3px solid ${urgencyColor}`,
        background: urgencyGlow !== 'transparent'
          ? `linear-gradient(135deg, var(--color-surface), ${urgencyGlow})`
          : undefined,
      }}
      onClick={handleClick}
    >
      {/* Avatar */}
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
        style={{ background: avatarGradient }}
      >
        {getInitials(contact.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-bold text-sm text-[var(--color-text-primary)] truncate">
            {contact.name}
          </span>
          {contact.importanceLevel === 'vip' && (
            <Crown size={12} className="text-amber-500 shrink-0" aria-hidden="true" />
          )}
          {contact.contactType === 'internal' && (
            <Building2 size={12} className="text-[var(--color-primary)] shrink-0" aria-hidden="true" />
          )}
        </div>
        <p className="text-xs text-[var(--color-text-muted)] capitalize">
          {contact.relationshipType.replace('_', ' ')}
          {contact.department && ` · ${contact.department}`}
        </p>
        {score && (
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
            {t(ACTION_KEY[score.suggestedAction.type])}
          </p>
        )}
        {score && (
          <div className="score-bar-track mt-1.5">
            <div
              className="score-bar-fill"
              style={{
                width: `${scorePercent}%`,
                background: `linear-gradient(90deg, ${urgencyColor}, ${urgencyColor}88)`,
              }}
            />
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        {score && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${urgencyColor}20`,
              color: urgencyColor === 'var(--color-border)' ? 'var(--color-text-muted)' : urgencyColor,
            }}
          >
            {score.total}
          </span>
        )}
        {contact.phone && (
          <MessageCircle size={13} className="text-green-500" />
        )}
      </div>
    </button>
  )
})
