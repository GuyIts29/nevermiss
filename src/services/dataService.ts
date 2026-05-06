/**
 * dataService — async data interface for NeverMiss core entities.
 *
 * Phase 0: backed entirely by storageService (localStorage). All operations
 * resolve synchronously — the async signatures exist so Phase 2 can swap in
 * Supabase calls without touching AppContext or any screen.
 *
 * Demo-mode guard is structurally present in every write operation.
 * Phase 2: the non-demo branch gains `await supabase.from(...)` calls.
 *
 * What is NOT here (stays in storageService directly):
 *   - Lifecycle flags: isOnboardingDone, markOnboardingDone, isDontShowLanding, setDontShowLanding
 *   - UI preferences: getLastUsedChannel, saveLastUsedChannel, setTheme
 *   - Utilities: clearAllData, exportBackupJSON, importBackupJSON
 *   - Premium: handled via storageService in AppContext (Phase 4 migration)
 */

import * as storage from '@/services/storageService'
import type { Contact, Group, GreetingDraft, AppSettings, PremiumState } from '@/types'

// ─── Contacts ─────────────────────────────────────────────────────────────────

export async function getContacts(): Promise<Contact[]> {
  return storage.getContacts()
}

export async function addContact(c: Contact): Promise<void> {
  storage.addContact(c)
  if (!storage.isDemoMode()) {
    // Phase 2: await supabase.from('contacts').insert(c)
  }
}

export async function updateContact(c: Contact): Promise<void> {
  storage.updateContact(c)
  if (!storage.isDemoMode()) {
    // Phase 2: await supabase.from('contacts').update(c).eq('id', c.id)
  }
}

export async function deleteContact(id: string): Promise<void> {
  storage.deleteContact(id)
  if (!storage.isDemoMode()) {
    // Phase 2: await supabase.from('contacts').delete().eq('id', id)
  }
}

/**
 * Deletes a contact and removes it from all group memberships atomically.
 * Phase 2: becomes a Supabase transaction (contact delete + group_contacts cleanup).
 */
export async function deleteContactCascade(id: string): Promise<void> {
  storage.deleteContact(id)
  storage.getGroups()
    .filter(g => g.contactIds.includes(id))
    .forEach(g => storage.updateGroup({
      ...g,
      contactIds: g.contactIds.filter(cid => cid !== id),
      updatedAt: new Date().toISOString(),
    }))
  if (!storage.isDemoMode()) {
    // Phase 2: BEGIN TRANSACTION
    //   await supabase.from('contacts').delete().eq('id', id)
    //   await supabase.from('group_contacts').delete().eq('contact_id', id)
    // END TRANSACTION
  }
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export async function getGroups(): Promise<Group[]> {
  return storage.getGroups()
}

export async function addGroup(g: Group): Promise<void> {
  storage.addGroup(g)
  if (!storage.isDemoMode()) {
    // Phase 2: await supabase.from('groups').insert(g)
  }
}

export async function updateGroup(g: Group): Promise<void> {
  storage.updateGroup(g)
  if (!storage.isDemoMode()) {
    // Phase 2: await supabase.from('groups').update(g).eq('id', g.id)
  }
}

export async function deleteGroup(id: string): Promise<void> {
  storage.deleteGroup(id)
  if (!storage.isDemoMode()) {
    // Phase 2: await supabase.from('groups').delete().eq('id', id)
  }
}

// ─── Drafts ───────────────────────────────────────────────────────────────────

export async function getDrafts(): Promise<GreetingDraft[]> {
  return storage.getDrafts()
}

export async function saveDraft(d: GreetingDraft): Promise<void> {
  storage.saveDraft(d)
  if (!storage.isDemoMode()) {
    // Phase 2: await supabase.from('greeting_drafts').upsert(d)
  }
}

export async function deleteDraft(id: string): Promise<void> {
  storage.deleteDraft(id)
  if (!storage.isDemoMode()) {
    // Phase 2: await supabase.from('greeting_drafts').delete().eq('id', id)
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  return storage.getSettings()
}

export async function saveSettings(s: Partial<AppSettings>): Promise<void> {
  storage.saveSettings(s)
  if (!storage.isDemoMode()) {
    // Phase 2: await supabase.from('user_settings').upsert({ ...s, user_id: auth.uid })
  }
}

// ─── Premium ──────────────────────────────────────────────────────────────────
// Premium mutations stay in storageService for Phase 0–3.
// Phase 4: move to server-side Edge Functions + premium_subscriptions table.

export async function getPremiumState(): Promise<PremiumState> {
  return storage.checkAndExpirePremium()
}
