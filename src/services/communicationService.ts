import type { Contact, CommunicationChannel, CommunicationAction } from '@/types'

export function getAvailableChannels(contact: Contact): CommunicationAction[] {
  const actions: CommunicationAction[] = []

  if (contact.phone) {
    actions.push({
      channel: 'whatsapp',
      contactId: contact.id,
      message: '',
      available: true,
    })
  }

  actions.push({
    channel: 'copy',
    contactId: contact.id,
    message: '',
    available: true,
  })

  if (contact.contactType === 'internal') {
    actions.push({
      channel: 'slack',
      contactId: contact.id,
      message: '',
      available: false, // future
    })
    actions.push({
      channel: 'teams',
      contactId: contact.id,
      message: '',
      available: false, // future
    })
  }

  if (contact.email) {
    actions.push({
      channel: 'email',
      contactId: contact.id,
      message: '',
      available: false, // future
    })
  }

  return actions
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = phone.replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${normalized}?text=${encoded}`
}

export function openWhatsApp(phone: string, message: string): void {
  const url = buildWhatsAppUrl(phone, message)
  window.open(url, '_blank', 'noopener,noreferrer')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const success = document.execCommand('copy')
    document.body.removeChild(el)
    return success
  }
}

export const CHANNEL_LABELS: Record<CommunicationChannel, string> = {
  whatsapp: 'WhatsApp',
  copy: 'Copy Message',
  slack: 'Slack (coming soon)',
  teams: 'Teams (coming soon)',
  email: 'Email (coming soon)',
}

export const CHANNEL_ICONS: Record<CommunicationChannel, string> = {
  whatsapp: '💬',
  copy: '📋',
  slack: '💼',
  teams: '🔷',
  email: '📧',
}
