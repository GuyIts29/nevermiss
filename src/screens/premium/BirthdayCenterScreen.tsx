import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { PageHeader } from '@/components/Navigation'
import { Badge } from '@/components/ui/Badge'
import type { Contact } from '@/types'
import { getInitials, getAvatarGradient } from '@/utils/avatarUtils'

function getBirthdayInfo(birthday: string) {
  const today = new Date()
  const bday = new Date(birthday)
  const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
  if (thisYear < today) thisYear.setFullYear(today.getFullYear() + 1)
  const days = Math.floor((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const age = today.getFullYear() - bday.getFullYear() + (thisYear.getFullYear() > today.getFullYear() ? 0 : 1)
  return { days, age, date: thisYear }
}

type BirthdaySection = 'today' | 'week' | 'month'

export function BirthdayCenterScreen() {
  const navigate = useNavigate()
  const { contacts } = useApp()
  const t = useT()
  const [section, setSection] = useState<BirthdaySection>('today')

  const withBirthdays = contacts.filter(c => c.birthday)
  const categorized = withBirthdays
    .map(c => ({ contact: c, ...getBirthdayInfo(c.birthday!) }))
    .sort((a, b) => a.days - b.days)

  const sections: Record<BirthdaySection, typeof categorized> = {
    today: categorized.filter(({ days }) => days === 0),
    week: categorized.filter(({ days }) => days > 0 && days <= 7),
    month: categorized.filter(({ days }) => days > 7 && days <= 30),
  }

  const tabLabels: Record<BirthdaySection, string> = {
    today: t('birthday_today'),
    week: t('birthday_week'),
    month: t('birthday_month'),
  }

  const emptyTitles: Record<BirthdaySection, string> = {
    today: t('birthday_noToday'),
    week: t('birthday_noWeek'),
    month: t('birthday_noMonth'),
  }

  return (
    <div className="screen-container">
      <PageHeader title={t('birthday_title')} back />

      <div className="page-content space-y-4 pb-10">
        {/* Hero header */}
        <div
          className="rounded-[var(--border-radius-lg)] p-4 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #EC4899 0%, #A855F7 60%, #6366F1 100%)' }}
        >
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/10 pointer-events-none" />
          <div className="text-4xl animate-float inline-block mb-1">🎂</div>
          <p className="text-white font-bold text-base">{t('birthday_title')}</p>
          <p className="text-white/70 text-xs mt-0.5">{t('birthday_heroSubtitle')}</p>
          {withBirthdays.length > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
              <span className="text-white text-xs font-semibold">{t('birthday_contactCount', { n: withBirthdays.length })}</span>
            </div>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[var(--color-surface-2)] rounded-[var(--border-radius)] p-0.5 gap-0.5">
          {(['today', 'week', 'month'] as BirthdaySection[]).map(key => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-semibold transition-all"
              style={section === key ? {
                background: 'linear-gradient(135deg, #EC4899, #A855F7)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(236,72,153,0.3)',
              } : {
                color: 'var(--color-text-muted)',
              }}
            >
              {tabLabels[key]}
              {sections[key].length > 0 && (
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                  style={section === key
                    ? { background: 'rgba(255,255,255,0.3)', color: 'white' }
                    : { background: 'var(--color-border)', color: 'var(--color-text-muted)' }
                  }
                >
                  {sections[key].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {sections[section].length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ background: 'linear-gradient(135deg, #FCE7F3, #F3E8FF)' }}
            >
              {section === 'today' ? '🎉' : section === 'week' ? '📅' : '🗓️'}
            </div>
            <div className="text-center">
              <p className="font-semibold text-[var(--color-text-primary)]">{emptyTitles[section]}</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">{t('birthday_noDesc')}</p>
            </div>
            <button
              onClick={() => navigate('/contacts')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #EC4899, #A855F7)' }}
            >
              <UserPlus size={14} />
              {t('birthday_addToContacts')}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {sections[section].map(({ contact, days, age, date }, idx) => (
              <BirthdayCard
                key={contact.id}
                contact={contact}
                daysUntil={days}
                turningAge={age}
                birthdayDate={date}
                animClass={`stagger-${Math.min(idx + 1, 5) as 1|2|3|4|5}`}
                onGreet={() => navigate(`/birthdays/greeting/${contact.id}`)}
                wishLabel={t('birthday_wish')}
                turningLabel={t('birthday_turning', { age })}
                inDaysLabel={days === 1 ? t('birthday_in', { n: days }) : t('birthday_inPlural', { n: days })}
                todayBadgeLabel={t('birthday_todayBadge')}
                itsTheirBirthdayLabel={t('birthday_itsTheirBirthday')}
                dayLabel={t('birthday_day')}
                daysLabel={t('birthday_days')}
              />
            ))}
          </div>
        )}

        {withBirthdays.length === 0 && (
          <div
            className="rounded-[var(--border-radius-lg)] p-5 text-center"
            style={{ background: 'linear-gradient(135deg, #FCE7F3, #F3E8FF)' }}
          >
            <p className="text-2xl mb-2">🎁</p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{t('birthday_noneTracked')}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{t('birthday_noDesc')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function BirthdayCard({
  contact, daysUntil, birthdayDate, onGreet,
  wishLabel, turningLabel, inDaysLabel, animClass,
  todayBadgeLabel, itsTheirBirthdayLabel, dayLabel, daysLabel,
}: {
  contact: Contact
  daysUntil: number
  turningAge?: number
  birthdayDate: Date
  onGreet: () => void
  wishLabel: string
  turningLabel: string
  inDaysLabel: string
  animClass: string
  todayBadgeLabel: string
  itsTheirBirthdayLabel: string
  dayLabel: string
  daysLabel: string
}) {
  const isToday = daysUntil === 0

  if (isToday) {
    return (
      <div
        className={`rounded-[var(--border-radius-lg)] p-4 ${animClass}`}
        style={{
          background: 'linear-gradient(135deg, #EC4899 0%, #A855F7 60%, #6366F1 100%)',
          boxShadow: '0 4px 20px rgba(236,72,153,0.3)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0 shadow-lg"
            style={{ background: getAvatarGradient(contact.name) }}
          >
            {getInitials(contact.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-base text-white">{contact.name}</p>
              <Badge variant="danger" size="sm">{todayBadgeLabel}</Badge>
            </div>
            <p className="text-white/80 text-xs mt-0.5">
              {format(birthdayDate, 'MMMM d')} · {turningLabel}
            </p>
            <div className="mt-1 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-0.5">
              <span className="text-white text-xs font-semibold">{itsTheirBirthdayLabel}</span>
            </div>
          </div>
          <button
            onClick={onGreet}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-white shrink-0 hover:opacity-90 active:scale-95 transition-all"
            style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)' }}
          >
            <MessageCircle size={12} />
            {wishLabel}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`card animate-slide-up ${animClass} flex items-center gap-3`}
    >
      {/* Countdown number */}
      <div className="flex flex-col items-center justify-center shrink-0 w-12">
        <span
          className="text-2xl font-black leading-none"
          style={{
            background: 'linear-gradient(135deg, #EC4899, #A855F7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {daysUntil}
        </span>
        <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide">
          {daysUntil === 1 ? dayLabel : daysLabel}
        </span>
      </div>

      {/* Separator */}
      <div className="w-px h-10 bg-[var(--color-border)] shrink-0" />

      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
        style={{ background: getAvatarGradient(contact.name) }}
      >
        {getInitials(contact.name)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">{contact.name}</p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {format(birthdayDate, 'MMMM d')} · {turningLabel}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">{inDaysLabel}</p>
      </div>

      <button
        onClick={onGreet}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-white shrink-0 hover:opacity-90 active:scale-95 transition-all"
        style={{ background: 'linear-gradient(135deg, #EC4899, #A855F7)' }}
      >
        <MessageCircle size={11} />
        {wishLabel}
      </button>
    </div>
  )
}
