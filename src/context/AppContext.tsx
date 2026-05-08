import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type { Contact, Group, GreetingDraft, AppSettings, PremiumState } from '@/types'
import * as storage from '@/services/storageService'
import * as dataService from '@/services/dataService'
import { useAuth } from '@/context/AuthContext'
import { HOLIDAYS } from '@/data/holidays'
import type { Holiday } from '@/types'
import { buildDashboardData } from '@/core/relationshipEngine'
import type { DashboardData } from '@/types'
import { DEMO_CONTACTS, DEMO_GROUPS } from '@/data/demoData'

// TEMP: Premium disabled for MVP phase — LIMITS unused until premium gates re-enabled
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LIMITS = { free: { contacts: 20, groups: 2 } }

interface AppContextValue {
  // Contacts
  contacts: Contact[]
  addContact: (c: Contact) => void
  updateContact: (c: Contact) => void
  deleteContact: (id: string) => void

  // Groups
  groups: Group[]
  addGroup: (g: Group) => void
  updateGroup: (g: Group) => void
  deleteGroup: (id: string) => void

  // Drafts
  drafts: GreetingDraft[]
  saveDraft: (d: GreetingDraft) => void
  deleteDraft: (id: string) => void

  // Settings
  settings: AppSettings
  saveSettings: (s: Partial<AppSettings>) => void

  // Premium
  premium: PremiumState
  activatePremium: () => void
  deactivatePremium: () => void
  isPremium: boolean
  showPremiumUI: boolean
  canAddContact: boolean
  canAddGroup: boolean
  redeemCoupon: (code: string) => { success: boolean; error: string | null }
  premiumExpiresAt: string | null | undefined

  // Holidays
  holidays: Holiday[]

  // Dashboard
  dashboardData: DashboardData
  refreshDashboard: () => void

