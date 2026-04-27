import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Contact, Group, GreetingDraft, AppSettings, PremiumState } from '@/types'
import * as storage from '@/services/storageService'
import { HOLIDAYS } from '@/data/holidays'
import type { Holiday } from '@/types'
import { buildDashboardData } from '@/core/relationshipEngine'
import type { DashboardData } from '@/types'

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

  // Holidays
  holidays: Holiday[]

  // Dashboard
  dashboardData: DashboardData
  refreshDashboard: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(() => storage.getContacts())
  const [groups, setGroups] = useState<Group[]>(() => storage.getGroups())
  const [drafts, setDrafts] = useState<GreetingDraft[]>(() => storage.getDrafts())
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings())
  const [premium, setPremium] = useState<PremiumState>(() => storage.getPremiumState())
  const [dashboardData, setDashboardData] = useState<DashboardData>(() =>
    buildDashboardData(storage.getContacts(), HOLIDAYS)
  )

  const isPremium = premium.isPremium
  const { limits } = { limits: { free: { contacts: 20, groups: 2 } } }
  const canAddContact = isPremium || contacts.length < limits.free.contacts
  const canAddGroup = isPremium || groups.length < limits.free.groups

  const refreshDashboard = useCallback(() => {
    setDashboardData(buildDashboardData(contacts, HOLIDAYS))
  }, [contacts])

  useEffect(() => { refreshDashboard() }, [refreshDashboard])

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

  return (
    <AppContext.Provider value={{
      contacts, addContact, updateContact, deleteContact,
      groups, addGroup, updateGroup, deleteGroup,
      drafts, saveDraft, deleteDraft,
      settings, saveSettings: updateSettings,
      premium, activatePremium: activatePremiumFn, deactivatePremium: deactivatePremiumFn,
      isPremium, canAddContact, canAddGroup,
      holidays: HOLIDAYS,
      dashboardData, refreshDashboard,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
