import Papa from 'papaparse'
import type { Contact, ImportPreview, ImportResult, ImportColumn, InteractionFrequency, CelebrationType } from '@/types'
import { generateId } from './storageService'
import { normalizeLanguage, normalizeReligion } from '@/data/contactConfig'

const DETECTABLE_FIELDS: Array<{ field: keyof Contact; patterns: string[] }> = [
  { field: 'name', patterns: ['name', 'full name', 'fullname', 'contact name', 'שם'] },
  { field: 'phone', patterns: ['phone', 'mobile', 'cell', 'whatsapp', 'טלפון', 'נייד'] },
  { field: 'email', patterns: ['email', 'e-mail', 'mail', 'אימייל'] },
  { field: 'hebrewBirthday', patterns: ['hebrew birthday', 'jewish birthday', 'יום הולדת עברי', 'יום הולדת עברית'] },
  { field: 'birthday', patterns: ['birthday', 'birth date', 'dob', 'date of birth', 'יום הולדת'] },
  { field: 'department', patterns: ['department', 'dept', 'מחלקה'] },
  { field: 'role', patterns: ['role', 'position', 'title', 'job title', 'תפקיד'] },
  { field: 'religion', patterns: ['religion', 'faith', 'דת'] },
  { field: 'language', patterns: ['language', 'lang', 'שפה'] },
  { field: 'notes', patterns: ['notes', 'comments', 'remarks', 'הערות'] },
  { field: 'celebrationType', patterns: ['celebration type', 'celebrationtype', 'celebration', 'סוג חגיגה'] },
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

const CELEBRATION_TYPE_MAP: Record<string, CelebrationType> = {
  jewish: 'Jewish', jewish_celebration: 'Jewish',
  christian: 'Christian',
  muslim: 'Muslim', islam: 'Muslim', islamic: 'Muslim',
  druze: 'Druze',
  secular: 'Secular',
}

function normalizeCelebrationType(raw: string | undefined): CelebrationType | undefined {
  if (!raw) return undefined
  return CELEBRATION_TYPE_MAP[raw.trim().toLowerCase()] ?? undefined
}

function normalizeHebrewBirthday(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const trimmed = raw.trim()
  return /^\d{1,2}-\d{1,2}$/.test(trimmed) ? trimmed : undefined
}

function normalizeBirthday(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(trimmed)
    return isNaN(d.getTime()) ? undefined : trimmed
  }
  const parsed = new Date(trimmed)
  if (isNaN(parsed.getTime())) return undefined
  const y = parsed.getFullYear()
  const m = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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
            language: normalizeLanguage(mapped.language) ?? 'english',
            relationshipType: 'colleague',
            religion: normalizeReligion(mapped.religion),
            celebrationType: normalizeCelebrationType(mapped.celebrationType),
            notes: mapped.notes,
            importanceLevel: 'normal',
            interactionFrequency: 'monthly' as InteractionFrequency,
            contactType: 'external',
            createdAt: now,
            updatedAt: now,
            birthday: normalizeBirthday(mapped.birthday),
            hebrewBirthday: normalizeHebrewBirthday(mapped.hebrewBirthday),
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
