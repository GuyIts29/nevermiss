import { HDate, gematriya } from '@hebcal/core'

const HEBREW_MONTHS = [
  '', 'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול',
  'תשרי', 'חשוון', 'כסלו', 'טבת', 'שבט', 'אדר', 'אדר ב׳',
] as const

/** Returns Hebrew date string in gematria format: "ה׳ באייר תשפ״ו" */
export function getHebrewDateStr(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const localDate = new Date(y, m - 1, d)
  const hd = new HDate(localDate)
  const monthIdx = hd.getMonth()
  const monthName = (HEBREW_MONTHS[monthIdx as keyof typeof HEBREW_MONTHS] as string | undefined) ?? ''
  return `${gematriya(hd.getDate())} ב${monthName} ${gematriya(hd.getFullYear())}`
}
