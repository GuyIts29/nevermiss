import type {
  Contact,
  Holiday,
  RelationshipScore,
  SuggestedAction,
  InteractionFrequency,
} from '@/types'

const FREQUENCY_DAYS: Record<InteractionFrequency, number> = {
  daily: 1,
  weekly: 7,
  biweekly: 14,
  monthly: 30,
  quarterly: 90,
  biannually: 180,
  annually: 365,
}

export function getFrequencyDays(freq: InteractionFrequency): number {
  return FREQUENCY_DAYS[freq]
}

function daysSince(dateStr: string | undefined): number {
  if (!dateStr) return 999
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getUpcomingHolidaysForContact(
  contact: Contact,
  holidays: Holiday[],
  windowDays: number
): Holiday[] {
  if (!contact.religion) return []
  return holidays.filter(h => {
    const days = daysUntil(h.date)
    return (
      h.religion === contact.religion &&
      days >= 0 &&
      days <= windowDays
    )
  })
}

function getBirthdayDaysUntil(birthday: string | undefined): number | null {
  if (!birthday) return null
  const today = new Date()
  const bday = new Date(birthday)
  const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
  if (thisYear < today) {
    thisYear.setFullYear(today.getFullYear() + 1)
  }
  return Math.floor((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getSuggestedAction(
  contact: Contact,
  holidays: Holiday[],
  daysSinceContact: number,
  frequencyDays: number,
  upcomingHolidays: Holiday[]
): SuggestedAction {
  const birthdayDays = getBirthdayDaysUntil(contact.birthday)

  if (birthdayDays !== null && birthdayDays <= 3) {
    return {
      type: 'wish_birthday',
      label: birthdayDays === 0 ? "It's their birthday!" : `Birthday in ${birthdayDays} day${birthdayDays === 1 ? '' : 's'}`,
      description: `Send a birthday greeting to ${contact.name}`,
      urgency: birthdayDays <= 1 ? 'critical' : 'high',
    }
  }

  if (upcomingHolidays.length > 0) {
    const holiday = upcomingHolidays[0]
    const days = daysUntil(holiday.date)
    return {
      type: 'wish_holiday',
      label: `${holiday.name} in ${days} day${days === 1 ? '' : 's'}`,
      description: `Send a ${holiday.name} greeting to ${contact.name}`,
      urgency: days <= 3 ? 'high' : 'medium',
      relatedHolidayId: holiday.id,
    }
  }

  const overdueRatio = daysSinceContact / frequencyDays
  if (overdueRatio >= 2) {
    return {
      type: 'reconnect',
      label: `${daysSinceContact} days since contact`,
      description: `${contact.name} hasn't heard from you in a while — time to reconnect`,
      urgency: overdueRatio >= 3 ? 'critical' : 'high',
    }
  }

  if (overdueRatio >= 1) {
    return {
      type: 'send_checkin',
      label: `Check-in overdue`,
      description: `Send a check-in message to ${contact.name}`,
      urgency: 'medium',
    }
  }

  return {
    type: 'follow_up',
    label: 'Schedule follow-up',
    description: `Keep up the relationship with ${contact.name}`,
    urgency: 'low',
  }
}

export function calculateRelationshipScore(
  contact: Contact,
  holidays: Holiday[]
): RelationshipScore {
  const frequencyDays = getFrequencyDays(contact.interactionFrequency)
  const sinceContact = daysSince(contact.lastContactDate)

  // Time penalty: 0–50 points based on how overdue the contact is
  const overdueRatio = sinceContact / frequencyDays
  const timePenalty = Math.min(Math.round(overdueRatio * 20), 50)

  // Importance weight: 0–30 points
  const importanceWeight =
    contact.importanceLevel === 'vip' ? 30 :
    contact.importanceLevel === 'high' ? 20 : 10

  // Upcoming events: 0–20 points
  const upcomingHolidays = getUpcomingHolidaysForContact(contact, holidays, 14)
  const birthdayDays = getBirthdayDaysUntil(contact.birthday)
  const hasBirthdaySoon = birthdayDays !== null && birthdayDays <= 7
  const upcomingEventsWeight =
    (upcomingHolidays.length > 0 ? 15 : 0) + (hasBirthdaySoon ? 20 : 0)

  const total = timePenalty + importanceWeight + Math.min(upcomingEventsWeight, 20)

  const urgencyLevel =
    total >= 80 ? 'critical' :
    total >= 60 ? 'high' :
    total >= 40 ? 'medium' : 'low'

  return {
    contactId: contact.id,
    total,
    timePenalty,
    importanceWeight,
    upcomingEventsWeight: Math.min(upcomingEventsWeight, 20),
    isOverdue: overdueRatio >= 1,
    daysSinceContact: sinceContact,
    suggestedAction: getSuggestedAction(
      contact,
      holidays,
      sinceContact,
      frequencyDays,
      upcomingHolidays
    ),
    urgencyLevel,
  }
}

export function sortByScore(
  contacts: Contact[],
  holidays: Holiday[]
): Array<{ contact: Contact; score: RelationshipScore }> {
  return contacts
    .map(c => ({ contact: c, score: calculateRelationshipScore(c, holidays) }))
    .sort((a, b) => b.score.total - a.score.total)
}
