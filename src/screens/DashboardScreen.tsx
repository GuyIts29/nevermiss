import { useNavigate } from 'react-router-dom'
import { Plus, Crown, Zap, Calendar, Users, RefreshCw, Gift, Bell, Star } from 'lucide-react'
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

const AVATAR_GRADIENTS = [
  ['#FF6B6B', '#FF8E53'], ['#4ECDC4', '#2196F3'], ['#A855F7', '#6366F1'],
  ['#F59E0B', '#EF4444'], ['#10B981', '#059669'], ['#3B82F6', '#0EA5E9'],
  ['#EC4899', '#8B5CF6'], ['#F97316', '#FBBF24'],
]

function getAvatarGradient(name: string) {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const [a, b] = AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length]
  return `linear-gradient(135deg, ${a}, ${b})`
}

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

export function DashboardScreen() {
  const navigate = useNavigate()
  const { contacts, dashboardData, isPremium, refreshDashboard } = useApp()
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

  const highlightHoliday = todayHoliday ?? tomorrowHoliday
  const hasTodayHighlights = (isPremium && dashboardData.todayBirthdays.length > 0) || !!todayHoliday

  return (
    <div className="screen-container">
      <PageHeader
        title={APP_CONFIG.appName}
        subtitle={format(now, 'EEEE, MMMM d')}
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={refreshDashboard}
              className="p-1.5 rounded-xl hover:bg-[var(--color-surface-2)] transition-all active:scale-90"
              aria-label="Refresh"
            >
              <RefreshCw size={15} className="text-[var(--color-text-muted)]" />
            </button>
            {!isPremium && (
              <button
                onClick={() => navigate('/upgrade')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: '#fff' }}
              >
                <Crown size={10} />
                {t('upgrade')}
              </button>
            )}
          </div>
        }
      />

      <div className="page-content space-y-5">

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
                  {daysToNext === 0 ? ' — Today! 🎉' : daysToNext === 1 ? ' — Tomorrow!' : ` in ${daysToNext} days`}
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
              <h3 className="section-title">Today's Highlights</h3>
            </div>
            <div className="space-y-2">
              {todayHoliday && (
                <div
                  className="card-interactive rounded-[var(--border-radius)] px-4 py-3 flex items-center gap-3"
                  style={{
                    background: `linear-gradient(135deg, ${todayHoliday.color}22, ${todayHoliday.color}0a)`,
                    border: `1px solid ${todayHoliday.color}40`,
                  }}
                  onClick={() => navigate(`/calendar/${todayHoliday.id}`)}
                >
                  <span className="text-2xl animate-float">{todayHoliday.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[var(--color-text-primary)]">{todayHoliday.name} is Today!</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Tap to send greetings to your contacts</p>
                  </div>
                </div>
              )}
              {isPremium && dashboardData.todayBirthdays.map(contact => (
                <div
                  key={contact.id}
                  className="card-interactive rounded-[var(--border-radius)] px-4 py-3 flex items-center gap-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(236,72,153,0.12), rgba(168,85,247,0.08))',
                    border: '1px solid rgba(236,72,153,0.25)',
                  }}
                  onClick={() => navigate(`/contacts/${contact.id}`)}
                >
                  <span className="text-2xl animate-celebrate">🎂</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[var(--color-text-primary)]">{contact.name}'s Birthday! 🎉</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Don't forget to send a birthday wish!</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
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
            <PremiumFeaturePrompt feature="Birthday Tracking" />
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
