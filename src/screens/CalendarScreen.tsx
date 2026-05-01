import { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { HDate, gematriya } from '@hebcal/core'
import { PageHeader } from '@/components/Navigation'
import { HolidayCard } from '@/components/HolidayCard'
import { EmptyState } from '@/components/EmptyState'
import { HOLIDAYS, RELIGION_LABELS, RELIGION_COLORS } from '@/data/holidays'
import { useApp } from '@/context/AppContext'
import { useT, useLang } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { hebrewBirthdayToGregorianInCalendarYear, formatHebrewBirthdayDisplay } from '@/utils/hebrewDateUtils'
import type { Contact, Religion } from '@/types'
import type { TranslationKey } from '@/i18n'
import { clsx } from 'clsx'

const ALL_RELIGIONS = Object.keys(RELIGION_LABELS) as Religion[]

// Hebrew month names (index = month number from HDate.getMonth())
const HEBREW_MONTHS = ['', 'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול', 'תשרי', 'חשוון', 'כסלו', 'טבת', 'שבט', 'אדר', 'אדר ב׳'] as const

function getHDate(date: Date) { return new HDate(date) }
function hebrewDayGematriya(date: Date): string { return gematriya(getHDate(date).getDate()) }
function hebrewMonthName(monthNum: number): string {
  return (HEBREW_MONTHS[monthNum as keyof typeof HEBREW_MONTHS] as string | undefined) ?? ''
}

type BirthdayEntry = { contact: Contact; birthdayType: 'hebrew' | 'gregorian' }

export function CalendarScreen() {
  const t = useT()
  const { lang } = useLang()
  const isRTL = lang === 'he'
  const { theme } = useTheme()
  const { contacts } = useApp()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [filterReligion, setFilterReligion] = useState<Religion | 'all'>('all')
  const [showFilter, setShowFilter] = useState(false)

  // Build a map of "YYYY-MM-DD" → BirthdayEntry[] for birthdays in the visible month.
  // Hebrew and Gregorian birthdays are treated independently — both shown if present.
  const birthdayMap = useMemo(() => {
    const map = new Map<string, BirthdayEntry[]>()
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth() // 0-based

    for (const c of contacts) {
      if (c.hebrewBirthday) {
        const greg = hebrewBirthdayToGregorianInCalendarYear(c.hebrewBirthday, year)
        if (greg && greg.getMonth() === month) {
          const key = format(greg, 'yyyy-MM-dd')
          const list = map.get(key) ?? []
          list.push({ contact: c, birthdayType: 'hebrew' })
          map.set(key, list)
        }
      }
      if (c.birthday) {
        const [, bm, bd] = c.birthday.split('-').map(Number)
        if (bm - 1 === month) {
          const bDate = new Date(year, month, bd)
          const key = format(bDate, 'yyyy-MM-dd')
          const list = map.get(key) ?? []
          list.push({ contact: c, birthdayType: 'gregorian' })
          map.set(key, list)
        }
      }
    }
    return map
  }, [contacts, currentMonth])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDow = monthStart.getDay()

  // Hebrew months that appear in the current Gregorian month (derived from currentMonth, not days)
  const hebrewMonthsLabel = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const allDays = eachDayOfInterval({ start, end })
    const seen = new Set<number>()
    allDays.forEach(d => seen.add(getHDate(d).getMonth()))
    return Array.from(seen).map(m => hebrewMonthName(m)).filter(Boolean).join(' – ')
  }, [currentMonth])

  const filtered = HOLIDAYS.filter(h =>
    filterReligion === 'all' || h.religion === filterReligion
  )

  // Compare dates using numeric YYYYMMDD to avoid timezone shifts on ISO strings
  const getHolidaysForDay = (date: Date) => {
    const dayNum = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
    return filtered.filter(h => {
      const [sy, sm, sd] = h.date.split('-').map(Number)
      const startNum = sy * 10000 + sm * 100 + sd
      if (!h.endDate) return startNum === dayNum
      const [ey, em, ed] = h.endDate.split('-').map(Number)
      return dayNum >= startNum && dayNum <= (ey * 10000 + em * 100 + ed)
    })
  }

  const selectedHolidays = selectedDate
    ? getHolidaysForDay(selectedDate)
    : (() => {
        const curYM = currentMonth.getFullYear() * 100 + (currentMonth.getMonth() + 1)
        return filtered
          .filter(h => {
            const [sy, sm] = h.date.split('-').map(Number)
            const [ey, em] = (h.endDate ?? h.date).split('-').map(Number)
            return (sy * 100 + sm) <= curYM && (ey * 100 + em) >= curYM
          })
          .sort((a, b) => a.date.localeCompare(b.date))
      })()

  return (
    <div className="screen-container">
      <PageHeader
        title={t('calendar_title')}
        subtitle={format(currentMonth, 'MMMM yyyy')}
        right={
          <button
            onClick={() => setShowFilter(f => !f)}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-2)] transition-colors relative"
            aria-label={t('calendar_filterByReligion')}
          >
            <Filter size={16} className="text-[var(--color-text-muted)]" />
            {filterReligion !== 'all' && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--color-primary)]" />
            )}
          </button>
        }
      />

      <div className="page-content space-y-4">
        {/* Filter bar */}
        {showFilter && (
          <div className="animate-slide-down">
            <p className="text-xs text-[var(--color-text-muted)] mb-2">{t('calendar_filterByReligion')}</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterReligion('all')}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all',
                  filterReligion === 'all'
                    ? 'text-white shadow-sm'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
                )}
                style={filterReligion === 'all'
                  ? { background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }
                  : undefined
                }
              >
                {t('calendar_all')}
              </button>
              {ALL_RELIGIONS.map(r => (
                <button
                  key={r}
                  onClick={() => setFilterReligion(r)}
                  className={clsx(
                    'px-3 py-1 rounded-full text-xs font-medium transition-all',
                    filterReligion === r ? 'text-white shadow-sm' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
                  )}
                  style={filterReligion === r
                    ? { background: `linear-gradient(135deg, ${RELIGION_COLORS[r]}, ${RELIGION_COLORS[r]}cc)` }
                    : undefined
                  }
                >
                  {t(`religion_${r}` as TranslationKey)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Month navigation */}
        <div className="flex items-center justify-between" dir="ltr">
          <button
            onClick={() => { setCurrentMonth(subMonths(currentMonth, 1)); setSelectedDate(null) }}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
            aria-label={t('calendar_prevMonth')}
          >
            {isRTL
              ? <ChevronRight size={18} className="text-[var(--color-text-secondary)]" />
              : <ChevronLeft size={18} className="text-[var(--color-text-secondary)]" />}
          </button>

          {/* Gradient pill for current month */}
          <div
            className="px-4 py-2 rounded-full shadow-sm text-center"
            style={{ background: `linear-gradient(135deg, ${theme.primary}22, ${theme.secondary}33)` }}
          >
            <h3
              className="font-bold text-sm leading-tight"
              style={{ color: theme.primary }}
            >
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            {hebrewMonthsLabel && (
              <p className="text-[11px] font-medium leading-tight mt-0.5 opacity-80" style={{ color: theme.primary }}>
                {hebrewMonthsLabel}
              </p>
            )}
          </div>

          <button
            onClick={() => { setCurrentMonth(addMonths(currentMonth, 1)); setSelectedDate(null) }}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
            aria-label={t('calendar_nextMonth')}
          >
            {isRTL
              ? <ChevronLeft size={18} className="text-[var(--color-text-secondary)]" />
              : <ChevronRight size={18} className="text-[var(--color-text-secondary)]" />}
          </button>
        </div>

        {/* Calendar grid */}
        <div className="card !p-3">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const).map(d => (
              <div key={d} className="text-center text-xs font-medium text-[var(--color-text-muted)] py-1">{d[0]}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: startDow }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map(day => {
              const dayHolidays = getHolidaysForDay(day)
              const dayBirthdays = birthdayMap.get(format(day, 'yyyy-MM-dd')) ?? []
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isTodayDay = isToday(day)
              const hDay = hebrewDayGematriya(day)
              const hDate = getHDate(day)
              const isRoshChodesh = hDate.getDate() === 1
              const hLabel = isRoshChodesh
                ? `א׳ ${hebrewMonthName(hDate.getMonth())}`
                : hDay

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(isSameDay(day, selectedDate!) ? null : day)}
                  className={clsx(
                    'relative flex flex-col items-center justify-center rounded-lg transition-all text-xs font-medium min-h-[2.75rem] py-0.5',
                    !isSelected && !isTodayDay && 'hover:bg-[var(--color-surface-2)] text-[var(--color-text-primary)]',
                    !isSelected && isTodayDay && 'text-white font-bold',
                    isSelected && 'text-white font-bold shadow-md',
                    dayHolidays.length > 0 && !isSelected && !isTodayDay && 'font-bold'
                  )}
                  style={
                    isSelected
                      ? { background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }
                      : isTodayDay
                        ? { background: `linear-gradient(135deg, ${theme.primary}99, ${theme.secondary}99)` }
                        : undefined
                  }
                >
                  <span>{format(day, 'd')}</span>
                  <span
                    className="text-[8px] leading-none mt-px"
                    style={{ opacity: isSelected || isTodayDay ? 0.85 : 0.45, direction: 'rtl' }}
                  >
                    {hLabel}
                  </span>
                  {(dayHolidays.length > 0 || dayBirthdays.length > 0) && (
                    <div className="flex gap-0.5 absolute bottom-0.5">
                      {dayHolidays.slice(0, 2).map((h) => (
                        <div
                          key={h.id}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : h.color }}
                        />
                      ))}
                      {dayBirthdays.length > 0 && (
                        <div
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : '#EC4899' }}
                        />
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Birthday list — visible when a day is selected that has birthdays, or when any birthdays exist this month */}
        {(() => {
          const bdays: BirthdayEntry[] = selectedDate
            ? (birthdayMap.get(format(selectedDate, 'yyyy-MM-dd')) ?? [])
            : Array.from(birthdayMap.values()).flat()
          if (bdays.length === 0) return null
          return (
            <section>
              <h3 className="section-title mb-2">
                {selectedDate
                  ? t('calendar_birthdaysOn', { date: format(selectedDate, 'MMMM d') })
                  : t('calendar_birthdays')
                }
                <span className="ms-2 text-[var(--color-text-muted)] font-normal">({bdays.length})</span>
              </h3>
              <div className="space-y-2">
                {bdays.map(({ contact: c, birthdayType }) => (
                  <div
                    key={`${c.id}-${birthdayType}`}
                    className="card !p-3 flex items-center gap-3"
                    style={{ [isRTL ? 'borderRight' : 'borderLeft']: '3px solid #EC4899' }}
                  >
                    <span className="text-xl shrink-0">🎂</span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{c.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {t('calendar_birthdayLabel')}
                        {birthdayType === 'hebrew' && c.hebrewBirthday && (
                          <span className="mr-1 ml-1 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full" dir="rtl">
                            {formatHebrewBirthdayDisplay(c.hebrewBirthday)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })()}

        {/* Holiday list */}
        <section>
          <h3 className="section-title mb-2">
            {selectedDate
              ? t('calendar_holidaysOn', { date: format(selectedDate, 'MMMM d') })
              : t('calendar_allHolidaysIn', { month: format(currentMonth, 'MMMM') })
            }
            <span className="ms-2 text-[var(--color-text-muted)] font-normal">
              ({selectedHolidays.length})
            </span>
          </h3>
          <div className="space-y-2">
            {selectedHolidays.length === 0 ? (
              <EmptyState
                emoji="📅"
                title={t('calendar_noHolidays')}
                description={selectedDate ? t('calendar_noHolidaysDay') : t('calendar_noHolidaysMonth')}
              />
            ) : (
              selectedHolidays.map(h => (
                <HolidayCard key={h.id} holiday={h} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
