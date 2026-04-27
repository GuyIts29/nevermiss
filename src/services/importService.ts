import Papa from 'papaparse'
import type { Contact, ImportPreview, ImportResult, ImportColumn, Language, Religion, InteractionFrequency } from '@/types'
import { generateId } from './storageService'

const DETECTABLE_FIELDS: Array<{ field: keyof Contact; patterns: string[] }> = [
  { field: 'name', patterns: ['name', 'full name', 'fullname', 'contact name', 'שם'] },
  { field: 'phone', patterns: ['phone', 'mobile', 'cell', 'whatsapp', 'טלפון', 'נייד'] },
  { field: 'email', patterns: ['email', 'e-mail', 'mail', 'אימייל'] },
  { field: 'birthday', patterns: ['birthday', 'birth date', 'dob', 'date of birth', 'יום הולדת'] },
  { field: 'department', patterns: ['department', 'dept', 'מחלקה'] },
  { field: 'role', patterns: ['role', 'position', 'title', 'job title', 'תפקיד'] },
  { field: 'religion', patterns: ['religion', 'faith', 'דת'] },
  { field: 'language', patterns: ['language', 'lang', 'שפה'] },
  { field: 'notes', patterns: ['notes', 'comments', 'remarks', 'הערות'] },
]

export function autoDetectColumns(headers: string[]): ImportColumn[] {
  return headers.map(header => {
    const normalized = header.toLowerCase().trim()
    const match = DETECTABLE_FIELDS.find(f =>
      f.patterns.some(p => normalized.includes(p))
    )
    return {
      sourceColumn: header,
      targetField: match?.field ?? null,
    }
  })
}

export async function parseCSV(file: File): Promise<ImportPreview> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields ?? []
        const rows = results.data as Record<string, string>[]
        resolve({
          headers,
          rows: rows.slice(0, 5),
          totalRows: rows.length,
          validRows: rows.filter(r => r[headers[0]]).length,
          errors: results.errors.map(e => e.message),
        })
      },
      error: reject,
    })
  })
}

export async function processImport(
  file: File,
  columns: ImportColumn[]
): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[]
        const contacts: Contact[] = []
        const errors: string[] = []
        let skipped = 0

        rows.forEach((row, idx) => {
          const mapped: Partial<Record<keyof Contact, string>> = {}
          columns.forEach(col => {
            if (col.targetField && row[col.sourceColumn]) {
              mapped[col.targetField] = row[col.sourceColumn].trim()
            }
          })

          if (!mapped.name) {
            errors.push(`Row ${idx + 1}: missing name — skipped`)
            skipped++
            return
          }

          const now = new Date().toISOString()
          const contact: Contact = {
            id: generateId(),
            name: mapped.name!,
            phone: mapped.phone ?? '',
            language: (mapped.language as Language) ?? 'english',
            relationshipType: 'colleague',
            religion: mapped.religion as Religion | undefined,
            notes: mapped.notes,
            importanceLevel: 'normal',
            interactionFrequency: 'monthly' as InteractionFrequency,
            contactType: 'external',
            createdAt: now,
            updatedAt: now,
            birthday: mapped.birthday,
            email: mapped.email,
            department: mapped.department,
            role: mapped.role,
          }
          contacts.push(contact)
        })

        resolve({
          imported: contacts.length,
          skipped,
          errors,
          contacts,
        })
      },
      error: reject,
    })
  })
}