  // Demo mode
  isDemoMode: boolean
  enableDemo: () => void
  clearDemo: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  // ─── State initialization from localStorage (synchronous, once on mount) ────
  const [contacts, setContacts] = useState<Contact[]>(() => storage.getContacts())
  const [groups, setGroups]     = useState<Group[]>(() => storage.getGroups())
  const [isDemo]                = useState(() => storage.isDemoMode())
  const [drafts, setDrafts]     = useState<GreetingDraft[]>(() => storage.getDrafts())
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings())
  const [premium, setPremium]   = useState<PremiumState>(() => storage.checkAndExpirePremium())

  // TEMP: premium gates disabled for MVP testing — revert before production
  const TEMP_PREMIUM_UNLOCK = true
  const isPremium    = TEMP_PREMIUM_UNLOCK || premium.isPremium
  // showPremiumUI: false when TEMP_PREMIUM_UNLOCK is on — hides Premium labels/icons
  const showPremiumUI  = !TEMP_PREMIUM_UNLOCK
  // TEMP: Premium disabled for MVP phase — all users can add contacts and groups freely
  const canAddContact  = true
  const canAddGroup    = true

  // BL-112: track calendar date so dashboardData recomputes when date changes after midnight
  const [todayKey, setTodayKey] = useState(() => new Date().toDateString())
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setTodayKey(new Date().toDateString())
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // todayKey in deps forces recomputation when calendar date changes (visibilitychange after midnight)
  const dashboardData    = useMemo(() => buildDashboardData(contacts, HOLIDAYS), [contacts, todayKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const refreshDashboard = useCallback(() => { /* derived via useMemo — no manual refresh needed */ }, [])

  // ─── Contacts ───────────────────────────────────────────────────────────────

  const addContact = useCallback((c: Contact) => {
    const contact: Contact = { ...c, ...(auth.user?.id && { userId: auth.user.id }) }
    void dataService.addContact(contact).catch(e => console.error('[AppContext] addContact:', e))
    setContacts(prev => [...prev, contact])
  }, [auth.user])

  const updateContact = useCallback((c: Contact) => {
    void dataService.updateContact(c).catch(e => console.error('[AppContext] updateContact:', e))
    setContacts(prev => prev.map(x => x.id === c.id ? c : x))
  }, [])

  const deleteContact = useCallback((id: string) => {
    // deleteContactCascade handles both the contact deletion and group cleanup in storage.
    // State is updated optimistically via functional updates below.
    void dataService.deleteContactCascade(id).catch(e => console.error('[AppContext] deleteContact:', e))
    setContacts(prev => prev.filter(c => c.id !== id))
    setGroups(prev => prev.map(g =>
      g.contactIds.includes(id)
        ? { ...g, contactIds: g.contactIds.filter(cid => cid !== id), updatedAt: new Date().toISOString() }
        : g
    ))
  }, [])

  // ─── Groups ─────────────────────────────────────────────────────────────────

  const addGroup = useCallback((g: Group) => {
    const group: Group = { ...g, ...(auth.user?.id && { userId: auth.user.id }) }
    void dataService.addGroup(group).catch(e => console.error('[AppContext] addGroup:', e))
    setGroups(prev => [...prev, group])
  }, [auth.user])

  const updateGroup = useCallback((g: Group) => {
    void dataService.updateGroup(g).catch(e => console.error('[AppContext] updateGroup:', e))
    setGroups(prev => prev.map(x => x.id === g.id ? g : x))
  }, [])

  const deleteGroup = useCallback((id: string) => {
    void dataService.deleteGroup(id).catch(e => console.error('[AppContext] deleteGroup:', e))
    setGroups(prev => prev.filter(g => g.id !== id))
  }, [])

  // ─── Drafts ─────────────────────────────────────────────────────────────────

  const saveDraft = useCallback((d: GreetingDraft) => {
    const draft: GreetingDraft = { ...d, ...(auth.user?.id && { userId: auth.user.id }) }
    void dataService.saveDraft(draft).catch(e => console.error('[AppContext] saveDraft:', e))
    setDrafts(prev => [draft, ...prev.filter(x => x.id !== draft.id)].slice(0, 50))
  }, [auth.user])

  const deleteDraft = useCallback((id: string) => {
    void dataService.deleteDraft(id).catch(e => console.error('[AppContext] deleteDraft:', e))
    setDrafts(prev => prev.filter(d => d.id !== id))
  }, [])

  // ─── Settings ───────────────────────────────────────────────────────────────

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    void dataService.saveSettings(s).catch(e => console.error('[AppContext] saveSettings:', e))
    setSettings(prev => ({ ...prev, ...s }))
  }, [])

  // ─── Premium (stays on storageService — Phase 4 moves server-side) ──────────

  const activatePremiumFn = useCallback(() => {
    storage.activatePremium()
    setPremium(storage.getPremiumState())
  }, [])

  const deactivatePremiumFn = useCallback(() => {
    storage.deactivatePremium()
    setPremium(storage.getPremiumState())
  }, [])

  const redeemCouponFn = useCallback((code: string) => {
    const result = storage.redeemCoupon(code)
    if (result.success) setPremium(storage.getPremiumState())
    return result
  }, [])

  // ─── Demo mode (device-local — never synced to cloud) ───────────────────────

  const enableDemoFn = useCallback(() => {
    storage.enableDemoMode(DEMO_CONTACTS, DEMO_GROUPS)
    window.location.reload()
  }, [])

  const clearDemoFn = useCallback(() => {
    storage.clearDemoMode()
    window.location.reload()
  }, [])

  // ─── Context value ───────────────────────────────────────────────────────────

  const contextValue = useMemo<AppContextValue>(() => ({
    contacts, addContact, updateContact, deleteContact,
    groups, addGroup, updateGroup, deleteGroup,
    drafts, saveDraft, deleteDraft,
    settings, saveSettings: updateSettings,
    premium, activatePremium: activatePremiumFn, deactivatePremium: deactivatePremiumFn,
    isPremium, showPremiumUI, canAddContact, canAddGroup,
    redeemCoupon: redeemCouponFn,
    premiumExpiresAt: premium.expiresAt,
    holidays: HOLIDAYS,
    dashboardData, refreshDashboard,
    isDemoMode: isDemo, enableDemo: enableDemoFn, clearDemo: clearDemoFn,
  }), [
    contacts, addContact, updateContact, deleteContact,
    groups, addGroup, updateGroup, deleteGroup,
    drafts, saveDraft, deleteDraft,
    settings, updateSettings,
    premium, activatePremiumFn, deactivatePremiumFn,
    isPremium, showPremiumUI, canAddContact, canAddGroup,
    redeemCouponFn,
    dashboardData, refreshDashboard,
    isDemo, enableDemoFn, clearDemoFn,
  ])

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
