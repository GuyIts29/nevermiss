import type { GroupPurpose } from '@/types'

// Base holiday IDs (without year suffix) suggested per group purpose
export const SUGGESTED_BASES: Record<GroupPurpose, string[]> = {
  family:    ['rosh-hashana', 'yom-kippur', 'sukkot', 'hanukkah', 'passover', 'shavuot', 'new-year'],
  friends:   ['rosh-hashana', 'hanukkah', 'passover', 'new-year', 'israel-independence-day'],
  work:      ['rosh-hashana', 'passover', 'israel-independence-day', 'labor-day', 'new-year'],
  clients:   ['rosh-hashana', 'passover', 'new-year', 'eid-al-fitr', 'christmas'],
  hr:        ['rosh-hashana', 'yom-kippur', 'sukkot', 'hanukkah', 'passover', 'shavuot', 'israel-independence-day', 'labor-day', 'international-womens-day', 'new-year'],
  community: ['rosh-hashana', 'passover', 'israel-independence-day', 'labor-day', 'new-year', 'eid-al-fitr'],
  custom:    [],
}
