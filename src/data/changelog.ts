import type { ChangelogEntry } from '@/types'

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.0.0',
    date: '2026-04-26',
    title: 'Initial Release — MVP Launch',
    changes: [
      { type: 'feature', description: 'Smart Relationship Intelligence Engine with scoring system' },
      { type: 'feature', description: 'Comprehensive cultural holiday database (Judaism, Islam, Christianity, Druze, Buddhism, Hinduism, Sikhism, Bahá\'í, East Asian, Secular)' },
      { type: 'feature', description: 'Contact CRM with relationship tracking and importance levels' },
      { type: 'feature', description: 'AI-free template-based greeting generator with multi-language support' },
      { type: 'feature', description: 'WhatsApp integration with pre-filled messages (no auto-sending)' },
      { type: 'feature', description: 'Holiday Groups for organizing contacts' },
      { type: 'feature', description: 'Dashboard with priority contacts and reconnect suggestions' },
      { type: 'feature', description: 'Monthly calendar view with holiday visualization' },
      { type: 'feature', description: '6 beautiful themes with random theme on entry' },
      { type: 'feature', description: 'Premium tier with unlimited contacts, groups, and advanced features' },
      { type: 'feature', description: 'Contact import (CSV/XLSX) — Premium only' },
      { type: 'feature', description: 'Birthday tracking and greetings — Premium only' },
      { type: 'feature', description: 'Internal organization mode with department filtering — Premium only' },
      { type: 'feature', description: 'PWA support — installable as a home screen app' },
      { type: 'feature', description: 'Full privacy: all data stored locally, no server uploads' },
    ],
  },
]

export function getLatestVersion(): ChangelogEntry {
  return CHANGELOG[0]
}
