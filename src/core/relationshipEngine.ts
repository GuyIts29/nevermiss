import type {
  Contact,
  Holiday,
  RelationshipInsight,
  DashboardData,
} from '@/types'
import { calculateRelationshipScore, sortByScore } from './scoringSystem'

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getBirthdayDaysUntil(birthday: string | undefined): number | undefined {
  if (!birthday) return undefined
  const today = new Date()
  const bday = new Date(birthday)
  const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
  if (thisYear < today) thisYear.setFullYear(today.getFullYear() + 1)
  return Math.floor((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function buildRelationshipInsight(
  contact: Contact,
  holidays: Holiday[]
): RelationshipInsight {
  const score = calculateRelationshipScore(contact, holidays)
  const upcomingHolidays = contact.religion
    ? holidays.filter(h => {
        const days = daysUntil(h.date)
        return h.religion === contact.religion && days >= 0 && days <= 30
      })
    : []

  return {
    contactId: contact.id,
    contact,
    score,
    upcomingHolidays,
    birthdayDaysUntil: getBirthdayDaysUntil(contact.birthday),
  }
}

export function buildDashboardData(
  contacts: Contact[],
  holidays: Holiday[]
): DashboardData {
  const today = new Date()
  const todayMMDD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const ranked = sortByScore(contacts, holidays)

  // Priority contacts: top 5 highest scores
  const priorityContacts = ranked
    .slice(0, 5)
    .map(({ contact }) => buildRelationshipInsight(contact, holidays))

  // Reconnect suggestions: contacts that are overdue
  const reconnectSuggestions = ranked
    .filter(({ score }) => score.isOverdue)
    .slice(0, 5)
    .map(({ contact }) => buildRelationshipInsight(contact, holidays))

  // Upcoming holidays in next 30 days
  const upcomingHolidays = holidays
    .filter(h => {
      const days = daysUntil(h.date)
      return days >= 0 && days <= 30
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Birthday features (premium)
  const todayBirthdays = contacts.filter(c => {
    if (!c.birthday) return false
    const bday = c.birthday.slice(5) // MM-DD
    return bday === todayMMDD
  })

  const upcomingBirthdays = contacts
    .filter(c => c.birthday)
    .map(c => ({ contact: c, daysUntil: getBirthdayDaysUntil(c.birthday)! }))
    .filter(({ daysUntil: d }) => d > 0 && d <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 10)

  const teamBirthdays = contacts
    .filter(c => c.contactType === 'internal' && c.birthday)
    .filter(c => {
      const d = getBirthdayDaysUntil(c.birthday)
      return d !== undefined && d >= 0 && d <= 7
    })

  const overdueFollowUps = ranked
    .filter(({ score }) => score.isOverdue && score.urgencyLevel === 'high' || score.urgencyLevel === 'critical')
    .map(({ contact }) => contact)
    .slice(0, 5)

  return {
    priorityContacts,
    reconnectSuggestions,
    upcomingHolidays,
    todayBirthdays,
    upcomingBirthdays,
    teamBirthdays,
    overdueFollowUps,
  }
}

export function getContactsWithUpcomingHoliday(
  contacts: Contact[],
  holiday: Holiday
): Contact[] {
  return contacts.filter(c => c.religion === holiday.religion)
}

export function getOverdueContacts(contacts: Contact[], holidays: Holiday[]): Contact[] {
  return contacts.filter(c => {
    const score = calculateRelationshipScore(c, holidays)
    return score.isOverdue
  })
}
