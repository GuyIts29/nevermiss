import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import type { Contact, Group, GreetingDraft, AppSettings, PremiumState } from '@/types'
import * as storage from '@/services/storageService'
import { HOLIDAYS } from '@/data/holidays'
import type { Holiday } from '@/types'
import { buildDashboardData } from '@/core/relationshipEngine'
import type { DashboardData } from '@/types'
import { DEMO_CONTACTS, DEMO_GROUPS } from '@/data/demoData'

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
  const [contacts, setContacts] = useState<Contact[]>(() => storage.getContacts())
  const [groups, setGroups] = useState<Group[]>(() => storage.getGroups())
  const [isDemo] = useState(() => storage.isDemoMode())
  const [drafts, setDrafts] = useState<GreetingDraft[]>(() => storage.getDrafts())
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings())
  const [premium, setPremium] = useState<PremiumState>(() => storage.checkAndExpirePremium())

  // TEMP: premium gates disabled for MVP testing — revert before production
  const TEMP_PREMIUM_UNLOCK = true
  const isPremium = TEMP_PREMIUM_UNLOCK || premium.isPremium
  const canAddContact = isPremium || contacts.length < LIMITS.free.contacts
  const canAddGroup = isPremium || groups.length < LIMITS.free.groups

  const dashboardData = useMemo(() => buildDashboardData(contacts, HOLIDAYS), [contacts])
  const refreshDashboard = useCallback(() => {/* data is derived — no manual refresh needed */}, [])

  const addContact = useCallback((c: Contact) => {
    storage.addContact(c)
    setContacts(storage.getContacts())
  }, [])

  const updateContact = useCallback((c: Contact) => {
    storage.updateContact(c)
    setContacts(storage.getContacts())
  }, [])

  const deleteContact = useCallback((id: string) => {
    storage.deleteContact(id)
    setContacts(storage.getContacts())
  }, [])

  const addGroup = useCallback((g: Group) => {
    storage.addGroup(g)
    setGroups(storage.getGroups())
  }, [])

  const updateGroup = useCallback((g: Group) => {
    storage.updateGroup(g)
    setGroups(storage.getGroups())
  }, [])

  const deleteGroup = useCallback((id: string) => {
    storage.deleteGroup(id)
    setGroups(storage.getGroups())
  }, [])

  const saveDraft = useCallback((d: GreetingDraft) => {
    storage.saveDraft(d)
    setDrafts(storage.getDrafts())
  }, [])

  const deleteDraft = useCallback((id: string) => {
    storage.deleteDraft(id)
    setDrafts(storage.getDrafts())
  }, [])

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    storage.saveSettings(s)
    setSettings(storage.getSettings())
  }, [])

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

  const enableDemoFn = useCallback(() => {
    storage.enableDemoMode(DEMO_CONTACTS, DEMO_GROUPS)
    window.location.reload()
  }, [])

  const clearDemoFn = useCallback(() => {
    storage.clearDemoMode()
    window.location.reload()
  }, [])

  const contextValue = useMemo<AppContextValue>(() => ({
    contacts, addContact, updateContact, deleteContact,
    groups, addGroup, updateGroup, deleteGroup,
    drafts, saveDraft, deleteDraft,
    settings, saveSettings: updateSettings,
    premium, activatePremium: activatePremiumFn, deactivatePremium: deactivatePremiumFn,
    isPremium, canAddContact, canAddGroup,
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
    isPremium, canAddContact, canAddGroup,
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
