import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Crown, Zap, Calendar, Users, RefreshCw, Bell, Star } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { useTheme } from '@/context/ThemeContext'
import { useT } from '@/context/LanguageContext'
import { PageHeader } from '@/components/Navigation'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/EmptyState'
import { ContactCard } from '@/components/ContactCard'
import { HolidayCard } from '@/components/HolidayCard'
import { PremiumFeaturePrompt } from '@/components/PremiumBadge'
import { APP_CONFIG } from '@/config/appConfig'

export function DashboardScreen() {
  const navigate = useNavigate()
  const { contacts, groups, holidays, dashboardData, isPremium, refreshDashboard } = useApp()
  const { theme } = useTheme()
  const t = useT()
  const now = new Date()

  const hour = now.getHours()
  const greeting = hour < 12 ? t('greeting_morning') : hour < 17 ? t('greeting_afternoon') : t('greeting_evening')

  const todayHoliday = dashboardData.upcomingHolidays.find(h =>
    differenceInDays(new Date(h.date), now) === 0
  )
  const tomorrowHoliday = dashboardData.upcomingHolidays.find(h =>
    differenceInDays(new Date(h.date), now) === 1
  )
  const nextHoliday = dashboardData.upcomingHolidays[0]
  const daysToNext = nextHoliday ? differenceInDays(new Date(nextHoliday.date), now) : null

  const hasTodayHighlights = (isPremium && dashboardData.todayBirthdays.length > 0) || !!todayHoliday

  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const [pullDistance, setPullDistance] = useState(0)
  const PULL_THRESHOLD = 64

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if ((scrollRef.current?.scrollTop ?? 0) > 0) return
    const dy = e.touches[0].clientY - touchStartY.current
    if (dy > 0) setPullDistance(Math.min(dy, PULL_THRESHOLD + 16))
  }

  const handleTouchEnd = () => {
    if (pullDistance >= PULL_THRESHOLD) refreshDashboard()
    setPullDistance(0)
  }

  const groupHolidayAlerts = useMemo(() => {
    if (!isPremium) return []
    const today = new Date()
    const cutoff = new Date(today.getTime() + 14 * 86_400_000)
    const results: { holiday: typeof holidays[0]; group: typeof groups[0]; groupContacts: typeof contacts; daysUntil: number }[] = []
    for (const group of groups) {
      if (!group.holidayIds?.length) continue
      const groupContacts = contacts.filter(c => group.contactIds.includes(c.id))
      if (!groupContacts.length) continue
      for (const hid of group.holidayIds) {
        const holiday = holidays.find(h => h.id === hid)
        if (!holiday) continue
        const hDate = new Date(holiday.date)
        hDate.setFullYear(today.getFullYear())
        if (hDate < today) hDate.setFullYear(today.getFullYear() + 1)
        if (hDate > cutoff) continue
        const daysUntil = Math.ceil((hDate.getTime() - today.getTime()) / 86_400_000)
        results.push({ holiday, group, groupContacts, daysUntil })
      }
    }
    return results.sort((a, b) => a.daysUntil - b.daysUntil)
  }, [isPremium, groups, contacts, holidays])

  return (
    <div className="screen-container">
      <PageHeader
        title={APP_CONFIG.appName}
        subtitle={format(now, 'EEEE, MMMM d')}
        right={
          !isPremium ? (
            <button
              onClick={() => navigate('/upgrade')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: '#fff' }}
            >
              <Crown size={10} />
              {t('upgrade')}
            </button>
          ) : undefined
        }
      />

      <div
        ref={scrollRef}
        className="page-content space-y-5"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull-to-refresh indicator */}
        {pullDistance > 0 && (
          <div
            className="flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)] transition-all"
            style={{ height: pullDistance, opacity: pullDistance / PULL_THRESHOLD }}
          >
            <RefreshCw
              size={14}
              className={pullDistance >= PULL_THRESHOLD ? 'animate-spin' : ''}
              style={{ transform: `rotate(${(pullDistance / PULL_THRESHOLD) * 180}deg)` }}
            />
            <span>{pullDistance >= PULL_THRESHOLD ? t('dashboard_release_refresh') : t('dashboard_pull_refresh')}</span>
          </div>
        )}

        {/* Welcome hero banner */}
        <div
          className="relative rounded-[var(--border-radius-lg)] p-5 overflow-hidden animate-scale-in"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
        >
          {/* decorative circles */}
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10"
            style={{ background: 'rgba(255,255,255,0.5)' }} />
          <div className="absolute -right-2 top-10 w-16 h-16 rounded-full opacity-10"
            style={{ background: 'rgba(255,255,255,0.4)' }} />

          <div className="relative z-10">
            <p className="text-white/80 text-xs font-semibold mb-1">{greeting} 👋</p>
            <h2 className="text-white font-extrabold text-xl tracking-tight">
              {contacts.length === 0
                ? t('dashboard_letsStart')
                : contacts.length === 1
                  ? t('dashboard_youHave', { n: 1 })
                  : t('dashboard_youHavePlural', { n: contacts.length })}
            </h2>
            {daysToNext != null && nextHoliday && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-lg">{nextHoliday.emoji}</span>
                <p className="text-white/85 text-sm font-medium">
                  {nextHoliday.name}
                  {daysToNext === 0
                    ? ` ${t('dashboard_holiday_today_suffix')}`
                    : daysToNext === 1
                      ? ` ${t('dashboard_holiday_tomorrow_suffix')}`
                      : ` ${t('dashboard_holiday_in_suffix', { n: daysToNext })}`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Highlights */}
        {hasTodayHighlights && (
          <section className="animate-slide-up">
            <div className="flex items-center gap-1.5 mb-2">
              <Star size={14} className="text-amber-500" />
              <h3 className="section-title">{t('dashboard_today_highlights')}</h3>
            </div>
            <div className="space-y-2">
              {todayHoliday && (
                <button
                  type="button"
                  className="card-interactive rounded-[var(--border-radius)] px-4 py-3 flex items-center gap-3 w-full text-left"
                  style={{
                    background: `linear-gradient(135deg, ${todayHoliday.color}22, ${todayHoliday.color}0a)`,
                    border: `1px solid ${todayHoliday.color}40`,
                  }}
                  onClick={() => navigate(`/calendar/${todayHoliday.id}`)}
                >
                  <span className="text-2xl animate-float">{todayHoliday.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[var(--color-text-primary)]">{t('dashboard_holiday_is_today', { name: todayHoliday.name })}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{t('dashboard_holiday_tap')}</p>
                  </div>
                </button>
              )}
              {isPremium && dashboardData.todayBirthdays.map(contact => (
                <button
                  type="button"
                  key={contact.id}
                  className="card-interactive rounded-[var(--border-radius)] px-4 py-3 flex items-center gap-3 w-full text-left"
                  style={{
                    background: 'linear-gradient(135deg, rgba(236,72,153,0.12), rgba(168,85,247,0.08))',
                    border: '1px solid rgba(236,72,153,0.25)',
                  }}
                  onClick={() => navigate(`/contacts/${contact.id}`)}
                >
                  <span className="text-2xl animate-celebrate">🎂</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[var(--color-text-primary)]">{t('dashboard_birthday_today', { name: contact.name })}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{t('dashboard_birthday_wish')}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Group Holiday Alerts */}
        {groupHolidayAlerts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              📅 {t('group_holiday_alert')}
            </h3>
            {groupHolidayAlerts.map(({ holiday, group, groupContacts, daysUntil }) => (
              <div
                key={`${holiday.id}-${group.id}`}
                className="card !p-3 flex items-start gap-3"
                style={{ borderLeft: `3px solid ${holiday.color}` }}
              >
                <span className="text-2xl leading-none mt-0.5">{holiday.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{holiday.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {daysUntil === 0
                      ? t('dashboard_today_exclaim')
                      : daysUntil === 1
                        ? t('dashboard_in_days', { n: daysUntil })
                        : t('dashboard_in_days_plural', { n: daysUntil })}
                    {' · '}{group.emoji} {group.name}
                    {' · '}{t('dashboard_contacts_count', { n: groupContacts.length })}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const first = groupContacts[0]
                    if (first) navigate(`/greeting?contactId=${first.id}&holidayId=${holiday.id}`)
                    else navigate('/contacts')
                  }}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg shrink-0 text-white"
                  style={{ background: holiday.color }}
                >
                  {t('group_send_to_group')}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Priority contacts */}
        {dashboardData.priorityContacts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Zap size={13} style={{ color: theme.primary }} />
                <h3 className="section-title">{t('dashboard_priority')}</h3>
              </div>
              <button
                onClick={() => navigate('/contacts')}
                className="text-xs font-semibold"
                style={{ color: theme.primary }}
              >
                {t('seeAll')}
              </button>
            </div>
            <div className="space-y-2">
              {dashboardData.priorityContacts.slice(0, 3).map(({ contact, score }, i) => (
                <ContactCard key={contact.id} contact={contact} score={score} staggerIndex={i} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming holidays */}
        {dashboardData.upcomingHolidays.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} style={{ color: theme.primary }} />
                <h3 className="section-title">{t('dashboard_upcoming')}</h3>
              </div>
              <button
                onClick={() => navigate('/calendar')}
                className="text-xs font-semibold"
                style={{ color: theme.primary }}
              >
                {t('nav_calendar')}
              </button>
            </div>
            <div className="space-y-2">
              {dashboardData.upcomingHolidays.slice(0, 3).map((h, i) => (
                <HolidayCard key={h.id} holiday={h} compact staggerIndex={i} />
              ))}
            </div>
          </section>
        )}

        {/* Reconnect suggestions */}
        {dashboardData.reconnectSuggestions.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <RefreshCw size={13} className="text-amber-500" />
                <h3 className="section-title">{t('dashboard_reconnect')}</h3>
              </div>
            </div>
            <div className="space-y-2">
              {dashboardData.reconnectSuggestions.slice(0, 3).map(({ contact, score }, i) => (
                <ContactCard key={contact.id} contact={contact} score={score} staggerIndex={i} />
              ))}
            </div>
          </section>
        )}

        {/* Premium birthday section */}
        {!isPremium && (
          <section>
            <PremiumFeaturePrompt feature={t('premium_feat_birthday_tracking')} />
          </section>
        )}

        {/* Empty state */}
        {contacts.length === 0 && (
          <EmptyState
            emoji="👥"
            title={t('empty_startAdding')}
            description={t('empty_startAddingDesc')}
            action={{
              label: 'Add Contact',
              icon: <Plus size={14} />,
              onClick: () => navigate('/contacts/new'),
            }}
          />
        )}

        {/* Stats */}
        {contacts.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: t('dashboard_contacts'),
                value: contacts.length,
                icon: Users,
                gradient: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              },
              {
                label: t('dashboard_overdue'),
                value: dashboardData.overdueFollowUps.length,
                icon: Bell,
                gradient: 'linear-gradient(135deg, #EF4444, #F97316)',
              },
              {
                label: t('dashboard_holidays'),
                value: dashboardData.upcomingHolidays.length,
                icon: Calendar,
                gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
              },
            ].map(({ label, value, icon: Icon, gradient }) => (
              <Card key={label} className="text-center !p-3 card-gradient">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-1.5 shadow-sm"
                  style={{ background: gradient }}
                >
                  <Icon size={15} className="text-white" />
                </div>
                <div className="text-xl font-extrabold text-[var(--color-text-primary)]">{value}</div>
                <div className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mt-0.5">
                  {label}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Holiday-specific highlight card when one is tomorrow */}
        {tomorrowHoliday && !todayHoliday && (
          <div
            className="rounded-[var(--border-radius-lg)] p-4 flex items-center gap-3 animate-slide-up cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${tomorrowHoliday.color}22, ${tomorrowHoliday.color}0a)`,
              border: `1px solid ${tomorrowHoliday.color}35`,
            }}
            onClick={() => navigate(`/calendar/${tomorrowHoliday.id}`)}
          >
            <span className="text-3xl">{tomorrowHoliday.emoji}</span>
            <div>
              <p className="font-bold text-sm text-[var(--color-text-primary)]">
                {tomorrowHoliday.name} is Tomorrow!
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">Prepare your greetings now</p>
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/contacts/new')}
        className="fixed right-4 bottom-20 w-14 h-14 rounded-full flex items-center justify-center animate-scale-in z-30"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          boxShadow: `0 6px 20px ${theme.shadowColor ?? 'rgba(0,0,0,0.2)'}`,
        }}
        aria-label="Add contact"
      >
        <Plus size={24} className="text-white" />
      </button>
    </div>
  )
}
