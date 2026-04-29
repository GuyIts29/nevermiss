import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, SortAsc, FileUp } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { PageHeader } from '@/components/Navigation'
import { Input } from '@/components/ui/Input'
import { ContactCard } from '@/components/ContactCard'
import { EmptyState } from '@/components/EmptyState'
import { PremiumFeaturePrompt } from '@/components/PremiumBadge'
import { calculateRelationshipScore } from '@/core/scoringSystem'
import { HOLIDAYS } from '@/data/holidays'
import { clsx } from 'clsx'
import { APP_CONFIG } from '@/config/appConfig'

type SortKey = 'score' | 'name' | 'lastContact' | 'importance'
type FilterType = 'all' | 'internal' | 'external' | 'vip'

export function ContactsScreen() {
  const navigate = useNavigate()
  const { contacts, canAddContact, isPremium } = useApp()
  const t = useT()
  const { theme } = useTheme()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('score')
  const [filter, setFilter] = useState<FilterType>('all')

  const scored = useMemo(() =>
    contacts.map(c => ({
      contact: c,
      score: calculateRelationshipScore(c, HOLIDAYS),
    })),
    [contacts]
  )

  const filtered = useMemo(() => {
    let list = scored
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(({ contact: c }) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.department?.toLowerCase().includes(q) ||
        c.role?.toLowerCase().includes(q)
      )
    }
    if (filter === 'internal') list = list.filter(({ contact: c }) => c.contactType === 'internal')
    if (filter === 'external') list = list.filter(({ contact: c }) => c.contactType === 'external')
    if (filter === 'vip') list = list.filter(({ contact: c }) => c.importanceLevel === 'vip')

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'score': return b.score.total - a.score.total
        case 'name': return a.contact.name.localeCompare(b.contact.name)
        case 'lastContact': {
          const ad = a.contact.lastContactDate ? new Date(a.contact.lastContactDate).getTime() : 0
          const bd = b.contact.lastContactDate ? new Date(b.contact.lastContactDate).getTime() : 0
          return ad - bd
        }
        case 'importance': {
          const rank = { vip: 0, high: 1, normal: 2 }
          return rank[a.contact.importanceLevel] - rank[b.contact.importanceLevel]
        }
        default: return 0
      }
    })
    return list
  }, [scored, search, sort, filter])

  const atLimit = !canAddContact
  const freeRemaining = APP_CONFIG.limits.free.contacts - contacts.length

  const sortLabel = sort === 'score' ? t('contacts_sort_score')
    : sort === 'name' ? t('contacts_sort_name')
    : sort === 'lastContact' ? t('contacts_sort_lastContact')
    : t('contacts_sort_importance')

  const filterLabels: Record<FilterType, string> = {
    all: t('contacts_filter_all'),
    external: t('contacts_filter_external'),
    internal: t('contacts_filter_internal'),
    vip: t('contacts_filter_vip'),
  }

  return (
    <div className="screen-container">
      <PageHeader
        title={t('contacts_title')}
        subtitle={`${contacts.length} ${contacts.length === 1 ? t('groups_group') : t('groups_groups')}`}
        right={
          <div className="flex items-center gap-2">
            {isPremium && (
              <button
                onClick={() => navigate('/import')}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl hover:bg-[var(--color-surface-2)] transition-all active:scale-90"
                aria-label={t('settings_importContacts')}
              >
                <FileUp size={18} className="text-[var(--color-text-secondary)]" />
              </button>
            )}
            <button
              onClick={() => canAddContact ? navigate('/contacts/new') : navigate('/upgrade')}
              className={clsx(
                'flex items-center gap-1 px-3 py-1.5 rounded-[var(--border-radius)] text-sm font-semibold transition-colors',
                canAddContact
                  ? 'text-white'
                  : 'bg-amber-100 text-amber-700'
              )}
              style={canAddContact ? { background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` } : undefined}
            >
              <Plus size={14} />
              {canAddContact ? t('add') : t('upgrade')}
            </button>
          </div>
        }
      />

      <div className="page-content space-y-3">
        {/* Limit warning */}
        {!isPremium && contacts.length > 0 && (
          <div className={clsx(
            'px-3 py-2 rounded-lg text-xs font-medium',
            atLimit ? 'bg-red-50 text-red-700' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
          )}>
            {atLimit
              ? t('contacts_limitReached')
              : freeRemaining === 1
                ? t('contacts_freeSlots', { n: freeRemaining })
                : t('contacts_freeSlotsPlural', { n: freeRemaining })
            }
          </div>
        )}

        {/* Search — elevated look */}
        <div className="shadow-md rounded-[var(--border-radius)] ring-1 ring-[var(--color-border)]">
          <Input
            placeholder={t('contacts_searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search size={14} />}
          />
        </div>

        {/* Sort & Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {(['all', 'external', 'internal', 'vip'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                filter === f
                  ? 'text-white shadow-sm'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
              )}
              style={filter === f ? { background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` } : undefined}
            >
              {filterLabels[f]}
            </button>
          ))}
          <button
            onClick={() => setSort(s => s === 'score' ? 'name' : s === 'name' ? 'lastContact' : s === 'lastContact' ? 'importance' : 'score')}
            className={clsx(
              'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all',
              'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
            )}
          >
            <SortAsc size={10} />
            {sortLabel}
          </button>
        </div>

        {/* List */}
        {filtered.length === 0 && contacts.length === 0 ? (
          <>
            <EmptyState
              emoji="👥"
              title={t('contacts_noContacts')}
              description={t('contacts_noContactsDesc')}
              action={{
                label: t('contacts_addFirst'),
                icon: <Plus size={14} />,
                onClick: () => navigate('/contacts/new'),
              }}
            />
            {isPremium && (
              <button
                type="button"
                onClick={() => navigate('/import')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-[var(--border-radius)] border border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <FileUp size={14} />
                {t('settings_importContacts')}
              </button>
            )}
          </>
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title={t('contacts_noResults')}
            description={t('contacts_noResultsDesc')}
          />
        ) : (
          <div className="space-y-2 pb-20">
            {filtered.map(({ contact, score }, i) => (
              <ContactCard key={contact.id} contact={contact} score={score} staggerIndex={i % 5} />
            ))}
          </div>
        )}

        {/* Import prompt (premium) */}
        {!isPremium && contacts.length === 0 && (
          <PremiumFeaturePrompt feature={t('premium_feat_import')} />
        )}
      </div>

      {/* FAB */}
      {canAddContact && (
        <button
          onClick={() => navigate('/contacts/new')}
          className="fixed right-4 bottom-20 w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-30 transition-transform hover:scale-105 active:scale-95"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
          aria-label={t('contacts_addContact')}
        >
          <Plus size={24} className="text-white" />
        </button>
      )}
    </div>
  )
}
