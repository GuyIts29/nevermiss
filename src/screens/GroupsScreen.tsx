import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Calendar, Edit, Trash2, Crown, Sparkles } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { PageHeader } from '@/components/Navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/EmptyState'
import { PremiumFeaturePrompt } from '@/components/PremiumBadge'
import { generateId } from '@/services/storageService'
import type { Group, GroupPurpose } from '@/types'
import { APP_CONFIG } from '@/config/appConfig'
import { SUGGESTED_BASES } from '@/data/groupSuggestions'

const GROUP_COLORS = ['#2563EB','#16A34A','#EA580C','#7C3AED','#E11D48','#0F766E','#D97706','#6366F1']
const GROUP_EMOJIS = ['👥','🎉','🏢','🤝','🌍','⭐','💼','🎂']

export function GroupsScreen() {
  const navigate = useNavigate()
  const { groups, contacts, holidays, addGroup, updateGroup, deleteGroup, canAddGroup, isPremium } = useApp()
  const t = useT()
  const { theme } = useTheme()
  const [showForm, setShowForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [form, setForm] = useState({ name: '', description: '', color: GROUP_COLORS[0], emoji: GROUP_EMOJIS[0], purpose: undefined as GroupPurpose | undefined })
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedHolidayIds, setSelectedHolidayIds] = useState<string[]>([])
  const [holidaySearch, setHolidaySearch] = useState('')

  const getSuggestedIds = (purpose: GroupPurpose | undefined): string[] => {
    if (!purpose) return []
    const bases = SUGGESTED_BASES[purpose]
    return holidays
      .filter(h => bases.includes(h.id.replace(/-\d{4}$/, '')))
      .map(h => h.id)
  }

  const applyPurpose = (purpose: GroupPurpose | undefined) => {
    setForm(f => {
      const oldSuggested = f.purpose ? getSuggestedIds(f.purpose) : []
      const newSuggested = purpose ? getSuggestedIds(purpose) : []
      setSelectedHolidayIds(prev => {
        const withoutOld = prev.filter(id => !oldSuggested.includes(id))
        return [...new Set([...withoutOld, ...newSuggested])]
      })
      return { ...f, purpose }
    })
  }

  const atLimit = !canAddGroup
  const freeRemaining = APP_CONFIG.limits.free.groups - groups.length

  const openForm = (group?: Group) => {
    if (group) {
      setEditingGroup(group)
      setForm({ name: group.name, description: group.description ?? '', color: group.color, emoji: group.emoji, purpose: group.purpose })
      setSelectedHolidayIds(group.holidayIds ?? [])
    } else {
      setEditingGroup(null)
      setForm({ name: '', description: '', color: GROUP_COLORS[0], emoji: GROUP_EMOJIS[0], purpose: undefined })
      setSelectedHolidayIds([])
    }
    setHolidaySearch('')
    setShowForm(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    const now = new Date().toISOString()
    const resolvedHolidayIds = isPremium ? selectedHolidayIds : (editingGroup?.holidayIds ?? [])
    if (editingGroup) {
      updateGroup({ ...editingGroup, ...form, holidayIds: resolvedHolidayIds, updatedAt: now })
    } else {
      addGroup({
        id: generateId(),
        name: form.name.trim(),
        description: form.description,
        color: form.color,
        emoji: form.emoji,
        purpose: form.purpose,
        contactIds: [],
        holidayIds: resolvedHolidayIds,
        createdAt: now,
        updatedAt: now,
      })
    }
    setShowForm(false)
  }

  return (
    <div className="screen-container">
      <PageHeader
        title={t('groups_title')}
        subtitle={`${groups.length} ${groups.length === 1 ? t('groups_group') : t('groups_groups')}`}
        right={
          canAddGroup ? (
            <button
              onClick={() => openForm()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-[var(--border-radius)] text-sm font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
            >
              <Plus size={14} />
              {t('new')}
            </button>
          ) : (
            <button
              onClick={() => navigate('/upgrade')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-[var(--border-radius)] text-sm font-semibold bg-amber-100 text-amber-700"
            >
              {t('upgrade')}
            </button>
          )
        }
      />

      <div className="page-content space-y-4">
        {!isPremium && (
          <div className="text-xs text-[var(--color-text-muted)] px-1">
            {atLimit
              ? <span className="text-amber-600 font-medium">{t('groups_limitReached')}</span>
              : freeRemaining === 1
                ? t('groups_freeSlots', { n: freeRemaining })
                : t('groups_freeSlotsPlural', { n: freeRemaining })
            }
          </div>
        )}

        {groups.length === 0 ? (
          <>
            <EmptyState
              emoji="📁"
              title={t('groups_noGroups')}
              description={t('groups_noGroupsDesc')}
              action={canAddGroup ? {
                label: t('groups_createFirst'),
                icon: <Plus size={14} />,
                onClick: () => openForm(),
              } : undefined}
            />
            {!isPremium && <PremiumFeaturePrompt feature={t('premium_feat_unlimited_groups')} />}
          </>
        ) : (
          <div className="space-y-2">
            {groups.map(group => {
              const groupContacts = contacts.filter(c => group.contactIds.includes(c.id))
              const groupHolidays = holidays.filter(h => group.holidayIds.includes(h.id))
              const isExpanded = expandedId === group.id

              return (
                <button
                  type="button"
                  key={group.id}
                  className="card card-interactive cursor-pointer overflow-hidden w-full text-left"
                  style={{
                    borderLeft: `4px solid ${group.color}`,
                    background: `linear-gradient(135deg, var(--color-surface) 70%, ${group.color}11)`,
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : group.id)}
                >
                  <div className="flex items-center gap-3">
                    {/* Gradient emoji circle */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${group.color}33, ${group.color}66)` }}
                    >
                      {group.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[var(--color-text-primary)]">{group.name}</p>
                      {/* Pill badges for stats */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ backgroundColor: `${group.color}22`, color: group.color }}
                        >
                          <Users size={9} />
                          {groupContacts.length} {t('groups_contacts')}
                        </span>
                        <span
                          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ backgroundColor: `${group.color}15`, color: group.color }}
                        >
                          <Calendar size={9} />
                          {groupHolidays.length} {t('groups_holidays')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => { e.stopPropagation(); openForm(group) }}
                        className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
                      >
                        <Edit size={13} className="text-[var(--color-text-muted)]" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setShowDelete(group.id) }}
                        className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[var(--color-border)] animate-fade-in">
                      {group.description && (
                        <p className="text-sm text-[var(--color-text-secondary)] mb-2">{group.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <GroupDetailCard
                          icon={<Users size={12} />}
                          label={t('groups_contacts')}
                          count={groupContacts.length}
                          color={group.color}
                          onClick={() => navigate(`/contacts?group=${group.id}`)}
                        />
                        <GroupDetailCard
                          icon={<Calendar size={12} />}
                          label={t('groups_holidays')}
                          count={groupHolidays.length}
                          color={group.color}
                          onClick={() => navigate('/calendar')}
                        />
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        className="mt-2"
                        icon={<Users size={12} />}
                        onClick={() => navigate(`/greeting?groupId=${group.id}`)}
                      >
                        {t('groups_sendGreeting')}
                      </Button>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {!isPremium && groups.length > 0 && (
          <PremiumFeaturePrompt feature={t('premium_feat_unlimited_groups')} />
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingGroup ? t('groups_editGroup') : t('groups_createGroup')}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" fullWidth onClick={() => setShowForm(false)}>{t('cancel')}</Button>
            <Button variant="primary" size="sm" fullWidth onClick={handleSave}>
              {editingGroup ? t('save') : t('create')}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm"
              style={{ background: `linear-gradient(135deg, ${form.color}33, ${form.color}66)` }}
            >
              {form.emoji}
            </div>
            <div className="flex-1">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">{t('groups_emoji')}</p>
              <div className="flex gap-1.5 flex-wrap">
                {GROUP_EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setForm(f => ({ ...f, emoji: e }))}
                    className={`text-xl rounded-lg p-1 transition-colors ${form.emoji === e ? 'bg-[var(--color-surface-2)]' : ''}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-[var(--color-text-muted)]">{t('groups_color')}</p>
          <div className="flex gap-2">
            {GROUP_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setForm(f => ({ ...f, color: c }))}
                className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: c, outline: form.color === c ? '3px solid var(--color-primary)' : 'none', outlineOffset: '2px' }}
              />
            ))}
          </div>

          <Input
            label={t('groups_groupName')}
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder={t('groups_groupNamePlaceholder')}
          />
          <Input
            label={t('groups_description')}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder={t('groups_descriptionPlaceholder')}
          />

          {/* Group purpose */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={12} style={{ color: theme.primary }} />
              <p className="text-xs font-semibold text-[var(--color-text-primary)]">{t('group_purpose')}</p>
              <span className="text-[10px] text-[var(--color-text-muted)]">{t('group_purpose_hint')}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['family','friends','work','clients','hr','community','custom'] as GroupPurpose[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyPurpose(form.purpose === p ? undefined : p)}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                  style={form.purpose === p
                    ? { background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, color: 'white' }
                    : { background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }
                  }
                >
                  {t(`group_purpose_${p}` as Parameters<typeof t>[0])}
                </button>
              ))}
            </div>
          </div>

          {/* Holiday Assignment */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base">📅</span>
              <p className="font-semibold text-sm">{t('group_holidays')}</p>
              {!isPremium && <Crown size={13} className="text-amber-500" />}
            </div>
            {!isPremium ? (
              <p className="text-xs text-[var(--color-text-muted)] italic">
                {t('group_holidays_hint')} — Premium only
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[var(--color-text-muted)]">{t('group_holidays_hint')}</p>
                <input
                  type="text"
                  placeholder="Search holidays..."
                  value={holidaySearch}
                  onChange={e => setHolidaySearch(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-[var(--border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)]"
                />
                <div className="max-h-48 overflow-y-auto space-y-1 rounded-[var(--border-radius)] border border-[var(--color-border)] p-1">
                  {holidays
                    .filter(h => h.name.toLowerCase().includes(holidaySearch.toLowerCase()))
                    .map(h => {
                      const selected = selectedHolidayIds.includes(h.id)
                      const isSuggested = form.purpose
                        ? SUGGESTED_BASES[form.purpose].includes(h.id.replace(/-\d{4}$/, ''))
                        : false
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => setSelectedHolidayIds(prev =>
                            selected ? prev.filter(id => id !== h.id) : [...prev, h.id]
                          )}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-colors"
                          style={selected ? { background: h.color + '22', border: `1px solid ${h.color}44` } : {}}
                        >
                          <div
                            className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
                            style={selected ? { borderColor: 'var(--color-primary)', background: 'var(--color-primary)' } : { borderColor: 'var(--color-border)' }}
                          >
                            {selected && <span className="text-white text-[10px]">✓</span>}
                          </div>
                          <span className="text-base leading-none">{h.emoji}</span>
                          <span className="flex-1 truncate">{h.name}</span>
                          {isSuggested && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
                              style={{ background: `${theme.primary}22`, color: theme.primary }}>
                              ✦
                            </span>
                          )}
                          <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">{h.religion}</span>
                        </button>
                      )
                    })}
                </div>
                {selectedHolidayIds.length > 0 && (
                  <p className="text-xs" style={{ color: theme.primary }}>
                    {t('group_holidays_selected', { n: selectedHolidayIds.length })}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        isOpen={!!showDelete}
        onClose={() => setShowDelete(null)}
        title={t('groups_deleteGroup')}
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" fullWidth onClick={() => setShowDelete(null)}>{t('cancel')}</Button>
            <Button variant="danger" size="sm" fullWidth onClick={() => { deleteGroup(showDelete!); setShowDelete(null) }}>{t('delete')}</Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('groups_deleteConfirm')}
        </p>
      </Modal>
    </div>
  )
}

function GroupDetailCard({ icon, label, count, color, onClick }: { icon: React.ReactNode; label: string; count: number; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 p-2 rounded-lg hover:opacity-80 transition-opacity"
      style={{ backgroundColor: `${color}11` }}
    >
      <div style={{ color }}>{icon}</div>
      <div className="text-left">
        <div className="text-sm font-semibold text-[var(--color-text-primary)]">{count}</div>
        <div className="text-xs text-[var(--color-text-muted)]">{label}</div>
      </div>
    </button>
  )
}
