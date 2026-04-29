import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { MessageCircle, Users, Copy, Check, BookOpen, Lightbulb, AlertTriangle, Calendar } from 'lucide-react'
import { useState } from 'react'
import { getHolidayById } from '@/data/holidays'
import type { TranslationKey } from '@/i18n'
import { dir } from '@/i18n'
import { PageHeader } from '@/components/Navigation'
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { copyToClipboard } from '@/services/communicationService'
import { getInitials, getAvatarGradient } from '@/utils/avatarUtils'
import { getHebrewDateStr } from '@/utils/hebrewDateUtils'

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

export function HolidayDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { contacts } = useApp()
  const t = useT()
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const holiday = getHolidayById(id ?? '')
  if (!holiday) {
    return (
      <div className="screen-container">
        <PageHeader title={t('holiday_notFound')} back />
        <div className="page-content">
          <p className="text-[var(--color-text-muted)]">{t('holiday_notFoundDesc')}</p>
        </div>
      </div>
    )
  }

  const relatedContacts = contacts.filter(c => c.religion === holiday.religion)

  const handleCopy = async (text: string, idx: number) => {
    await copyToClipboard(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const rgb = hexToRgb(holiday.color)

  return (
    <div className="screen-container">
      <PageHeader title={holiday.name} back />

      <div className="page-content space-y-4 pb-8">
        {/* Hero banner */}
        <div
          className="rounded-[var(--border-radius-lg)] p-5 text-center relative overflow-hidden animate-scale-in"
          style={{ background: `linear-gradient(135deg, ${holiday.color}dd, ${holiday.color}99)` }}
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative">
            <div className="text-5xl mb-2 animate-float inline-block">{holiday.emoji}</div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">{holiday.name}</h2>
            {holiday.alternativeNames.length > 0 && (
              <p className="text-sm text-white/75 mt-1">
                {holiday.alternativeNames.slice(0, 2).join(' · ')}
              </p>
            )}
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ background: 'rgba(255,255,255,0.25)' }}
              >
                <Calendar size={10} />
                {format(new Date(holiday.date), 'MMMM d, yyyy')}
              </span>
              {holiday.dateType === 'hebrew' && (
                <span
                  className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                  style={{ background: 'rgba(255,255,255,0.20)' }}
                  dir="rtl"
                >
                  {getHebrewDateStr(holiday.date)}
                </span>
              )}
              <span
                className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ background: 'rgba(255,255,255,0.25)' }}
              >
                {t(`religion_${holiday.religion}` as TranslationKey)}
              </span>
              {holiday.type === 'major' && (
                <span
                  className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.9)', color: holiday.color }}
                >
                  {t('holiday_major')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card stagger-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `rgba(${rgb}, 0.15)` }}
            >
              <BookOpen size={13} style={{ color: holiday.color }} />
            </div>
            <h3 className="font-extrabold text-sm text-[var(--color-text-primary)]">{t('holiday_about')}</h3>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {holiday.description}
          </p>
        </div>

        {/* Greetings */}
        <div className="card stagger-2">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `rgba(${rgb}, 0.15)` }}
            >
              <MessageCircle size={13} style={{ color: holiday.color }} />
            </div>
            <h3 className="font-extrabold text-sm text-[var(--color-text-primary)]">{t('holiday_greetingGuide')}</h3>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">{holiday.greetingGuidance}</p>
          <div className="space-y-2">
            {holiday.greetings.hebrew?.map((g, i) => (
              <GreetingRow key={`he-${i}`} text={g} lang={t('holiday_Hebrew')} langCode="he" accentColor={holiday.color} onCopy={() => handleCopy(g, i)} copied={copiedIdx === i} />
            ))}
            {holiday.greetings.arabic?.map((g, i) => (
              <GreetingRow key={`ar-${i}`} text={g} lang={t('holiday_Arabic')} langCode="ar" accentColor={holiday.color} onCopy={() => handleCopy(g, 100 + i)} copied={copiedIdx === 100 + i} />
            ))}
            {holiday.greetings.english.map((g, i) => (
              <GreetingRow key={`en-${i}`} text={g} lang={t('holiday_English')} langCode="en" accentColor={holiday.color} onCopy={() => handleCopy(g, 200 + i)} copied={copiedIdx === 200 + i} />
            ))}
            {holiday.greetings.transliteration?.map((g, i) => (
              <GreetingRow key={`tr-${i}`} text={g} lang={t('holiday_Pronunciation')} langCode="en" accentColor={holiday.color} onCopy={() => handleCopy(g, 300 + i)} copied={copiedIdx === 300 + i} italic />
            ))}
          </div>
        </div>

        {/* Do/Don't */}
        {(holiday.doList || holiday.dontList) && (
          <div className="card stagger-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(16,185,129,0.12)' }}>
                <Lightbulb size={13} className="text-emerald-500" />
              </div>
              <h3 className="font-extrabold text-sm text-[var(--color-text-primary)]">{t('holiday_tips')}</h3>
            </div>
            {holiday.doList && (
              <div
                className="mb-3 p-3 rounded-[var(--border-radius)]"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <p className="text-xs font-bold text-emerald-600 mb-2">✅ {t('holiday_do')}</p>
                <ul className="space-y-1.5">
                  {holiday.doList.map((item, i) => (
                    <li key={i} className="text-sm text-[var(--color-text-secondary)] flex gap-2 items-start">
                      <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {holiday.dontList && (
              <div
                className="p-3 rounded-[var(--border-radius)]"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
              >
                <p className="text-xs font-bold text-red-500 mb-2">❌ {t('holiday_dont')}</p>
                <ul className="space-y-1.5">
                  {holiday.dontList.map((item, i) => (
                    <li key={i} className="text-sm text-[var(--color-text-secondary)] flex gap-2 items-start">
                      <span className="text-red-400 shrink-0 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Sensitivity notes */}
        {holiday.sensitivityNotes && (
          <div
            className="card stagger-4 flex gap-3"
            style={{ borderLeft: `3px solid #F59E0B` }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(245,158,11,0.12)' }}>
              <AlertTriangle size={13} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-600 mb-1">{t('holiday_sensitivity')}</p>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{holiday.sensitivityNotes}</p>
            </div>
          </div>
        )}

        {/* Contacts for this holiday */}
        {relatedContacts.length > 0 && (
          <div className="card stagger-5">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `rgba(${rgb}, 0.15)` }}
              >
                <Users size={13} style={{ color: holiday.color }} />
              </div>
              <h3 className="font-extrabold text-sm text-[var(--color-text-primary)]">
                {t('holiday_yourContacts', { n: relatedContacts.length })}
              </h3>
            </div>
            <div className="space-y-2">
              {relatedContacts.slice(0, 3).map(c => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-2.5 rounded-[var(--border-radius)] cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: `rgba(${rgb}, 0.06)`, border: `1px solid rgba(${rgb}, 0.15)` }}
                  onClick={() => navigate(`/greeting?contactId=${c.id}&holidayId=${holiday.id}`)}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: getAvatarGradient(c.name) }}
                  >
                    {getInitials(c.name)}
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)] flex-1">{c.name}</span>
                  <div className="flex items-center gap-1 text-xs font-semibold shrink-0" style={{ color: holiday.color }}>
                    <MessageCircle size={11} />
                    {t('holiday_sendGreeting')}
                  </div>
                </div>
              ))}
              {relatedContacts.length > 3 && (
                <p className="text-xs text-center text-[var(--color-text-muted)] pt-1">
                  {t('holiday_moreContacts', { n: relatedContacts.length - 3 })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action */}
        <button
          onClick={() => navigate(`/greeting?holidayId=${holiday.id}`)}
          className="w-full h-13 rounded-[var(--border-radius)] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all"
          style={{
            background: `linear-gradient(135deg, ${holiday.color}, ${holiday.color}bb)`,
            boxShadow: `0 4px 20px rgba(${rgb}, 0.35)`,
            height: '52px',
          }}
        >
          <MessageCircle size={16} />
          {t('holiday_createGreeting')}
        </button>

        <div className="h-2" />
      </div>
    </div>
  )
}

function GreetingRow({
  text, lang, langCode, accentColor, onCopy, copied, italic,
}: {
  text: string
  lang: string
  langCode: string
  accentColor: string
  onCopy: () => void
  copied: boolean
  italic?: boolean
}) {
  const t = useT()
  return (
    <div
      className="flex items-start gap-2 p-2.5 rounded-[var(--border-radius)]"
      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex-1">
        <span
          className="text-[10px] font-bold uppercase tracking-wide block mb-0.5"
          style={{ color: accentColor }}
        >
          {lang}
        </span>
        <p
          className={`text-sm text-[var(--color-text-primary)] leading-relaxed ${italic ? 'italic' : ''}`}
          dir={dir(langCode)}
        >
          {text}
        </p>
      </div>
      <button
        onClick={onCopy}
        className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-[var(--color-surface)] transition-colors shrink-0 mt-4"
        aria-label={t('greeting_copy')}
      >
        {copied
          ? <Check size={14} className="text-green-500" />
          : <Copy size={14} className="text-[var(--color-text-muted)]" />
        }
      </button>
    </div>
  )
}
