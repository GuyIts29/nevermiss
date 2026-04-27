import { useNavigate } from 'react-router-dom'
import { MessageCircle, Crown, Building2 } from 'lucide-react'
import type { Contact, RelationshipScore } from '@/types'

interface ContactCardProps {
  contact: Contact
  score?: RelationshipScore
  onClick?: () => void
  staggerIndex?: number
}

function getInitials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_GRADIENTS = [
  ['#FF6B6B', '#FF8E53'],
  ['#4ECDC4', '#2196F3'],
  ['#A855F7', '#6366F1'],
  ['#F59E0B', '#EF4444'],
  ['#10B981', '#059669'],
  ['#3B82F6', '#0EA5E9'],
  ['#EC4899', '#8B5CF6'],
  ['#F97316', '#FBBF24'],
  ['#06B6D4', '#3B82F6'],
  ['#84CC16', '#10B981'],
]

function getAvatarGradient(name: string): string {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const [a, b] = AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length]
  return `linear-gradient(135deg, ${a}, ${b})`
}

export function ContactCard({ contact, score, onClick, staggerIndex }: ContactCardProps) {
  const navigate = useNavigate()
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
    <div
      className={`card card-interactive flex items-center gap-3 ${staggerClass}`}
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
            <Crown size={12} className="text-amber-500 shrink-0" />
          )}
          {contact.contactType === 'internal' && (
            <Building2 size={12} className="text-[var(--color-primary)] shrink-0" />
          )}
        </div>
        <p className="text-xs text-[var(--color-text-muted)] capitalize">
          {contact.relationshipType.replace('_', ' ')}
          {contact.department && ` · ${contact.department}`}
        </p>
        {score && (
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
            {score.suggestedAction.label}
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
    </div>
  )
}
