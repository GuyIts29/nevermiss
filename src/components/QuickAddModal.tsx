import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, User, Phone } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { Input } from '@/components/ui/Input'

interface QuickAddModalProps {
  onClose: () => void
}

export function QuickAddModal({ onClose }: QuickAddModalProps) {
  const navigate = useNavigate()
  const { addContact } = useApp()
  const t = useT()
  const { theme } = useTheme()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 50)
  }, [])

  const handleSave = () => {
    const trimName = name.trim()
    const trimPhone = phone.trim()
    if (!trimName || !trimPhone) {
      setError(t('quickAdd_required'))
      return
    }
    const now = new Date().toISOString()
    addContact({
      id: Date.now().toString(),
      name: trimName,
      phone: trimPhone,
      language: 'hebrew',
      relationshipType: 'friend',
      importanceLevel: 'normal',
      interactionFrequency: 'monthly',
      contactType: 'external',
      createdAt: now,
      updatedAt: now,
    })
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-hidden animate-slide-up"
        style={{ background: 'var(--color-surface)', boxShadow: '0 -8px 32px rgba(0,0,0,0.18)' }}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <p className="font-bold text-sm text-[var(--color-text-primary)]">{t('quickAdd_title')}</p>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
            aria-label={t('close')}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-4 space-y-3">
          <Input
            ref={nameRef}
            label={t('quickAdd_name')}
            placeholder={t('quickAdd_namePlaceholder')}
            value={name}
            onChange={e => setName(e.target.value)}
            icon={<User size={14} />}
            autoComplete="name"
          />
          <Input
            label={t('quickAdd_phone')}
            placeholder={t('quickAdd_phonePlaceholder')}
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            icon={<Phone size={14} />}
            autoComplete="tel"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-[var(--border-radius)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-[var(--border-radius)] text-sm font-bold text-white transition-colors"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
            >
              {t('quickAdd_save')}
            </button>
          </div>

          <button
            type="button"
            onClick={() => { onClose(); navigate('/contacts/new') }}
            className="w-full text-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors py-1"
          >
            {t('quickAdd_fullForm')} →
          </button>
        </div>
      </div>
    </>
  )
}
