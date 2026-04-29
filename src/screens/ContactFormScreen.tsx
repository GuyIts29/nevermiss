import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, Trash2, User, Globe, BarChart2, Crown } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { PageHeader } from '@/components/Navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PremiumFeaturePrompt } from '@/components/PremiumBadge'
import { generateId } from '@/services/storageService'
import { trackEvent } from '@/services/analyticsService'
import { hapticSuccess } from '@/services/hapticService'
import type { Contact, RelationshipType, ImportanceLevel, InteractionFrequency, ContactType, Language, Religion, CelebrationType } from '@/types'
import { RELIGION_LABELS } from '@/data/holidays'
import type { TranslationKey } from '@/i18n'
import { getInitials, getAvatarGradient } from '@/utils/avatarUtils'

const AVATAR_SOLID_COLORS = [
  '#FF6B6B', '#4ECDC4', '#A855F7', '#F59E0B',
  '#10B981', '#3B82F6', '#EC4899', '#F97316',
]

interface SectionHeaderProps {
  icon: React.ElementType
  title: string
  color: string
}

function SectionHeader({ icon: Icon, title, color }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg, ${color}30, ${color}15)` }}
      >
        <Icon size={13} style={{ color }} />
      </div>
      <h3 className="font-extrabold text-sm text-[var(--color-text-primary)] tracking-tight">{title}</h3>
    </div>
  )
}

export function ContactFormScreen() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { contacts, addContact, updateContact, deleteContact, isPremium } = useApp()
  const t = useT()
  const { theme } = useTheme()

  const existing = id ? contacts.find(c => c.id === id) : undefined
  const isNew = !existing

  const [form, setForm] = useState<Partial<Contact>>(() => {
    const defaultColor = AVATAR_SOLID_COLORS[Math.floor(Math.random() * AVATAR_SOLID_COLORS.length)]
    return {
      name: existing?.name ?? '',
      phone: existing?.phone ?? '',
      language: existing?.language ?? 'english',
      relationshipType: existing?.relationshipType ?? 'friend',
      religion: existing?.religion ?? undefined,
      notes: existing?.notes ?? '',
      lastContactDate: existing?.lastContactDate ?? '',
      importanceLevel: existing?.importanceLevel ?? 'normal',
      interactionFrequency: existing?.interactionFrequency ?? 'monthly',
      contactType: existing?.contactType ?? 'external',
      avatarColor: existing?.avatarColor ?? defaultColor,
      birthday: existing?.birthday ?? '',
      hebrewBirthday: existing?.hebrewBirthday ?? undefined,
      celebrationType: existing?.celebrationType ?? undefined,
      email: existing?.email ?? '',
      department: existing?.department ?? '',
      role: existing?.role ?? '',
      team: existing?.team ?? '',
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [duplicateContact, setDuplicateContact] = useState<Contact | null>(null)
  const [useGradientAvatar, setUseGradientAvatar] = useState(!existing?.avatarColor)

  const set = <K extends keyof Contact>(key: K, value: Contact[K]) => {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  // Hebrew birthday — derived from form; helper updates form as "DD-MM"
  const hbParts = useMemo(() => {
    if (!form.hebrewBirthday) return { day: '', month: '' }
    const [d, m] = form.hebrewBirthday.split('-')
    return { day: d ? String(parseInt(d, 10)) : '', month: m ? String(parseInt(m, 10)) : '' }
  }, [form.hebrewBirthday])

  const setHebBirthday = (day: string, month: string) => {
    const d = parseInt(day, 10)
    const m = parseInt(month, 10)
    if (d && m) {
      set('hebrewBirthday', `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}`)
    } else {
      set('hebrewBirthday', undefined as unknown as string)
    }
  }

  const findDuplicate = (): Contact | null => {
    const nameNorm = (form.name ?? '').trim().toLowerCase()
    const phoneNorm = (form.phone ?? '').replace(/\D/g, '')
    return contacts.find(c => {
      if (!isNew && c.id === existing?.id) return false
      const sameName = c.name.trim().toLowerCase() === nameNorm
      const samePhone = phoneNorm.length >= 7 && c.phone.replace(/\D/g, '') === phoneNorm
      return sameName || samePhone
    }) ?? null
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name?.trim()) errs.name = t('contactForm_name')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const doSave = async () => {
    setSaving(true)
    const now = new Date().toISOString()
    const contact: Contact = {
      id: existing?.id ?? generateId(),
      name: form.name!.trim(),
      phone: form.phone ?? '',
      language: form.language as Language,
      relationshipType: form.relationshipType as RelationshipType,
      religion: form.religion as Religion | undefined,
      celebrationType: form.celebrationType as CelebrationType | undefined,
      notes: form.notes,
      lastContactDate: form.lastContactDate || undefined,
      importanceLevel: form.importanceLevel as ImportanceLevel,
      interactionFrequency: form.interactionFrequency as InteractionFrequency,
      contactType: form.contactType as ContactType,
      avatarColor: useGradientAvatar ? undefined : form.avatarColor,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      birthday: isPremium ? (form.birthday || undefined) : undefined,
      hebrewBirthday: isPremium ? (form.hebrewBirthday || undefined) : undefined,
      email: isPremium ? (form.email || undefined) : undefined,
      department: isPremium ? (form.department || undefined) : undefined,
      role: isPremium ? (form.role || undefined) : undefined,
      team: isPremium ? (form.team || undefined) : undefined,
    }
    if (isNew) {
      addContact(contact)
      trackEvent('contact_created')
    } else {
      updateContact(contact)
    }
    await hapticSuccess()
    setSaving(false)
    navigate(`/contacts/${contact.id}`)
  }

  const handleSave = async () => {
    if (!validate()) return
    const dup = findDuplicate()
    if (dup) {
      setDuplicateContact(dup)
      setShowDuplicateWarning(true)
      return
    }
    await doSave()
  }

  const handleDelete = () => {
    if (existing) {
      deleteContact(existing.id)
      navigate('/contacts', { replace: true })
    }
  }

  const displayGradient = useGradientAvatar
    ? getAvatarGradient(form.name ?? '')
    : `linear-gradient(135deg, ${form.avatarColor}, ${form.avatarColor}cc)`

  return (
    <div className="screen-container">
      <PageHeader
        title={isNew ? t('contactForm_new') : t('contactForm_edit')}
        back
        right={
          !isNew && (
            <button
              onClick={() => setShowDelete(true)}
              className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors"
              aria-label={t('contactForm_deleteContact')}
            >
              <Trash2 size={16} className="text-red-500" />
            </button>
          )
        }
      />

      <div className="page-content space-y-4 pb-28">

        {/* Avatar preview + color picker */}
        <div
          className="rounded-[var(--border-radius-lg)] p-4 flex items-center gap-4"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}10, ${theme.secondary}06)`,
            border: `1px solid ${theme.primary}20`,
          }}
        >
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-extrabold text-xl shrink-0 shadow-md transition-all duration-300"
            style={{ background: displayGradient }}
          >
            {getInitials(form.name ?? '')}
          </div>

          {/* Picker */}
          <div className="flex-1">
            <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
              {t('contactForm_avatarColor')}
            </p>
            <div className="flex flex-wrap gap-2">
              {/* Auto-gradient option */}
              <button
                onClick={() => setUseGradientAvatar(true)}
                className="w-7 h-7 rounded-full transition-all hover:scale-110 flex items-center justify-center text-white text-[9px] font-bold"
                style={{
                  background: getAvatarGradient(form.name || 'Auto'),
                  outline: useGradientAvatar ? '2.5px solid var(--color-primary)' : 'none',
                  outlineOffset: '2px',
                  boxShadow: useGradientAvatar ? '0 0 0 4px var(--color-accent)' : 'none',
                }}
                aria-label={t('contactForm_autoGradient')}
              >
                ✦
              </button>
              {AVATAR_SOLID_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => { set('avatarColor', c); setUseGradientAvatar(false) }}
                  className="w-7 h-7 rounded-full transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: !useGradientAvatar && form.avatarColor === c ? '2.5px solid var(--color-primary)' : 'none',
                    outlineOffset: '2px',
                    boxShadow: !useGradientAvatar && form.avatarColor === c ? '0 0 0 4px var(--color-accent)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card space-y-3">
          <SectionHeader icon={User} title={t('contactForm_basicInfo')} color={theme.primary} />
          <Input
            label={t('contactForm_name')}
            value={form.name ?? ''}
            onChange={e => set('name', e.target.value)}
            error={errors.name}
            placeholder={t('contactForm_namePlaceholder')}
            autoFocus={isNew}
          />
          <Input
            label={t('contactForm_phone')}
            value={form.phone ?? ''}
            onChange={e => set('phone', e.target.value)}
            placeholder={t('contactForm_phonePlaceholder')}
            type="tel"
          />
          <Select
            label={t('contactForm_relationshipType')}
            value={form.relationshipType ?? 'friend'}
            onChange={e => set('relationshipType', e.target.value as RelationshipType)}
            options={[
              { value: 'friend', label: t('rel_friend') },
              { value: 'family', label: t('rel_family') },
              { value: 'colleague', label: t('rel_colleague') },
              { value: 'client', label: t('rel_client') },
              { value: 'business_partner', label: t('rel_business_partner') },
              { value: 'mentor', label: t('rel_mentor') },
              { value: 'acquaintance', label: t('rel_acquaintance') },
              { value: 'employee', label: t('rel_employee') },
              { value: 'manager', label: t('rel_manager') },
              { value: 'other', label: t('rel_other') },
            ]}
          />
          <Select
            label={t('contactForm_contactType')}
            value={form.contactType ?? 'external'}
            onChange={e => set('contactType', e.target.value as ContactType)}
            options={[
              { value: 'external', label: t('contactForm_externalContact') },
              { value: 'internal', label: t('contactForm_internalContact') },
            ]}
          />
        </div>

        {/* Cultural */}
        <div className="card space-y-3">
          <SectionHeader icon={Globe} title={t('contactForm_cultural')} color="#10B981" />
          <Select
            label={t('contactForm_language')}
            value={form.language ?? 'english'}
            onChange={e => set('language', e.target.value as Language)}
            options={[
              { value: 'english', label: t('lang_english') },
              { value: 'hebrew', label: t('lang_hebrew') },
              { value: 'arabic', label: t('lang_arabic') },
              { value: 'russian', label: t('lang_russian') },
              { value: 'amharic', label: t('lang_amharic') },
              { value: 'french', label: t('lang_french') },
              { value: 'spanish', label: t('lang_spanish') },
              { value: 'other', label: t('lang_other') },
            ]}
          />
          <Select
            label={t('contactForm_religion')}
            value={form.religion ?? ''}
            onChange={e => set('religion', e.target.value as Religion || undefined)}
            options={[
              { value: '', label: t('contactForm_notSpecified') },
              ...Object.keys(RELIGION_LABELS).map(v => ({ value: v, label: t(`religion_${v}` as TranslationKey) })),
            ]}
          />
          <Select
            label={t('contactForm_celebrationType')}
            value={form.celebrationType ?? ''}
            onChange={e => set('celebrationType', (e.target.value as CelebrationType) || undefined)}
            options={[
              { value: '', label: t('contactForm_notSpecified') },
              { value: 'Jewish', label: t('celebrationType_Jewish') },
              { value: 'Christian', label: t('celebrationType_Christian') },
              { value: 'Muslim', label: t('celebrationType_Muslim') },
              { value: 'Druze', label: t('celebrationType_Druze') },
              { value: 'Secular', label: t('celebrationType_Secular') },
            ]}
          />
        </div>

        {/* Relationship Tracking */}
        <div className="card space-y-3">
          <SectionHeader icon={BarChart2} title={t('contactForm_tracking')} color="#F59E0B" />
          <Select
            label={t('contactForm_importance')}
            value={form.importanceLevel ?? 'normal'}
            onChange={e => set('importanceLevel', e.target.value as ImportanceLevel)}
            options={[
              { value: 'normal', label: t('imp_normal') },
              { value: 'high', label: t('imp_high') },
              { value: 'vip', label: t('imp_vip') },
            ]}
          />
          <Select
            label={t('contactForm_frequency')}
            value={form.interactionFrequency ?? 'monthly'}
            onChange={e => set('interactionFrequency', e.target.value as InteractionFrequency)}
            options={[
              { value: 'daily', label: t('freq_daily') },
              { value: 'weekly', label: t('freq_weekly') },
              { value: 'biweekly', label: t('freq_biweekly') },
              { value: 'monthly', label: t('freq_monthly') },
              { value: 'quarterly', label: t('freq_quarterly') },
              { value: 'biannually', label: t('freq_biannually') },
              { value: 'annually', label: t('freq_annually') },
            ]}
          />
          <Input
            label={t('contactForm_lastContact')}
            type="date"
            value={form.lastContactDate ?? ''}
            onChange={e => set('lastContactDate', e.target.value)}
          />
        </div>

        {/* Premium fields */}
        {isPremium ? (
          <div className="card space-y-3"
            style={{ borderLeft: '3px solid #F59E0B' }}>
            <SectionHeader icon={Crown} title={t('contactForm_premiumDetails')} color="#F59E0B" />
            <Input
              label={t('contactForm_birthday')}
              type="date"
              value={form.birthday ?? ''}
              onChange={e => set('birthday', e.target.value)}
            />
            {/* Hebrew Birthday — shown for Jewish contacts or when already set */}
            {(form.religion === 'Judaism' || form.hebrewBirthday) && (
              <div>
                <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                  {t('contactForm_hebrewBirthday')}
                </p>
                <div className="flex items-center gap-2">
                  <select
                    value={hbParts.day}
                    onChange={e => setHebBirthday(e.target.value, hbParts.month)}
                    className="flex-1 px-2 py-2 rounded-[var(--border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)]"
                  >
                    <option value="">{t('contactForm_hebrewBirthdayDay')}</option>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select
                    value={hbParts.month}
                    onChange={e => setHebBirthday(hbParts.day, e.target.value)}
                    className="flex-[2] px-2 py-2 rounded-[var(--border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)]"
                  >
                    <option value="">{t('contactForm_hebrewBirthdayMonth')}</option>
                    {(['ניסן','אייר','סיון','תמוז','אב','אלול','תשרי','חשוון','כסלו','טבת','שבט','אדר'] as const).map((name, i) => (
                      <option key={i + 1} value={i + 1}>{name}</option>
                    ))}
                  </select>
                  {form.hebrewBirthday && (
                    <button
                      type="button"
                      onClick={() => setHebBirthday('', '')}
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors text-xs"
                      aria-label={t('contactForm_hebrewBirthdayClear')}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            )}
            <Input
              label={t('contactForm_email')}
              type="email"
              value={form.email ?? ''}
              onChange={e => set('email', e.target.value)}
              placeholder={t('contactForm_emailPlaceholder')}
            />
            <Input
              label={t('contactForm_department')}
              value={form.department ?? ''}
              onChange={e => set('department', e.target.value)}
              placeholder={t('contactForm_departmentPlaceholder')}
            />
            <Input
              label={t('contactForm_role')}
              value={form.role ?? ''}
              onChange={e => set('role', e.target.value)}
              placeholder={t('contactForm_rolePlaceholder')}
            />
            <Input
              label={t('contactForm_team')}
              value={form.team ?? ''}
              onChange={e => set('team', e.target.value)}
              placeholder={t('contactForm_teamPlaceholder')}
            />
          </div>
        ) : (
          <PremiumFeaturePrompt feature={t('premium_feat_birthday_fields')} />
        )}

        {/* Notes */}
        <div className="card">
          <Textarea
            label={t('contactForm_notes')}
            value={form.notes ?? ''}
            onChange={e => set('notes', e.target.value)}
            placeholder={t('contactForm_notesPlaceholder')}
            rows={3}
          />
        </div>
      </div>

      {/* Fixed save bar */}
      <div
        className="fixed bottom-16 left-0 right-0 z-20 px-4 py-3"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, var(--color-background) 30%)',
          maxWidth: '480px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={saving}
          icon={<Save size={16} />}
          onClick={handleSave}
        >
          {isNew ? t('contactForm_add') : t('contactForm_saveChanges')}
        </Button>
      </div>

      {/* Duplicate warning */}
      <Modal
        isOpen={showDuplicateWarning}
        onClose={() => setShowDuplicateWarning(false)}
        title={t('contactForm_duplicateTitle')}
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" fullWidth onClick={() => setShowDuplicateWarning(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" size="sm" fullWidth onClick={() => { setShowDuplicateWarning(false); doSave() }}>
              {t('contactForm_duplicateSaveAnyway')}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {t('contactForm_duplicateBody', { name: duplicateContact?.name ?? '' })}
        </p>
      </Modal>

      {/* Delete confirm */}
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
          {t('contactForm_deleteConfirm', { name: existing?.name ?? '' })}
        </p>
      </Modal>
    </div>
  )
}
