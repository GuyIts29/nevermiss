import Papa from 'papaparse'
import type { Contact } from '@/types'

export function exportContactsToCSV(contacts: Contact[]): void {
  const rows = contacts.map(c => ({
    Name: c.name,
    Phone: c.phone,
    Email: c.email ?? '',
    Birthday: c.birthday ?? '',
    'Hebrew Birthday': c.hebrewBirthday ?? '',
    Religion: c.religion ?? '',
    'Celebration Type': c.celebrationType ?? '',
    Language: c.language,
    'Relationship Type': c.relationshipType,
    'Importance Level': c.importanceLevel,
    'Contact Frequency': c.interactionFrequency,
    'Contact Type': c.contactType,
    Department: c.department ?? '',
    Role: c.role ?? '',
    Team: c.team ?? '',
    Notes: c.notes ?? '',
    'Last Contact': c.lastContactDate ?? '',
  }))

  const csv = Papa.unparse(rows, { header: true })
  // BOM prefix so Excel opens Hebrew text correctly
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `nevermiss-contacts-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
