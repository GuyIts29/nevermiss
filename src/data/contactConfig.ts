import type { Language, Religion } from '@/types'

export const LANGUAGE_KEYS: Language[] = [
  'english', 'hebrew', 'arabic', 'russian', 'amharic', 'french', 'spanish', 'other',
]

export const RELIGION_KEYS: Religion[] = [
  'Judaism', 'Islam', 'Christianity', 'Druze', 'Buddhism', 'Hinduism', 'Sikhism', 'Bahai', 'EastAsian', 'Secular',
]

// Religion display order per contact language — all options stay visible, just reordered by relevance
export const LANGUAGE_RELIGION_ORDER: Record<Language, Religion[]> = {
  hebrew:  ['Judaism', 'Islam', 'Christianity', 'Druze', 'Secular', 'Buddhism', 'Hinduism', 'Sikhism', 'Bahai', 'EastAsian'],
  arabic:  ['Islam', 'Christianity', 'Druze', 'Judaism', 'Secular', 'Buddhism', 'Hinduism', 'Sikhism', 'Bahai', 'EastAsian'],
  english: ['Judaism', 'Islam', 'Christianity', 'Buddhism', 'Hinduism', 'Sikhism', 'Bahai', 'EastAsian', 'Druze', 'Secular'],
  russian: ['Christianity', 'Judaism', 'Islam', 'Secular', 'Buddhism', 'Hinduism', 'Sikhism', 'Bahai', 'EastAsian', 'Druze'],
  amharic: ['Christianity', 'Islam', 'Judaism', 'Secular', 'Buddhism', 'Hinduism', 'Sikhism', 'Bahai', 'EastAsian', 'Druze'],
  french:  ['Christianity', 'Islam', 'Judaism', 'Secular', 'Buddhism', 'Hinduism', 'Sikhism', 'Bahai', 'EastAsian', 'Druze'],
  spanish: ['Christianity', 'Islam', 'Judaism', 'Secular', 'Buddhism', 'Hinduism', 'Sikhism', 'Bahai', 'EastAsian', 'Druze'],
  other:   ['Judaism', 'Islam', 'Christianity', 'Druze', 'Buddhism', 'Hinduism', 'Sikhism', 'Bahai', 'EastAsian', 'Secular'],
}

// Clean display values per locale — no emojis, used in CSV template and import normalization
const LANGUAGE_DISPLAY: Record<Language, Record<'en' | 'he', string>> = {
  english: { en: 'English',  he: 'אנגלית'    },
  hebrew:  { en: 'Hebrew',   he: 'עברית'      },
  arabic:  { en: 'Arabic',   he: 'ערבית'      },
  russian: { en: 'Russian',  he: 'רוסית'      },
  amharic: { en: 'Amharic',  he: 'אמהרית'    },
  french:  { en: 'French',   he: 'צרפתית'    },
  spanish: { en: 'Spanish',  he: 'ספרדית'    },
  other:   { en: 'Other',    he: 'אחר'        },
}

const RELIGION_DISPLAY: Record<Religion, Record<'en' | 'he', string>> = {
  Judaism:      { en: 'Judaism',      he: 'יהדות'        },
  Islam:        { en: 'Islam',        he: 'אסלאם'        },
  Christianity: { en: 'Christianity', he: 'נצרות'        },
  Druze:        { en: 'Druze',        he: 'דרוזים'       },
  Buddhism:     { en: 'Buddhism',     he: 'בודהיזם'      },
  Hinduism:     { en: 'Hinduism',     he: 'הינדואיזם'    },
  Sikhism:      { en: 'Sikhism',      he: 'סיקיזם'       },
  Bahai:        { en: "Baha'i",       he: 'בהאי'         },
  EastAsian:    { en: 'East Asian',   he: 'מזרח אסייתי'  },
  Secular:      { en: 'Secular',      he: 'חילוני'       },
}

export function getLanguageDisplayValue(key: Language, locale: 'en' | 'he'): string {
  return LANGUAGE_DISPLAY[key]?.[locale] ?? key
}

export function getReligionDisplayValue(key: Religion, locale: 'en' | 'he'): string {
  return RELIGION_DISPLAY[key]?.[locale] ?? key
}

// Normalization: maps any string (internal key, EN label, HE label) → canonical internal key
function buildLangNorm(): Map<string, Language> {
  const m = new Map<string, Language>()
  for (const k of LANGUAGE_KEYS) {
    m.set(k.toLowerCase(), k)
    m.set(LANGUAGE_DISPLAY[k].en.toLowerCase(), k)
    m.set(LANGUAGE_DISPLAY[k].he.toLowerCase(), k)
  }
  return m
}

function buildRelNorm(): Map<string, Religion> {
  const m = new Map<string, Religion>()
  for (const k of RELIGION_KEYS) {
    m.set(k.toLowerCase(), k)
    m.set(RELIGION_DISPLAY[k].en.toLowerCase(), k)
    m.set(RELIGION_DISPLAY[k].he.toLowerCase(), k)
  }
  return m
}

const LANG_NORM = buildLangNorm()
const REL_NORM = buildRelNorm()

export function normalizeLanguage(raw: string | undefined): Language | undefined {
  if (!raw?.trim()) return undefined
  return LANG_NORM.get(raw.trim().toLowerCase())
}

export function normalizeReligion(raw: string | undefined): Religion | undefined {
  if (!raw?.trim()) return undefined
  return REL_NORM.get(raw.trim().toLowerCase())
}
