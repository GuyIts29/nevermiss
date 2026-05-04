import type { Holiday } from '@/types'

export function getHolidayDisplayName(holiday: Holiday, lang: string): string {
  if (lang !== 'he') return holiday.name
  return holiday.alternativeNames.find(n => /[֐-׿]/.test(n)) ?? holiday.name
}
