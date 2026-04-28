import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Smartphone, CheckSquare, Square, UserCheck, Users } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { Contacts } from '@capacitor-community/contacts'
import type { ContactPayload } from '@capacitor-community/contacts'
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { PageHeader } from '@/components/Navigation'
import { Button } from '@/components/ui/Button'
import { generateId } from '@/services/storageService'
import { trackEvent } from '@/services/analyticsService'
import type { Contact } from '@/types'

type ScreenState = 'consent' | 'loading' | 'list' | 'success' | 'denied' | 'web_only'

function mapDeviceContact(raw: ContactPayload): Contact {
  const now = new Date().toISOString()
  const displayName =
    raw.name?.display ??
    [raw.name?.given, raw.name?.family].filter(Boolean).join(' ') ??
    ''
  const phone = raw.phones?.find(p => p.number)?.number ?? ''
  const email = raw.emails?.find(e => e.address)?.address ?? ''
  return {
    id: generateId(),
    name: displayName.trim() || 'Unknown',
    phone: phone.trim(),
    language: 'hebrew',
    relationshipType: 'acquaintance',
    importanceLevel: 'normal',
    interactionFrequency: 'monthly',
    contactType: 'external',
    createdAt: now,
    updatedAt: now,
    email: email || undefined,
    department: raw.organization?.department ?? undefined,
    role: raw.organization?.jobTitle ?? undefined,
    team: raw.organization?.company ?? undefined,
  }
}

export function DeviceContactsScreen() {
  const navigate = useNavigate()
  const { addContact, contacts: existingContacts } = useApp()
  const t = useT()

  const [state, setState] = useState<ScreenState>(() =>
    Capacitor.isNativePlatform() ? 'consent' : 'web_only'
  )
  const [deviceContacts, setDeviceContacts] = useState<ContactPayload[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [importing, setImporting] = useState(false)
  const [importedCount, setImportedCount] = useState(0)

  const existingPhones = new Set(existingContacts.map(c => c.phone.replace(/\D/g, '')).filter(Boolean))

  const requestAndLoad = async () => {
    setState('loading')
    try {
      const perm = await Contacts.requestPermissions()
      if (perm.contacts !== 'granted' && perm.contacts !== 'limited') {
        setState('denied')
        return
      }
      const result = await Contacts.getContacts({
        projection: { name: true, phones: true, emails: true, organization: true },
      })
      setDeviceContacts(result.contacts)
      setState('list')
    } catch {
      setState('denied')
    }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === deviceContacts.length) setSelected(new Set())
    else setSelected(new Set(deviceContacts.map(c => c.contactId)))
  }

  const handleImport = async () => {
    setImporting(true)
    const toImport = deviceContacts.filter(c => selected.has(c.contactId))
    let count = 0
    for (const raw of toImport) {
      const contact = mapDeviceContact(raw)
      const norm = contact.phone.replace(/\D/g, '')
      if (norm && existingPhones.has(norm)) continue
      addContact(contact)
      count++
    }
    trackEvent('contacts_imported', { count })
    setImportedCount(count)
    setImporting(false)
    setState('success')
  }

  return (
    <div className="screen-container">
      <PageHeader title={t('deviceContacts_title')} back />

      <div className="page-content pb-28">

        {state === 'web_only' && (
          <div className="card flex flex-col items-center gap-4 py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-2)] flex items-center justify-center">
              <Smartphone size={28} className="text-[var(--color-text-muted)]" />
            </div>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed max-w-xs">
              {t('deviceContacts_webOnly')}
            </p>
            <Button variant="outline" size="md" onClick={() => navigate('/contacts')}>
              {t('go_back')}
            </Button>
          </div>
        )}

        {state === 'consent' && (
          <div className="card flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #3B82F610, #3B82F630)' }}
              >
                <Smartphone size={22} style={{ color: '#3B82F6' }} />
              </div>
              <div>
                <h2 className="font-bold text-[var(--color-text-primary)]">
                  {t('deviceContacts_consent_title')}
                </h2>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {t('deviceContacts_consent_desc')}
            </p>
            <div className="flex gap-3">
              <Button variant="primary" size="md" fullWidth onClick={requestAndLoad}>
                {t('deviceContacts_consent_allow')}
              </Button>
              <Button variant="outline" size="md" fullWidth onClick={() => navigate(-1)}>
                {t('deviceContacts_consent_deny')}
              </Button>
            </div>
          </div>
        )}

        {state === 'loading' && (
          <div className="card flex flex-col items-center gap-4 py-10">
            <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--color-text-secondary)]">{t('deviceContacts_loading')}</p>
          </div>
        )}

        {state === 'denied' && (
          <div className="card flex flex-col items-center gap-4 py-10 text-center">
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-xs">
              {t('deviceContacts_permission_denied')}
            </p>
            <Button variant="outline" size="md" onClick={() => navigate(-1)}>
              {t('go_back')}
            </Button>
          </div>
        )}

        {state === 'success' && (
          <div className="card flex flex-col items-center gap-4 py-10 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10B98110, #10B98130)' }}
            >
              <UserCheck size={28} style={{ color: '#10B981' }} />
            </div>
            <p className="font-semibold text-[var(--color-text-primary)]">
              {t('deviceContacts_success', { n: importedCount })}
            </p>
            <Button variant="primary" size="md" onClick={() => navigate('/contacts')}>
              {t('contacts_title')}
            </Button>
          </div>
        )}

        {state === 'list' && (
          <div className="flex flex-col gap-3">
            {deviceContacts.length === 0 ? (
              <div className="card text-center py-10">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t('deviceContacts_noContacts')}
                </p>
              </div>
            ) : (
              <>
                {/* Select-all row */}
                <div className="card flex items-center justify-between py-2 px-3">
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]"
                    onClick={toggleAll}
                  >
                    {selected.size === deviceContacts.length
                      ? <CheckSquare size={16} />
                      : <Square size={16} />}
                    {selected.size === deviceContacts.length
                      ? t('deviceContacts_deselectAll')
                      : t('deviceContacts_selectAll')}
                  </button>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {t('deviceContacts_selected', { n: selected.size })}
                  </span>
                </div>

                {/* Contact list */}
                <div className="card divide-y divide-[var(--color-border)] p-0 overflow-hidden">
                  {deviceContacts.map(raw => {
                    const name = raw.name?.display ?? [raw.name?.given, raw.name?.family].filter(Boolean).join(' ') ?? 'Unknown'
                    const phone = raw.phones?.find(p => p.number)?.number ?? ''
                    const isSelected = selected.has(raw.contactId)
                    return (
                      <button
                        key={raw.contactId}
                        type="button"
                        onClick={() => toggleSelect(raw.contactId)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-start hover:bg-[var(--color-surface-2)] transition-colors"
                      >
                        <div className="shrink-0 text-[var(--color-primary)]">
                          {isSelected ? <CheckSquare size={18} /> : <Square size={18} className="text-[var(--color-text-muted)]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[var(--color-text-primary)] truncate">{name}</p>
                          <p className="text-xs text-[var(--color-text-muted)] truncate">
                            {phone || t('deviceContacts_noPhone')}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* Sticky import button */}
      {state === 'list' && selected.size > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-40">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={<Users size={18} />}
            onClick={handleImport}
            disabled={importing}
          >
            {importing
              ? t('deviceContacts_importing')
              : t('deviceContacts_import')}
          </Button>
        </div>
      )}
    </div>
  )
}
