import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { PageHeader } from '@/components/Navigation'
import { HolidayCard } from '@/components/HolidayCard'
import { EmptyState } from '@/components/EmptyState'
import { HOLIDAYS, RELIGION_LABELS, RELIGION_COLORS } from '@/data/holidays'
import { useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import type { Religion } from '@/types'
import type { TranslationKey } from '@/i18n'
import { clsx } from 'clsx'

const ALL_RELIGIONS = Object.keys(RELIGION_LABELS) as Religion[]

export function CalendarScreen() {
  const t = useT()
  const { theme } = useTheme()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [filterReligion, setFilterReligion] = useState<Religion | 'all'>('all')
  const [showFilter, setShowFilter] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDow = monthStart.getDay()

  const filtered = HOLIDAYS.filter(h =>
    filterReligion === 'all' || h.religion === filterReligion
  )

  const getHolidaysForDay = (date: Date) =>
    filtered.filter(h => isSameDay(new Date(h.date), date))

  const selectedHolidays = selectedDate
    ? getHolidaysForDay(selectedDate)
    : filtered.filter(h => isSameMonth(new Date(h.date), currentMonth))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="screen-container">
      <PageHeader
        title={t('calendar_title')}
        subtitle={format(currentMonth, 'MMMM yyyy')}
        right={
          <button
            onClick={() => setShowFilter(f => !f)}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-2)] transition-colors relative"
            aria-label="Filter by religion"
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
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setCurrentMonth(subMonths(currentMonth, 1)); setSelectedDate(null) }}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} className="text-[var(--color-text-secondary)]" />
          </button>

          {/* Gradient pill for current month */}
          <div
            className="px-4 py-1.5 rounded-full shadow-sm"
            style={{ background: `linear-gradient(135deg, ${theme.primary}22, ${theme.secondary}33)` }}
          >
            <h3
              className="font-bold text-sm"
              style={{ color: theme.primary }}
            >
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
          </div>

          <button
            onClick={() => { setCurrentMonth(addMonths(currentMonth, 1)); setSelectedDate(null) }}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={18} className="text-[var(--color-text-secondary)]" />
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
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isTodayDay = isToday(day)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(isSameDay(day, selectedDate!) ? null : day)}
                  className={clsx(
                    'relative aspect-square flex flex-col items-center justify-center rounded-lg transition-all text-xs font-medium',
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
                  {format(day, 'd')}
                  {dayHolidays.length > 0 && (
                    <div className="flex gap-0.5 absolute bottom-0.5">
                      {dayHolidays.slice(0, 3).map((h) => (
                        <div
                          key={h.id}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : h.color }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Holiday list */}
        <section>
          <h3 className="section-title mb-2">
            {selectedDate
              ? t('calendar_holidaysOn', { date: format(selectedDate, 'MMMM d') })
              : t('calendar_allHolidaysIn', { month: format(currentMonth, 'MMMM') })
            }
            <span className="ml-2 text-[var(--color-text-muted)] font-normal">
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
