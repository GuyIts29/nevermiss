import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, CheckCircle, AlertCircle, ArrowRight, FileText, Smartphone, Download, FolderOpen } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { PageHeader } from '@/components/Navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { parseCSV, autoDetectColumns, processImport } from '@/services/importService'
import { trackEvent } from '@/services/analyticsService'
import type { ImportPreview, ImportColumn } from '@/types'
import { clsx } from 'clsx'

const CSV_TEMPLATE_HEADERS = 'שם,טלפון,אימייל,יום הולדת,מחלקה,תפקיד,דת,שפה,הערות\n'
const CSV_TEMPLATE_EXAMPLE = 'ישראל ישראלי,0501234567,israel@example.com,1990-05-15,פיתוח,מפתח,Judaism,hebrew,\n'

function downloadCSVTemplate() {
  const bom = '﻿'
  const blob = new Blob([bom + CSV_TEMPLATE_HEADERS + CSV_TEMPLATE_EXAMPLE], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'nevermiss_import_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const CONTACT_FIELDS = [
  { value: '', label: '— Skip this column —' },
  { value: 'name', label: 'Full Name *' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'department', label: 'Department' },
  { value: 'role', label: 'Role/Title' },
  { value: 'religion', label: 'Religion' },
  { value: 'language', label: 'Language' },
  { value: 'notes', label: 'Notes' },
]

type Step = 'upload' | 'map' | 'done'

function StepIndicator({ step }: { step: Step }) {
  const steps: { key: Step; label: string; num: number }[] = [
    { key: 'upload', label: 'Upload', num: 1 },
    { key: 'map', label: 'Map', num: 2 },
    { key: 'done', label: 'Done', num: 3 },
  ]

  const currentIdx = steps.findIndex(s => s.key === step)

  return (
    <div className="flex items-center">
      {steps.map((s, i) => {
        const isActive = s.key === step
        const isDone = i < currentIdx

        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={isDone ? {
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.4)',
                } : isActive ? {
                  background: 'linear-gradient(135deg, #3B82F6, #0EA5E9)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
                } : {
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {isDone ? '✓' : s.num}
              </div>
              <span
                className="text-[10px] font-semibold"
                style={isActive ? { color: '#3B82F6' } : isDone ? { color: '#10B981' } : { color: 'var(--color-text-muted)' }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-4 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: isDone ? '100%' : '0%',
                    background: 'linear-gradient(90deg, #10B981, #3B82F6)',
                  }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function ImportContactsScreen() {
  const navigate = useNavigate()
  const { addContact, groups, updateGroup } = useApp()
  const t = useT()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [columns, setColumns] = useState<ImportColumn[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
  const [step, setStep] = useState<Step>('upload')
  const [dragging, setDragging] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importedIds, setImportedIds] = useState<string[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [groupAssigned, setGroupAssigned] = useState<string | null>(null)

  const handleFile = async (f: File) => {
    setFile(f)
    setImportError(null)
    try {
      const prev = await parseCSV(f)
      setPreview(prev)
      setColumns(autoDetectColumns(prev.headers))
      setStep('map')
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Failed to parse file')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx'))) {
      handleFile(f)
    }
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setImportError(null)
    try {
      const res = await processImport(file, columns)
      res.contacts.forEach(c => addContact(c))
      setImportedIds(res.contacts.map(c => c.id))
      setResult({ imported: res.imported, skipped: res.skipped, errors: res.errors })
      trackEvent('contacts_imported', { count: res.imported })
      setStep('done')
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Import failed — please try again')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="screen-container">
      <PageHeader title={t('import_title')} back />

      <div className="page-content space-y-4 pb-10">
        {/* Import from phone — primary CTA */}
        <button
          type="button"
          onClick={() => navigate('/device-contacts')}
          className="w-full flex items-center gap-3 p-4 rounded-[var(--border-radius-lg)] transition-all active:scale-[0.99]"
          style={{
            background: 'linear-gradient(135deg, #3B82F6, #0EA5E9)',
            boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
          }}
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Smartphone size={20} className="text-white" />
          </div>
          <div className="flex-1 text-start">
            <p className="text-sm font-bold text-white">
              {t('deviceContacts_title')}
            </p>
            <p className="text-xs text-white/80">
              {t('import_fromPhoneDesc')}
            </p>
          </div>
          <ArrowRight size={16} className="text-white shrink-0" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-text-muted)] font-medium">{t('import_orCSV')}</span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        {/* Step indicator */}
        <StepIndicator step={step} />

        {/* Privacy notice */}
        <div
          className="flex items-center gap-2.5 p-3 rounded-[var(--border-radius)]"
          style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '1px solid #BFDBFE' }}
        >
          <span className="text-lg shrink-0">🔒</span>
          <p className="text-xs text-blue-700">
            {t('import_privacy')}
          </p>
        </div>

        {/* Error banner */}
        {importError && (
          <div
            className="flex items-center gap-2.5 p-3 rounded-[var(--border-radius)]"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
          >
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-700">{importError}</p>
          </div>
        )}

        {step === 'upload' && (
          <>
          <div
            className={clsx(
              'rounded-[var(--border-radius-lg)] p-8 text-center transition-all cursor-pointer',
              dragging
                ? 'border-2 border-solid scale-[1.01]'
                : 'border-2 border-dashed'
            )}
            style={dragging ? {
              borderColor: '#3B82F6',
              background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
              boxShadow: '0 4px 20px rgba(59,130,246,0.2)',
            } : {
              borderColor: 'var(--color-border)',
              background: 'var(--color-surface)',
            }}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: dragging
                ? 'linear-gradient(135deg, #3B82F6, #0EA5E9)'
                : 'linear-gradient(135deg, #EFF6FF, #BFDBFE)'
              }}
            >
              <Upload size={28} className={dragging ? 'text-white' : 'text-blue-500'} />
            </div>
            <p className="font-bold text-base text-[var(--color-text-primary)] mb-1">{t('import_dropHere')}</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-5">{t('import_orBrowse')}</p>
            <button
              onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #0EA5E9)' }}
            >
              <FileText size={14} />
              {t('import_chooseFile')}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            <div className="flex items-center justify-center gap-1.5 mt-4">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                📄 CSV
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">{t('import_csvOnly')}</span>
            </div>
          </div>

          {/* BL-051: CSV template download */}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); downloadCSVTemplate() }}
            className="w-full flex items-center gap-3 p-3 rounded-[var(--border-radius)] transition-all hover:opacity-80 active:scale-[0.99]"
            style={{ background: 'var(--color-surface-2)', border: '1px dashed var(--color-border)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
              <Download size={14} className="text-white" />
            </div>
            <div className="flex-1 text-start">
              <p className="text-xs font-bold text-[var(--color-text-primary)]">{t('import_downloadTemplate')}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">{t('import_templateHint')}</p>
            </div>
            <ArrowRight size={12} className="text-[var(--color-text-muted)] shrink-0" />
          </button>
          </>
        )}

        {step === 'map' && preview && (
          <div className="space-y-4">
            {/* File info */}
            <div
              className="flex items-center gap-3 p-3 rounded-[var(--border-radius)]"
              style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '1px solid #BFDBFE' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #0EA5E9)' }}
              >
                <FileText size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{file?.name ?? ''}</p>
                <p className="text-xs text-blue-600">{t('import_rowsDetected', { n: preview.totalRows })}</p>
              </div>
            </div>

            {/* Column mapping */}
            <Card>
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">{t('import_mapColumns')}</h3>
              <div className="space-y-2.5">
                {columns.map((col, i) => (
                  <div key={col.sourceColumn} className="flex items-center gap-2">
                    {/* Source column */}
                    <div
                      className="flex-1 p-2 rounded-lg text-xs font-semibold text-[var(--color-text-secondary)] truncate"
                      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                    >
                      {col.sourceColumn}
                    </div>
                    {/* Arrow */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg, #3B82F6, #0EA5E9)' }}
                    >
                      <ArrowRight size={12} className="text-white" />
                    </div>
                    {/* Target field */}
                    <div className="flex-1">
                      <select
                        value={col.targetField ?? ''}
                        onChange={e => {
                          const updated = [...columns]
                          updated[i] = { ...col, targetField: e.target.value as keyof import('@/types').Contact | null || null }
                          setColumns(updated)
                        }}
                        className="form-input text-xs !py-1.5"
                      >
                        {CONTACT_FIELDS.map(f => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Preview rows */}
            <Card>
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">{t('import_preview')}</h3>
              <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
                <table className="text-xs w-full">
                  <thead>
                    <tr style={{ background: 'var(--color-surface-2)' }}>
                      {preview.headers.map(h => (
                        <th key={h} className="text-left p-2 text-[var(--color-text-muted)] font-semibold border-b border-[var(--color-border)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, i) => (
                      <tr
                        key={`row-${i}`}
                        className="border-b border-[var(--color-border)] last:border-0"
                        style={i % 2 === 0 ? {} : { background: 'var(--color-surface-2)' }}
                      >
                        {preview.headers.map(h => (
                          <td key={h} className="p-2 text-[var(--color-text-secondary)] truncate max-w-[120px]">{row[h] ?? ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" size="md" fullWidth onClick={() => setStep('upload')}>{t('import_back')}</Button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex-1 h-10 rounded-[var(--border-radius)] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 active:scale-[0.99] transition-all"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #0EA5E9)' }}
              >
                {importing ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : null}
                {t('import_importBtn', { n: preview.totalRows })}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && result && (
          <div className="space-y-4 animate-scale-in">
            {/* Success card */}
            <div
              className="rounded-[var(--border-radius-lg)] p-6 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 50%, #6EE7B7 100%)',
                border: '2px solid #34D399',
                boxShadow: '0 6px 24px rgba(52,211,153,0.25)',
              }}
            >
              <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-white/20 pointer-events-none" />
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 animate-celebrate"
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}
              >
                <CheckCircle size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-green-800 mb-1">{t('import_complete')}</h3>
              <p className="text-green-700 text-sm">{t('import_imported', { n: result.imported })}</p>
              {result.skipped > 0 && (
                <p className="text-amber-700 text-sm mt-1">{t('import_skipped', { n: result.skipped })}</p>
              )}

              {/* Stats row */}
              <div className="flex gap-3 mt-4">
                <div className="flex-1 bg-white/50 rounded-xl py-2 px-3">
                  <p className="text-2xl font-black text-green-700">{result.imported}</p>
                  <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wide">Imported</p>
                </div>
                {result.skipped > 0 && (
                  <div className="flex-1 bg-white/50 rounded-xl py-2 px-3">
                    <p className="text-2xl font-black text-amber-600">{result.skipped}</p>
                    <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wide">Skipped</p>
                  </div>
                )}
                <div className="flex-1 bg-white/50 rounded-xl py-2 px-3">
                  <p className="text-2xl font-black text-blue-600">{result.imported + result.skipped}</p>
                  <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wide">Total rows</p>
                </div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={14} className="text-amber-500" />
                  <p className="text-sm font-semibold text-amber-600">{t('import_warnings')}</p>
                </div>
                <ul className="space-y-1">
                  {result.errors.slice(0, 5).map((e) => (
                    <li key={e} className="text-xs text-[var(--color-text-muted)]">{e}</li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Group assignment */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <FolderOpen size={16} style={{ color: 'var(--color-primary)' }} />
                <p className="text-sm font-bold text-[var(--color-text-primary)]">{t('import_addToGroup')}</p>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mb-3">{t('import_addToGroupHint')}</p>

              {groups.length === 0 ? (
                <p className="text-xs text-[var(--color-text-muted)] italic">{t('import_noGroups')}</p>
              ) : groupAssigned ? (
                <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: '#D1FAE5', border: '1px solid #6EE7B7' }}>
                  <CheckCircle size={14} className="text-green-600 shrink-0" />
                  <p className="text-xs font-semibold text-green-700">{t('import_groupAssigned', { name: groupAssigned })}</p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={selectedGroupId}
                    onChange={e => setSelectedGroupId(e.target.value)}
                    className="form-input text-sm flex-1"
                  >
                    <option value="">{t('import_selectGroup')}</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.emoji} {g.name}</option>
                    ))}
                  </select>
                  <button
                    disabled={!selectedGroupId}
                    onClick={() => {
                      const group = groups.find(g => g.id === selectedGroupId)
                      if (!group) return
                      const merged = [...new Set([...group.contactIds, ...importedIds])]
                      updateGroup({ ...group, contactIds: merged, updatedAt: new Date().toISOString() })
                      setGroupAssigned(group.name)
                    }}
                    className="px-3 py-2 rounded-[var(--border-radius)] text-sm font-bold text-white disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                  >
                    {t('import_assignGroup')}
                  </button>
                </div>
              )}
            </Card>

            <button
              onClick={() => navigate('/contacts')}
              className="w-full h-12 rounded-[var(--border-radius)] text-white font-bold text-base flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-[0.99] transition-all"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}
            >
              {t('import_viewContacts')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
