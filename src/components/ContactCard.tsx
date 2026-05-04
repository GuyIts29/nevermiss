import { memo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Crown, Building2, MoreVertical } from 'lucide-react'
import type { Contact, RelationshipScore, SuggestedActionType } from '@/types'
import { getInitials, getAvatarGradient } from '@/utils/avatarUtils'
import { useT, useLang } from '@/context/LanguageContext'
import { useApp } from '@/context/AppContext'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
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
  const { lang } = useLang()
  const { deleteContact, groups } = useApp()
  const handleClick = onClick ?? (() => navigate(`/contacts/${contact.id}`))

  const [menuOpen, setMenuOpen] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showScoreTip, setShowScoreTip] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen && !showScoreTip) return
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setShowScoreTip(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') { setMenuOpen(false); setShowScoreTip(false) }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen, showScoreTip])

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

  const contactGroups = groups.filter(g => g.contactIds.includes(contact.id))

  const handleDelete = () => {
    deleteContact(contact.id)
    setShowDelete(false)
  }

  return (
    <>
      <div
        className={`card card-interactive flex items-center gap-3 w-full text-start ${staggerClass}`}
        style={{
          [lang === 'he' ? 'borderRight' : 'borderLeft']: `3px solid ${urgencyColor}`,
          background: urgencyGlow !== 'transparent'
            ? `linear-gradient(135deg, var(--color-surface), ${urgencyGlow})`
            : undefined,
        }}
      >
        {/* Main clickable area */}
        <button
          type="button"
          className="flex items-center gap-3 flex-1 min-w-0 text-start"
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
            {contactGroups.length > 0 && (
              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                {contactGroups.slice(0, 2).map(g => (
                  <span
                    key={g.id}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ backgroundColor: `${g.color}22`, color: g.color }}
                  >
                    {g.emoji} {g.name}
                  </span>
                ))}
                {contactGroups.length > 2 && (
                  <span className="text-[10px] text-[var(--color-text-muted)]">+{contactGroups.length - 2}</span>
                )}
              </div>
            )}
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
        </button>

        {/* Right: score, phone, 3-dot */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 relative" ref={menuRef}>
          {score && (
            <button
              type="button"
              className="text-xs font-bold px-2 py-0.5 rounded-full min-h-[28px] transition-opacity hover:opacity-80"
              style={{
                backgroundColor: `${urgencyColor}20`,
                color: urgencyColor === 'var(--color-border)' ? 'var(--color-text-muted)' : urgencyColor,
              }}
              aria-label={t('score_tipTitle')}
              onClick={e => { e.stopPropagation(); setMenuOpen(false); setShowScoreTip(v => !v) }}
            >
              {score.total}
            </button>
          )}
          {showScoreTip && (
            <div
              className="absolute z-50 top-full mt-1 rounded-[var(--border-radius)] shadow-xl border border-[var(--color-border)] p-3 text-xs"
              style={{
                background: 'var(--color-surface)',
                [lang === 'he' ? 'left' : 'right']: 0,
                minWidth: '200px',
                maxWidth: '240px',
              }}
            >
              <p className="font-bold text-[var(--color-text-primary)] mb-1">{t('score_tipTitle')}</p>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">{t('score_tipBody')}</p>
            </div>
          )}
          {contact.phone && (
            <MessageCircle size={13} className="text-green-500" />
          )}

          {/* 3-dot button */}
          <button
            type="button"
            className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
            aria-label={t('contacts_moreOptions')}
            aria-expanded={menuOpen}
            onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
          >
            <MoreVertical size={14} className="text-[var(--color-text-muted)]" />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div
              className="absolute z-50 top-full mt-1 rounded-[var(--border-radius)] shadow-xl border border-[var(--color-border)] overflow-hidden"
              style={{
                background: 'var(--color-surface)',
                [lang === 'he' ? 'left' : 'right']: 0,
                minWidth: '120px',
              }}
            >
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
                onClick={e => { e.stopPropagation(); setMenuOpen(false); navigate(`/contacts/${contact.id}`) }}
              >
                {t('edit')}
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                onClick={e => { e.stopPropagation(); setMenuOpen(false); setShowDelete(true) }}
              >
                {t('delete')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title={t('contactForm_deleteContact')}
        size="sm"
        danger
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" fullWidth onClick={() => setShowDelete(false)}>
              {t('cancel')}
            </Button>
            <Button variant="danger" size="sm" fullWidth onClick={handleDelete}>
              {t('delete')}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {t('contactForm_deleteConfirm', { name: contact.name })}
        </p>
      </Modal>
    </>
  )
})
