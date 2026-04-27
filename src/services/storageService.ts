import { APP_CONFIG } from '@/config/appConfig'
import type { Contact, Group, GreetingDraft, AppSettings, PremiumState, ThemeId, Language, GreetingTone, CommunicationChannel } from '@/types'

const K = APP_CONFIG.storageKeys

function get<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch (err) {
    console.warn(`[storageService] Failed to parse localStorage key "${key}". Returning null. Error:`, err)
    return null
  }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function remove(key: string): void {
  localStorage.removeItem(key)
}

// ─── Contacts ────────────────────────────────────────────────────────────────

export function getContacts(): Contact[] {
  return get<Contact[]>(K.contacts) ?? []
}

export function saveContacts(contacts: Contact[]): void {
  set(K.contacts, contacts)
}

export function addContact(contact: Contact): void {
  const contacts = getContacts()
  contacts.push(contact)
  saveContacts(contacts)
}

export function updateContact(updated: Contact): void {
  const contacts = getContacts().map(c => (c.id === updated.id ? updated : c))
  saveContacts(contacts)
}

export function deleteContact(id: string): void {
  saveContacts(getContacts().filter(c => c.id !== id))
}

export function getContactById(id: string): Contact | undefined {
  return getContacts().find(c => c.id === id)
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export function getGroups(): Group[] {
  return get<Group[]>(K.groups) ?? []
}

export function saveGroups(groups: Group[]): void {
  set(K.groups, groups)
}

export function addGroup(group: Group): void {
  const groups = getGroups()
  groups.push(group)
  saveGroups(groups)
}

export function updateGroup(updated: Group): void {
  saveGroups(getGroups().map(g => (g.id === updated.id ? updated : g)))
}

export function deleteGroup(id: string): void {
  saveGroups(getGroups().filter(g => g.id !== id))
}

// ─── Drafts ───────────────────────────────────────────────────────────────────

export function getDrafts(): GreetingDraft[] {
  return get<GreetingDraft[]>(K.greetingDrafts) ?? []
}

export function saveDraft(draft: GreetingDraft): void {
  const drafts = getDrafts().filter(d => d.id !== draft.id)
  drafts.unshift(draft)
  set(K.greetingDrafts, drafts.slice(0, 50))
}

export function deleteDraft(id: string): void {
  set(K.greetingDrafts, getDrafts().filter(d => d.id !== id))
}

// ─── Settings ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  themeId: 'ocean',
  language: 'english',
  defaultTone: 'friendly',
  showWelcomeOnStartup: true,
  notificationsEnabled: false,
  lastSeenVersion: '',
}

export function getSettings(): AppSettings {
  const saved = get<Partial<AppSettings>>(K.settings)
  return { ...DEFAULT_SETTINGS, ...saved }
}

export function saveSettings(settings: Partial<AppSettings>): void {
  const current = getSettings()
  set(K.settings, { ...current, ...settings })
}

export function setTheme(themeId: ThemeId): void {
  saveSettings({ themeId })
}

export function setLastSeenVersion(version: string): void {
  saveSettings({ lastSeenVersion: version })
}

// ─── Premium ──────────────────────────────────────────────────────────────────

export function getPremiumState(): PremiumState {
  return get<PremiumState>(K.premium) ?? { isPremium: false }
}

export function setPremium(state: PremiumState): void {
  set(K.premium, state)
}

export function activatePremium(): void {
  setPremium({ isPremium: true, activatedAt: new Date().toISOString(), plan: 'monthly' })
}

export function deactivatePremium(): void {
  setPremium({ isPremium: false })
}

// SECURITY NOTE (MVP): These codes are visible in the compiled JS bundle.
// This is acceptable for demo/MVP. For production: validate server-side or store as SHA-256 hashes.
// Valid coupon codes → months of premium
const VALID_COUPONS: Record<string, number> = {
  NEVERMISS1: 1,
  WELCOME2025: 1,
  ISRAEL30: 1,
}

export function getUsedCoupons(): string[] {
  return get<string[]>(APP_CONFIG.storageKeys.usedCoupons) ?? []
}

export function redeemCoupon(code: string): { success: boolean; error: string | null } {
  const normalized = code.trim().toUpperCase()
  const months = VALID_COUPONS[normalized]
  if (!months) return { success: false, error: 'invalid' }
  const used = getUsedCoupons()
  if (used.includes(normalized)) return { success: false, error: 'already_used' }
  // Mark used
  set(APP_CONFIG.storageKeys.usedCoupons, [...used, normalized])
  // Activate premium with expiry
  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + months)
  setPremium({
    isPremium: true,
    activatedAt: new Date().toISOString(),
    plan: 'coupon',
    expiresAt: expiresAt.toISOString(),
    couponCode: normalized,
  })
  return { success: true, error: null }
}

export function checkAndExpirePremium(): PremiumState {
  const state = getPremiumState()
  if (state.isPremium && state.expiresAt && new Date(state.expiresAt) < new Date()) {
    const expired: PremiumState = { isPremium: false }
    setPremium(expired)
    return expired
  }
  return state
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export function isOnboardingDone(): boolean {
  return localStorage.getItem(K.onboarding) === 'true'
}

export function markOnboardingDone(): void {
  localStorage.setItem(K.onboarding, 'true')
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Last used channel ────────────────────────────────────────────────────────

export function getLastUsedChannel(contactId: string): CommunicationChannel | null {
  const map = get<Record<string, CommunicationChannel>>(APP_CONFIG.storageKeys.lastChannels)
  return map?.[contactId] ?? null
}

export function saveLastUsedChannel(contactId: string, channel: CommunicationChannel): void {
  const map = get<Record<string, CommunicationChannel>>(APP_CONFIG.storageKeys.lastChannels) ?? {}
  map[contactId] = channel
  set(APP_CONFIG.storageKeys.lastChannels, map)
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function clearAllData(): void {
  Object.values(K).forEach(key => remove(key))
}

export const defaultContactValues = {
  importanceLevel: 'normal' as const,
  interactionFrequency: 'monthly' as const,
  contactType: 'external' as const,
  language: 'english' as Language,
}

export const defaultGreetingTone: GreetingTone = 'friendly'
