const SETTINGS_KEY = 'nm_holiday_reminder_settings'
const SENT_KEY = 'nm_holiday_reminder_sent'

export interface ReminderChannels {
  push: boolean
  sms: boolean
  email: boolean
  whatsapp: boolean
}

export interface HolidayReminderSettings {
  enabled: boolean
  channels: ReminderChannels
  daysAhead: 1 | 3 | 7
}

const DEFAULTS: HolidayReminderSettings = {
  enabled: false,
  channels: { push: true, sms: false, email: false, whatsapp: false },
  daysAhead: 3,
}

export function getReminderSettings(): HolidayReminderSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULTS, channels: { ...DEFAULTS.channels } }
    const parsed = JSON.parse(raw) as Partial<HolidayReminderSettings>
    return {
      ...DEFAULTS,
      ...parsed,
      channels: { ...DEFAULTS.channels, ...(parsed.channels ?? {}) },
    }
  } catch {
    return { ...DEFAULTS, channels: { ...DEFAULTS.channels } }
  }
}

export function saveReminderSettings(s: HolidayReminderSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}

function getSentToday(): Set<string> {
  try {
    const raw = localStorage.getItem(SENT_KEY)
    if (!raw) return new Set()
    const { date, keys } = JSON.parse(raw) as { date: string; keys: string[] }
    if (date !== new Date().toDateString()) return new Set()
    return new Set(keys)
  } catch {
    return new Set()
  }
}

export function hasBeenReminded(contactId: string, holidayId: string): boolean {
  return getSentToday().has(`${contactId}:${holidayId}`)
}

export function markReminded(contactId: string, holidayId: string): void {
  const sent = getSentToday()
  sent.add(`${contactId}:${holidayId}`)
  localStorage.setItem(SENT_KEY, JSON.stringify({
    date: new Date().toDateString(),
    keys: Array.from(sent),
  }))
}
