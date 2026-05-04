import type { Contact, Holiday } from '@/types'
import type { TranslationKey } from '@/i18n'
import { getHolidayDisplayName } from '@/utils/holidayUtils'

const SENT_KEY = 'nm_notif_sent'

// Parse "YYYY-MM-DD" as LOCAL midnight to avoid UTC-offset date shifts (e.g. Asia/Jerusalem UTC+3).
// new Date("YYYY-MM-DD") is parsed as UTC, which shifts the date back by the local UTC offset.
function parseDateLocal(dateStr: string): Date | null {
  if (!dateStr) return null
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return null
  return new Date(parts[0], parts[1] - 1, parts[2])
}

function getSentToday(): Set<string> {
  try {
    const raw = localStorage.getItem(SENT_KEY)
    if (!raw) return new Set()
    const { date, ids } = JSON.parse(raw) as { date: string; ids: string[] }
    if (date !== new Date().toDateString()) return new Set()
    return new Set(ids)
  } catch {
    return new Set()
  }
}

function markSent(id: string): void {
  const sent = getSentToday()
  sent.add(id)
  localStorage.setItem(SENT_KEY, JSON.stringify({
    date: new Date().toDateString(),
    ids: Array.from(sent),
  }))
}

export function canNotify(): boolean {
  return 'Notification' in window && Notification.permission === 'granted'
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function fire(id: string, title: string, body: string): void {
  if (!canNotify()) return
  const sent = getSentToday()
  if (sent.has(id)) return
  try {
    new Notification(title, { body, icon: '/favicon.ico' })
    markSent(id)
  } catch {
    // Notification may be blocked silently
  }
}

type TFn = (key: TranslationKey, vars?: Record<string, string | number>) => string

export function fireReminders(contacts: Contact[], holidays: Holiday[], t: TFn, lang = 'en'): void {
  if (!canNotify()) return

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // ── Birthday reminders ──────────────────────────────────────────────────
  for (const contact of contacts) {
    if (!contact.birthday) continue

    const bday = parseDateLocal(contact.birthday)
    if (!bday) continue
    bday.setFullYear(today.getFullYear())
    bday.setHours(0, 0, 0, 0)
    if (bday < today) bday.setFullYear(today.getFullYear() + 1)
    const daysUntil = Math.round((bday.getTime() - today.getTime()) / 86_400_000)

    if (daysUntil === 0) {
      fire(
        `bday-today-${contact.id}`,
        t('notif_birthday_today', { name: contact.name }),
        t('notif_birthday_today_body'),
      )
    } else if (daysUntil > 0 && daysUntil <= 7) {
      const lastContactParsed = contact.lastContactDate ? parseDateLocal(contact.lastContactDate) : null
      const daysSince = lastContactParsed
        ? Math.round((today.getTime() - lastContactParsed.getTime()) / 86_400_000)
        : 999
      if (daysSince >= 30) {
        fire(
          `bday-soon-${contact.id}-${daysUntil}`,
          t('notif_birthday_soon'),
          t('notif_birthday_soon_body', { name: contact.name, days: daysSince, daysUntil }),
        )
      }
    }
  }

  // ── Overdue contact reminders ───────────────────────────────────────────
  for (const contact of contacts) {
    if (!contact.lastContactDate) continue
    const lastContact = parseDateLocal(contact.lastContactDate)
    if (!lastContact) continue
    const daysSince = Math.round((today.getTime() - lastContact.getTime()) / 86_400_000)
    if (daysSince < 45) continue
    // skip if birthday reminder already covers this contact today
    const bday = contact.birthday ? parseDateLocal(contact.birthday) : null
    if (bday) {
      bday.setFullYear(today.getFullYear())
      bday.setHours(0, 0, 0, 0)
      if (bday < today) bday.setFullYear(today.getFullYear() + 1)
      const bdaysUntil = Math.round((bday.getTime() - today.getTime()) / 86_400_000)
      if (bdaysUntil <= 7) continue
    }
    fire(
      `overdue-${contact.id}`,
      t('notif_overdue', { name: contact.name }),
      t('notif_overdue_body', { days: daysSince }),
    )
  }

  // ── Holiday reminders ───────────────────────────────────────────────────
  for (const holiday of holidays) {
    if (!holiday.date) continue                    // safeguard: skip if date missing/uncertain
    const hDate = parseDateLocal(holiday.date)
    if (!hDate) continue                           // safeguard: skip if date fails to parse
    hDate.setFullYear(today.getFullYear())
    hDate.setHours(0, 0, 0, 0)
    if (hDate < today) hDate.setFullYear(today.getFullYear() + 1)
    const daysUntil = Math.round((hDate.getTime() - today.getTime()) / 86_400_000)

    if (daysUntil === 0) {
      fire(
        `holiday-today-${holiday.id}`,
        t('notif_holiday_today', { emoji: holiday.emoji, name: getHolidayDisplayName(holiday, lang) }),
        t('notif_holiday_today_body'),
      )
    } else if (daysUntil === 1) {
      fire(
        `holiday-tomorrow-${holiday.id}`,
        t('notif_holiday_tomorrow', { emoji: holiday.emoji, name: getHolidayDisplayName(holiday, lang) }),
        t('notif_holiday_tomorrow_body'),
      )
    }
  }
}
