import { useNavigate } from 'react-router-dom'
import { format, differenceInDays } from 'date-fns'
import type { Holiday } from '@/types'
import { useT } from '@/context/LanguageContext'
import type { TranslationKey } from '@/i18n'
import { getHebrewDateStr } from '@/utils/hebrewDateUtils'

interface HolidayCardProps {
  holiday: Holiday
  compact?: boolean
  staggerIndex?: number
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

export function HolidayCard({ holiday, compact, staggerIndex }: HolidayCardProps) {
  const navigate = useNavigate()
  const t = useT()
  const daysUntil = differenceInDays(new Date(holiday.date), new Date())
  const staggerClass = staggerIndex != null ? `stagger-${Math.min(staggerIndex + 1, 5)}` : ''

  const isToday = daysUntil === 0
  const isSoon = daysUntil >= 0 && daysUntil <= 3
  const badgeText = daysUntil === 0 ? `🎉 ${t('today')}!` : daysUntil === 1 ? t('tomorrow') : `${daysUntil}${t('days')}`

  if (compact) {
    return (
      <div
        className={`card-interactive rounded-[var(--border-radius)] flex items-center gap-3 px-3 py-2.5 ${staggerClass}`}
        style={{
          background: `linear-gradient(135deg, rgba(${hexToRgb(holiday.color)}, 0.10) 0%, rgba(${hexToRgb(holiday.color)}, 0.04) 100%)`,
          border: `1px solid rgba(${hexToRgb(holiday.color)}, 0.25)`,
          borderLeft: `3px solid ${holiday.color}`,
          boxShadow: `0 2px 8px rgba(${hexToRgb(holiday.color)}, 0.10)`,
          transition: 'all 0.2s ease',
        }}
        onClick={() => navigate(`/calendar/${holiday.id}`)}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
          style={{
            background: `linear-gradient(135deg, rgba(${hexToRgb(holiday.color)}, 0.25), rgba(${hexToRgb(holiday.color)}, 0.10))`,
          }}
        >
          {holiday.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-[var(--color-text-primary)] truncate">{holiday.name}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {format(new Date(holiday.date), 'MMM d')} · {t(`religion_${holiday.religion}` as TranslationKey)}
          </p>
          {holiday.dateType === 'hebrew' && (
            <p className="text-[10px] text-[var(--color-text-muted)] opacity-75" dir="rtl">
              {getHebrewDateStr(holiday.date)}
            </p>
          )}
        </div>
        <div className="shrink-0">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: isToday ? holiday.color : `rgba(${hexToRgb(holiday.color)}, 0.18)`,
              color: isToday ? '#fff' : holiday.color,
            }}
          >
            {badgeText}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`card card-interactive overflow-hidden ${staggerClass}`}
      style={{ padding: 0 }}
      onClick={() => navigate(`/calendar/${holiday.id}`)}
    >
      {/* Color header strip */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          background: `linear-gradient(135deg, ${holiday.color}ee, ${holiday.color}99)`,
        }}
      >
        <div className="text-3xl animate-float">{holiday.emoji}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{holiday.name}</h3>
          <p className="text-xs text-white/75 mt-0.5">
            {t(`religion_${holiday.religion}` as TranslationKey)} · {format(new Date(holiday.date), 'MMMM d, yyyy')}
          </p>
          {holiday.dateType === 'hebrew' && (
            <p className="text-[10px] text-white/60 mt-0.5" dir="rtl">
              {getHebrewDateStr(holiday.date)}
            </p>
          )}
        </div>
        <div
          className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: isSoon ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
            color: '#fff',
            backdropFilter: 'blur(4px)',
          }}
        >
          {daysUntil === 0 ? `🎉 ${t('today')}!` : daysUntil < 0 ? t('calendar_passed') : `${daysUntil}${t('days')}`}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
          {holiday.description}
        </p>
      </div>
    </div>
  )
}
