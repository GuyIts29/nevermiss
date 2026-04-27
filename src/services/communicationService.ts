import type { Contact, CommunicationChannel, CommunicationAction } from '@/types'

// ─── WhatsApp ────────────────────────────────────────────────────────────────

export function buildWhatsAppUrl(phone: string, message: string): string {
  let normalized = phone.replace(/\D/g, '')
  if (normalized.startsWith('0') && normalized.length >= 9 && normalized.length <= 10) {
    normalized = '972' + normalized.slice(1)
  }
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

export function openWhatsApp(phone: string, message: string): void {
  window.open(buildWhatsAppUrl(phone, message), '_blank', 'noopener,noreferrer')
}

// ─── SMS ─────────────────────────────────────────────────────────────────────

export function buildSmsUrl(phone: string, message: string): string {
  const normalized = phone.replace(/\D/g, '')
  // iOS uses &body=, Android uses ?body= — the semi-colon form is cross-platform
  return `sms:${normalized}?body=${encodeURIComponent(message)}`
}

export function openSms(phone: string, message: string): void {
  window.location.href = buildSmsUrl(phone, message)
}

// ─── Email ───────────────────────────────────────────────────────────────────

export function buildMailtoUrl(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function openEmail(email: string, subject: string, body: string): void {
  window.location.href = buildMailtoUrl(email, subject, body)
}

// ─── Share (Web Share API) ────────────────────────────────────────────────────

export function canShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

export async function shareMessage(message: string, title?: string): Promise<boolean> {
  if (!canShare()) return false
  try {
    await navigator.share({ title: title ?? 'Greeting', text: message })
    return true
  } catch {
    return false
  }
}

// ─── Clipboard ───────────────────────────────────────────────────────────────

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  }
}

// ─── Available channels ───────────────────────────────────────────────────────

export function getAvailableChannels(contact: Contact): CommunicationAction[] {
  const actions: CommunicationAction[] = []
  if (contact.phone) {
    actions.push({ channel: 'whatsapp', contactId: contact.id, message: '', available: true })
    actions.push({ channel: 'sms', contactId: contact.id, message: '', available: true })
  }
  if (contact.email) {
    actions.push({ channel: 'email', contactId: contact.id, message: '', available: true })
  }
  actions.push({ channel: 'copy', contactId: contact.id, message: '', available: true })
  if (canShare()) {
    actions.push({ channel: 'share', contactId: contact.id, message: '', available: true })
  }
  return actions
}

// ─── Channel metadata ─────────────────────────────────────────────────────────

export const CHANNEL_ICONS: Record<CommunicationChannel, string> = {
  whatsapp: '💬',
  sms: '📱',
  email: '📧',
  copy: '📋',
  share: '📤',
  slack: '💼',
  teams: '🔷',
}

export const CHANNEL_COLORS: Record<CommunicationChannel, string> = {
  whatsapp: '#25D366',
  sms: '#3B82F6',
  email: '#8B5CF6',
  copy: '#F59E0B',
  share: '#10B981',
  slack: '#4A154B',
  teams: '#6264A7',
}

export const CHANNEL_LABELS: Record<CommunicationChannel, string> = {
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  email: 'Email',
  copy: 'Copy message',
  share: 'Share',
  slack: 'Slack',
  teams: 'Teams',
}
