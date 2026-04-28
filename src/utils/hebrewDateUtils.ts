import { HDate, gematriya } from '@hebcal/core'

const HEBREW_MONTHS = [
  '', 'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול',
  'תשרי', 'חשוון', 'כסלו', 'טבת', 'שבט', 'אדר', 'אדר ב׳',
] as const

/**
 * Converts a stored Hebrew birthday ("DD-MM", e.g. "03-01" = 3 Nisan) to its
 * Gregorian equivalent in the given calendar year. Returns null if the month
 * does not exist in that Hebrew year (e.g. Adar II in a non-leap year).
 */
export function hebrewBirthdayToGregorianInCalendarYear(
  hebrewBirthday: string,
  gregorianYear: number
): Date | null {
  const parts = hebrewBirthday.split('-').map(Number)
  if (parts.length < 2 || !parts[0] || !parts[1]) return null
  const [hDay, hMonth] = parts
  // A Hebrew year roughly spans gregorianYear-1 and gregorianYear.
  // We try both nearby Hebrew years and pick the one that lands in gregorianYear.
  const baseHYear = gregorianYear + 3760
  for (const hYear of [baseHYear, baseHYear + 1]) {
    try {
      const greg = new HDate(hDay, hMonth, hYear).greg()
      if (greg.getFullYear() === gregorianYear) return greg
    } catch {
      // invalid combo (e.g. day 30 in a month with 29 days)
    }
  }
  return null
}

/** Returns Hebrew date string in gematria format: "ה׳ באייר תשפ״ו" */
export function getHebrewDateStr(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const localDate = new Date(y, m - 1, d)
  const hd = new HDate(localDate)
  const monthIdx = hd.getMonth()
  const monthName = (HEBREW_MONTHS[monthIdx as keyof typeof HEBREW_MONTHS] as string | undefined) ?? ''
  return `${gematriya(hd.getDate())} ב${monthName} ${gematriya(hd.getFullYear())}`
}
