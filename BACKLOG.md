# NeverMiss — Product Backlog
_Last updated: 2026-04-29 | Maintained by Agent 4 (Changelog Manager / Documentation Owner / Backlog Curator)_

## Recently Completed (Sprint 2 — Iterations 16–18)

| Task ID | Task | Priority | Status | Sprint | Type | Files Changed | Description |
|---------|------|----------|--------|--------|------|---------------|-------------|
| BL-039 | BUG: Calendar Birthdays not displayed | 🔴 High | ✅ Done | Sprint 2 | Bug | CalendarScreen.tsx, hebrewDateUtils.ts, i18n/index.ts, types/index.ts | Contact birthdays (and Hebrew birthdays) now appear as pink dots on calendar cells; birthday section panel shows contact names for selected day or full month |
| BL-040 | FEATURE: Hebrew Birthday support | 🟡 Medium | ✅ Done | Sprint 2 | Feature | types/index.ts, hebrewDateUtils.ts, ContactFormScreen.tsx, i18n/index.ts | Optional `hebrewBirthday` field on Contact ("DD-MM" format); Day+Month dropdowns in premium ContactForm; `hebrewBirthdayToGregorianInCalendarYear()` converts to Gregorian for any calendar year; Calendar uses Hebrew date when available |
| BL-014 | RELIGION_LABELS i18n | 🔴 High | ✅ Done | Sprint 2 | Improvement | CalendarScreen.tsx, HolidayCard.tsx | Already implemented — t(`religion_${...}`) in use; all keys present in both EN+HE |
| BL-015 | GreetingEditorScreen tier desc i18n | 🟡 Medium | ✅ Done | Sprint 2 | Improvement | GreetingEditorScreen.tsx, i18n/index.ts | Tier descs + signature placeholder via t(); 4 new i18n keys; aria-labels on Regenerate/Copy |
| BL-016 | ContactCard action label translation | 🟡 Medium | ✅ Done | Sprint 2 | Improvement | ContactCard.tsx | ACTION_KEY map + useT(); action label shown in Hebrew when language=he |
| BL-017 | Missing aria-labels on icon-only buttons | 🟡 Medium | ✅ Done | Sprint 2 | Accessibility | ContactDetailScreen.tsx, GreetingEditorScreen.tsx | aria-label via t() on Edit, Regenerate, Copy buttons |
| BL-018 | aria-expanded on toggle buttons | 🟡 Medium | ✅ Done | Sprint 2 | Accessibility | GreetingEditorScreen.tsx | aria-expanded on Advanced tone + Signature toggles; WCAG 4.1.2 |
| BL-041 | Celebration feedback on Mark as Contacted | 🟡 Medium | ✅ Done | Sprint 2 | Improvement | ContactDetailScreen.tsx, index.css | 6-emoji particle burst + Web Audio ping (880→1200Hz) + haptic (navigator.vibrate 40ms); respects prefers-reduced-motion |
| BL-019 | React.lazy for remaining screens | 🟡 Medium | ✅ Done | Sprint 2 | Performance | App.tsx | 13 screens converted to lazy chunks; Suspense fallback inside WithNav; main bundle 435→285 kB (37 kB gzip saved); premium route inner Suspense simplified |
| BL-020 | scoringSystem.ts memoization | 🟢 Low | ✅ Done | Sprint 2 | Performance | src/core/scoringSystem.ts | Module-level Map cache keyed by `id|updatedAt`; cache hit prevents all recalculation for unchanged contacts; stale results impossible since updatedAt is always set on mutation |
| BL-021 | Pull-to-refresh on Dashboard | 🟢 Low | ✅ Done | Sprint 2 | UX | DashboardScreen.tsx | Already implemented — touchStart/Move/End handlers; PULL_THRESHOLD=64px; RefreshCw visual indicator; i18n keys dashboard_pull_refresh / dashboard_release_refresh |
| BL-022 | Dashboard refresh button (no-op) | 🟢 Low | ✅ Done | Sprint 2 | Technical Debt | DashboardScreen.tsx | No standalone refresh button exists; RefreshCw used only in pull indicator; refreshDashboard() stub wired to pull gesture only — no dead button |

> Source of truth: FEATURES.md (features), BUG_REPORT.md (bugs), AGENTS.md (agents).
> BACKLOG.md and BACKLOG.csv are planning views derived from those sources. Do NOT edit directly — update the source first.

---

## Sprint 2 — ✅ COMPLETE

All Sprint 2 tasks are done. See "Recently Completed" section above.

---

## Sprint 6 — ✅ COMPLETE

| Task ID | Task | Priority | Status | Sprint | Type | Files Changed | Description |
|---------|------|----------|--------|--------|------|---------------|-------------|
| BL-053 | FINDING 86: Extract SUGGESTED_BASES to groupSuggestions.ts | 🟢 Low | ✅ Done | Sprint 6 | Tech Debt | src/data/groupSuggestions.ts, GroupsScreen.tsx | New shared data file; GroupsScreen imports SUGGESTED_BASES from it |
| BL-054 | FINDING 75/87: applyPurpose prunes old-purpose suggestions | 🟡 Medium | ✅ Done | Sprint 6 | Bug | GroupsScreen.tsx | Purpose change now removes previous purpose's suggestions before adding new ones |
| BL-055 | FINDING 31: Remove redundant "1:00" from recording UI | 🟢 Low | ✅ Done | Sprint 6 | UX | MediaAttachmentPicker.tsx | media_record_limit key already says "Max 60 seconds"; removed duplicate hardcoded suffix |
| BL-056 | FINDING 49: "Send to group" navigates to greeting editor | 🟡 Medium | ✅ Done | Sprint 6 | UX | DashboardScreen.tsx | CTA now opens /greeting?contactId=&holidayId= for first group contact instead of generic /contacts |
| BL-057 | FINDING 76/81: findDuplicate covers edits + self-exclusion | 🟡 Medium | ✅ Done | Sprint 6 | Bug | ContactFormScreen.tsx | Duplicate check runs on save for both new and edited contacts; self-excluded by contact.id |
| BL-058 | FINDING 84/85: Group assign robustness in ImportContactsScreen | 🟡 Medium | ✅ Done | Sprint 6 | Bug | ImportContactsScreen.tsx, i18n/index.ts | Card hidden when 0 contacts imported; try/catch + Hebrew error toast on assign failure |

---

## Sprint 3/4 — In Progress

| Task ID | Task | Priority | Status | Sprint | Type | Files Changed | Description |
|---------|------|----------|--------|--------|------|---------------|-------------|
| BL-043 | BUG: Multi-day holidays show only first day | 🔴 High | ✅ Done | Sprint 3/4 | Bug | CalendarScreen.tsx | getHolidaysForDay now checks [date, endDate] range; monthly list shows holidays overlapping the visible month |
| BL-044 | BUG: Sukkot 2026 missing | 🔴 High | ✅ Done | Sprint 3/4 | Bug | holidays.ts | Added sukkot-2026 (Sep 25–Oct 2, 2026 / 15–22 Tishrei 5787) |
| BL-045 | IMPROVEMENT: Celebration feedback on Mark as Contacted | 🟡 Medium | ✅ Done | Sprint 3/4 | Improvement | ContactDetailScreen.tsx, index.css | Sound: C5/E5/G5 major triad arpeggio replaces harsh oscillator. Animation: 10 particles (up from 6), text-xl, scale-pop keyframe, wider spread (±85px h, ±110px v), 1.4s duration |

---

## Sprint 3 — ✅ COMPLETE

| Task ID | Task | Priority | Status | Sprint | Type | Owner Agent | Description |
|---------|------|----------|--------|--------|------|-------------|-------------|
| BL-023 | Smart Overdue Notifications | 🟡 Medium | ✅ Done | Sprint 3 | Feature | Agent 1 | Added overdue-contact notification (45-day threshold) to notificationService.ts; skips contacts covered by birthday reminders; i18n EN+HE |
| BL-026 | celebrationType field on Contact | 🟢 Low | ✅ Done | Sprint 3 | Feature | Foundation Agent | CelebrationType type + Contact field; 5-value select in ContactForm Cultural section; CELEBRATION_TO_RELIGION map in scoringSystem filters holiday suggestions; i18n EN+HE |
| BL-030 | Import from device contacts | 🟡 Medium | ✅ Done | Sprint 3 | Feature | Agent 1 | @capacitor-community/contacts installed; DeviceContactsScreen with consent/permission/list/import flow; graceful web fallback; phone dedup; Premium gate; route /device-contacts; shortcut card in ImportContactsScreen |

---

## Sprint 7 — ✅ COMPLETE

| Task ID | Task | Priority | Status | Sprint | Type | Owner Agent | Description |
|---------|------|----------|--------|--------|------|-------------|-------------|
| BL-036 | Demo mode with sample data | 🟢 Low | ✅ Done | Sprint 7 | Feature | Agent 1 | `src/data/demoData.ts`: 6 sample contacts (Sarah Cohen/Ahmed Al-Rashid/David Levi/Maria García/Yosef Mizrahi/Nadia Khalil) + 2 groups (Jewish Holidays, VIP Clients). Storage routing: `isDemoMode()/enableDemoMode()/clearDemoMode()` in `storageService.ts`; getContacts/saveContacts/getGroups/saveGroups routed to `nm_demo_*` keys when active. AppContext: `isDemoMode`, `enableDemo`, `clearDemo` exposed. OnboardingScreen: "Try Demo" button on last slide. App.tsx: `DemoBanner` fixed at top (gradient purple) with Exit button. SettingsScreen: "Exit Demo Mode" card when isDemoMode. |
| i18n-S7 | i18n: BirthdayCenterScreen + bonus fixes | 🔴 High | ✅ Done | Sprint 7 | Improvement | Agent 1 | 20 new keys EN+HE: `birthday_heroSubtitle/contactCount/noneTracked/todayBadge/itsTheirBirthday/day/days`, `contacts_addContact`, `calendar_prevMonth/nextMonth`, `groups_searchHolidays`, `dashboard_isTomorrow/prepareGreetings`, `demo_banner/loadData/clear/clearConfirm/cleared`. Fixed 7 strings in BirthdayCenterScreen + 6 across Dashboard/Contacts/Calendar/Groups/HolidayDetail. |

---

## Sprint 8 — ✅ COMPLETE

**Focus: Stability · Accessibility · RTL/Hebrew Correctness**

| Task ID | Task | Priority | Status | Sprint | Type | Owner Agent | Description |
|---------|------|----------|--------|--------|------|-------------|-------------|
| F28D | FINDING 28D: GreetingRow RTL dir detection | 🔴 High | ✅ Done | Sprint 8 | Bug | Agent 1 | `dir()` function added to `src/i18n/index.ts` (RTL_LANG_CODES Set: he/ar/fa/ur/yi/dv). `GreetingRow` gains `langCode` prop; `dir` attribute uses `dir(langCode)` instead of fragile string comparison. 4 call sites pass `'he'`/`'ar'`/`'en'` literals. |
| F29A | FINDING 29A: ContactFormScreen Avatar Color label | 🟡 Medium | ✅ Done | Sprint 8 | Bug | Agent 1 | Added `contactForm_avatarColor` key (EN: 'Avatar Color' / HE: 'צבע אווטאר') to i18n. Replaced hardcoded `"Avatar Color"` with `{t('contactForm_avatarColor')}`. |
| F29B | FINDING 29B: ContactFormScreen Auto gradient aria-label | 🔴 High | ✅ Done | Sprint 8 | Bug | Agent 1 | Added `contactForm_autoGradient` key (EN: 'Auto gradient' / HE: 'גרדיאנט אוטומטי') to i18n. Replaced `title="Auto gradient"` with `aria-label={t('contactForm_autoGradient')}` — fixes WCAG 4.1.2. |
| F29C | FINDING 29C: PremiumFeaturePrompt feature prop | 🟡 Medium | ✅ Done | Sprint 8 | Bug | Agent 1 | Already fixed: `feature={t('premium_feat_birthday_fields')}` confirmed in code. No change required. |

---

## Sprint 4+ — Future

| Task ID | Task | Priority | Status | Sprint | Type | Owner Agent | Description | Definition of Done |
|---------|------|----------|--------|--------|------|-------------|-------------|-------------------|
| BL-024 | Haptic feedback | 🟢 Low | ✅ Done | Sprint 4 | Feature | Agent 1 | Capacitor Haptics on key actions: save contact, send greeting, coupon success | Haptic fires on target actions; graceful no-op in web browser |
| BL-025 | Export contacts to CSV | 🟡 Medium | ✅ Done | Sprint 4 | Feature | Agent 1 | Premium feature: export all contacts to CSV file; reverse of import | CSV downloadable; all Contact fields included; Premium gate |
| BL-027 | greetingService.ts refactor | 🟢 Low | ✅ Done | Sprint 4 | Technical Debt | Agent 1 | `HOLIDAY_SPECIFIC_BODIES` already in `src/data/greetingTemplates.ts` — refactor was already done | Already done, verified by inspection |
| BL-028 | date-fns named imports | 🟢 Low | ✅ Done | Sprint 4 | Performance | Agent 1 | All date-fns imports verified as named — already correct | Already done, verified by inspection |
| BL-029 | Tap target size WCAG 2.5.5 | 🟡 Medium | ✅ Done | Sprint 4 | Accessibility | Agent 1 | 9 icon-only buttons upgraded: Navigation, Modal, ContactDetail, ContactForm, GroupsScreen, GreetingEditor, HolidayDetail, BirthdayGreetingEditor | All audited icon-only buttons ≥ 48px; no layout regressions |
| BL-034 | Backup / restore JSON | 🟢 Low | ✅ Done | Sprint 4 | Feature | Agent 1 | Full app data export to JSON; restore from file; useful before cloud sync | Export/import cycle preserves all contacts, groups, drafts |
| BL-035 | Duplicate contact detection | 🟢 Low | ✅ Done | Sprint 4 | Feature | Agent 1 | On manual add: detect duplicates by name + phone similarity; Modal offers Save Anyway or Cancel | Detected on new contact; HE UI for decision |
| BL-031 | Supabase v2 integration | 🟡 Medium | 📋 Backlog | Sprint 5 | Feature | Agent 1 | Replace localStorage with Supabase cloud sync; stub already prepared in `src/integrations/supabase/client.ts` | Auth + CRUD working; data migration from localStorage; offline fallback |
| BL-032 | PayMe payment integration | 🟡 Medium | 📋 Backlog | Sprint 9 | Feature | Agent 1 | Real payment flow via PayMe; stub at `src/integrations/payment/payme.ts` | Payment page renders; checkout flow in Hebrew; receipt/confirmation |
| BL-033 | AI greeting suggestions (template-based MVP) | 🟡 Medium | 📋 Backlog | Sprint 10 | Feature | Agent 1 | Premium-only "AI Suggestions" button in GreetingEditorScreen. Generates 2–3 distinct greeting options using deterministic templates keyed by greeting tone (VIP / Professional / Casual) + holiday context. No external API — simulates AI value through variation and tone-awareness. User picks one option; it fills the message field. Future sprint will wire to real Claude API when ready. Stub at `src/integrations/ai/claudeClient.ts` remains untouched. | (1) Button visible in GreetingEditorScreen, premium-gated (free users see lock/upsell); (2) Clicking generates exactly 2–3 options, each meaningfully different by tone; (3) Options vary when a holiday is selected vs. generic reach-out; (4) Selecting an option populates the message field; (5) All option text in Hebrew when language=he; RTL correct; (6) No real API call — fully deterministic; (7) Build + lint pass; no regressions |
| BL-036 | Demo mode with sample data | 🟢 Low | ✅ Done | Sprint 7 | Feature | Agent 1 | 6 sample contacts + 2 groups in demoData.ts; storage routing via nm_demo_* keys; Try Demo button on Onboarding last slide; DemoBanner with Exit; Clear Demo in Settings; real data fully isolated | Sample data loads; DemoBanner shown; Exit clears demo data; real data untouched |
| BL-037 | Contact relationship map | 🟢 Low | 📋 Backlog | Sprint 5 | Feature | Agent 1 | Visual graph of relationships and shared holidays (nice-to-have for v2) | Graph renders; zoomable; RTL-aware layout |
| BL-038 | Recurring greeting scheduler | 🟢 Low | 📋 Backlog | Sprint 5 | Feature | Agent 1 | Schedule a reminder to re-send greeting for same holiday next year | Reminder set; notification fires next year; Hebrew UI |
| BL-046 | Move Import Contacts entry point to Contacts tab | 🔴 High | 📋 Backlog | Sprint 5 | UX | Agent 1 | Import Contacts primary CTA should live in Contacts tab (not just Settings); current ImportContactsScreen already exists; add visible entry in ContactsScreen (e.g. empty-state CTA or header button) | Import entry visible in Contacts tab; existing premium gate preserved; no duplicate screens |
| BL-047 | Clarify import formats — CSV-only label | 🔴 High | 📋 Backlog | Sprint 5 | UX | Agent 1 | ImportContactsScreen currently does not communicate supported formats; show: "כרגע ניתן לייבא קובץ CSV בלבד" near the upload area | Hebrew format label displayed; no format confusion |
| BL-048 | Device contacts import visibility in ImportContactsScreen | 🔴 High | 📋 Backlog | Sprint 5 | UX | Agent 1 | The shortcut card to /device-contacts was added to ImportContactsScreen (Sprint 3) but may not be prominent enough; ensure it is clearly visible and labeled | Device contacts import card visible at top of ImportContactsScreen; shortcut works end-to-end |
| BL-049 | Improve active tab indication in BottomNav | 🟡 Medium | 📋 Backlog | Sprint 5 | UX | Agent 1 | Active tab icon/label distinction may be subtle; increase contrast or add filled-icon style for active state | Active tab clearly distinguishable at a glance; no regression on theme support |
| BL-050 | Assign imported contacts to a group | 🟡 Medium | 📋 Backlog | Sprint 5 | Feature | Agent 1 | After CSV or device import, allow user to assign batch to existing group, create new group, or skip; shown as optional step after import preview | Group assignment step available post-import; existing/new/none options; Hebrew UI |
| BL-051 | Premium Excel import template | 🟡 Medium | 📋 Backlog | Sprint 5 | Feature | Agent 1 | Provide downloadable Excel (.xlsx) template with correct column headers for premium users; shown in ImportContactsScreen | Template downloads with all Contact field headers; Hebrew column names supported |
| BL-052 | Smart holiday suggestions based on group purpose | 🟡 Medium | 📋 Backlog | Sprint 5 | Improvement | Agent 1 | Add "Group Purpose" field (Family/Friends/Work/Clients/HR/Community/Custom) to Create/Edit Group modal; auto-suggest relevant holidays as pre-checked checkboxes based on purpose; user can accept all, remove individual suggestions, or add manually; existing selected holidays preserved; no duplicates | Group purpose selectable; relevant holidays auto-suggested; user can edit; existing holidays preserved; no duplicates; Hebrew/RTL; build passes; no regressions |
| BL-059 | Premium holiday reminder notifications | 🟡 Medium | 📋 Backlog | Sprint 9 | Feature | Agent 1 | Premium-only: when a contact has an upcoming holiday, user can configure reminder channels — Push, SMS, Email, WhatsApp. Per-channel toggle per event type. Duplicate prevention: same contact + same holiday pair never fires twice (tracked via localStorage). Free users see locked state via existing `PremiumFeaturePrompt` upsell flow. No provider integration in this sprint — UI + state logic only. | Channel toggles work per contact+holiday; dedup prevents double-fire; free users see premium lock; UI and state fully in Hebrew; build+lint pass |
| BL-062 | BUG: Upgrade screen CTA provider-specific text + unclear hero title | 🔴 High | ✅ Done | Sprint 10 | Bug | Agent 1 | CTA button text said "שלם עם PayMe" (provider mention — violates no-provider rule). Hero title said "פתח הכל" (unclear). Fix: add generic `upgrade_cta` i18n key (EN: 'Upgrade Now' / HE: 'שדרג עכשיו'); change `upgrade_unlockEverything` HE to 'שדרג לפרמיום'. | CTA uses generic text; no provider name visible; hero title clearly says "שדרג לפרמיום" in Hebrew; build+lint pass |
| BL-063 | BUG: Greeting type not applied + incorrect Hebrew grammar | 🔴 High | 📋 Backlog | Sprint 11 | Bug | Agent 1 | (1) Switching VIP/Professional/Casual tier does NOT auto-regenerate the message — `tone` state updates but displayed text stays stale; user must manually re-click Generate to see the change. (2) Hebrew `friendly` body templates contain unnatural/grammatically incorrect phrasing (e.g. `"לברר מה שלומך"` — should be `"לאחל"` / `"לשאול"`); full template review needed. Fix must NOT use AI API — stub/templates only, no hardcoded text in components, changes through i18n/templates. | Switching tier immediately updates output; Hebrew phrasing is natural and grammatically correct; no duplicate templates; RTL intact; build+lint pass |
| BL-060 | Special secular and national dates in holiday calendar | 🟡 Medium | 📋 Backlog | — | Feature | Agent 1 | Add national and secular dates to holidays.ts and the calendar system: יום השואה (Yom HaShoah), יום הזיכרון (Yom HaZikaron), יום השואה הבינלאומי (Jan 27), יום העצמאות של ארה"ב (Jul 4), יום הזיכרון של ארה"ב (last Monday of May), plus any other relevant national/secular dates already in scope. All must appear under the Secular/National filter category (religion: Secular). RTL and Hebrew display required. | All dates appear in calendar with correct dates; filter shows them under Secular/National; Hebrew names render RTL correctly; no regression on existing holidays |
| BL-061 | Religion descriptions for each supported religion | 🟢 Low | 📋 Backlog | — | Feature | Agent 1 | Add a short 1–2 sentence description for each religion in the system (Judaism, Islam, Christianity, Druze, Buddhism, Hinduism, Sikhism, Bahá'í, East Asian, Secular), covering: what it is, who observes it, and relevant cultural context for greeting purposes. Display in religion selector or info tooltip in ContactFormScreen and/or CalendarScreen. Hebrew and English versions required; RTL support required. | Descriptions visible in UI for all 10 religions; EN+HE versions present; RTL correct; no regression on existing religion selectors |
| BL-064 | One-tap greeting send flow | 🔴 High | 📋 Backlog | — | Feature | Agent 1 | When a contact has an upcoming holiday or birthday, surface an inline "Send Greeting" CTA directly from the reminder/dashboard alert. User taps → sees 2–3 pre-generated greeting options (from aiSuggestionsService) → selects one → opens the selected channel (WhatsApp/SMS/Email) pre-filled. Goal: minimize steps from "reminder received" to "greeting sent" to near-zero. No automated sending — user still confirms in the channel app. MVP: no push notifications integration; trigger from Dashboard alert cards. | Greeting CTA visible on dashboard holiday/birthday alert cards; tapping shows options panel; selecting opens pre-filled channel; no extra navigation; build+lint pass |
| BL-065 | AI personalized greeting generation — dynamic mode | 🟡 Medium | 📋 Backlog | — | Feature | Agent 1 | Extend the AI suggestions engine (BL-033) beyond fixed templates: generate greetings that incorporate contact-specific details — relationship type (family/friend/manager/client), last contact date, shared holidays, custom notes. Each greeting should feel unique and less templated than the current 3-option set. MVP: no real Claude API — use deterministic variation logic seeded by contact fields. Future: wire to claudeClient.ts (real AI). Premium-gated, Hebrew/RTL required. | Output varies meaningfully per contact even for the same tone+holiday; relationship type changes the register; build+lint pass; no regressions on BL-033 |
| BL-066 | Recurring and smart reminder automation | 🟡 Medium | 📋 Backlog | — | Feature | Agent 1 | Allow users to: (1) mark a holiday/birthday reminder as "remind me every year" — stored in localStorage as a recurring rule; (2) define group-level reminders (e.g. "remind me 7 days before any holiday for my Clients group"); (3) set a custom lead time per VIP contact (e.g. 14 days instead of 7). MVP: localStorage-based rules engine, no background execution — rules are evaluated at app open and surfaced on dashboard. Push notification scheduling (Capacitor) is a stretch goal. Premium-gated for group rules and VIP lead times; Hebrew/RTL required. | Yearly recurrence toggle visible on holiday detail; group reminder rules configurable; VIP lead time customizable; rules evaluate on app open; build+lint pass |
| BL-067 | Personal user layer — first-use setup + personalized entry screen | 🔴 High | 📋 Backlog | Sprint 12+ | Feature | Agent 1 | On first visit, ask the user their name (single input screen, no auth). Store in localStorage. On all subsequent visits, show a personalized entry: "Hey {name} 👋 / יאללה {name} 👋" + "You have X greetings to send today" / "שלחת ברכה ל-X אנשים החודש". If no upcoming events: "Let's send your first greeting" / "בוא נשלח את הברכה הראשונה שלך". Context panel on dashboard: upcoming events (next 7 days), pending greetings (contacts with birthday/holiday within 3 days not yet greeted), recent contacts (last 3 greeted). No auth, no backend — localStorage only. Hebrew/RTL required. | Name prompt shown on first launch only; name persisted across sessions; personalized greeting shown on entry; context panel visible on dashboard; empty states handle no-data gracefully; build+lint pass |
| BL-068 | Add contacts to group from group screen | 🟡 Medium | 📋 Backlog | — | Feature | Agent 1 | When viewing or creating a group, allow the user to select which contacts belong to the group. Show a searchable list of existing contacts with checkboxes. Selected contacts are assigned to the group on save. Hebrew/RTL required. | Contacts list visible in group form; searchable; checkboxes work; selected contacts saved to group; build+lint pass |
| BL-069 | Assign contact to group when adding a new contact | 🟡 Medium | 📋 Backlog | — | Feature | Agent 1 | When adding a new contact, add an optional field to assign the contact to an existing group. The contact is assigned to the selected group upon save. Hebrew/RTL required. | Group field visible in contact form; optional (not required); existing groups listed; contact saved with group assignment; build+lint pass |

---

## Sprint 1 — Completed

> Will be archived to the Archive section after Sprint 3.

| Task ID | Task | Priority | Status | Sprint | Type | Owner Agent | Description | Definition of Done |
|---------|------|----------|--------|--------|------|-------------|-------------|-------------------|
| BL-S1-01 | BUG-020 DST birthday fix | 🔴 High | ✅ Done | Sprint 1 | Bug | Agent 1 | `getBirthdayDaysUntil` raw ms division returns -1 on DST spring-forward; replaced with `differenceInCalendarDays` | Build+lint pass; DST no longer affects birthday countdown |
| BL-S1-02 | BUG-021 key stability ImportContacts | 🟡 Medium | ✅ Done | Sprint 1 | Bug | Agent 1 | `key={i}` on CSV preview rows and error strings; replaced with `key={\`row-${i}\`}` and `key={e}` | No React reconciliation warnings; stable keys on re-render |
| BL-S1-03 | i18n: urgency/freq/action/go_back/holiday/about keys | 🔴 High | ✅ Done | Sprint 1 | Improvement | Foundation Agent | 39 new i18n keys (urgency_*, go_back, action_*, holiday_major, holiday_moreContacts, about_*) in EN + HE | All keys present in both locales; no fallback-to-key rendering |
| BL-S1-04 | Navigation.tsx go_back translated (FINDING 25A) | 🟡 Medium | ✅ Done | Sprint 1 | Accessibility | Agent 1 | `aria-label="Go back"` hardcoded EN in PageHeader; replaced with `t('go_back')` | HE: aria-label="חזור"; build+lint pass |
| BL-S1-05 | ContactDetailScreen i18n fixes (FINDING 20/23) | 🔴 High | ✅ Done | Sprint 1 | Improvement | Agent 1 | urgencyLevel, interactionFrequency, and suggestedAction.label always shown in EN; replaced with t() + translatedActionLabel | All 3 fields render in HE when language=he |
| BL-S1-06 | HolidayDetailScreen i18n (FINDING 28A) | 🟡 Medium | ✅ Done | Sprint 1 | Improvement | Agent 1 | "★ Major" and "+N more contacts" hardcoded EN; replaced with t('holiday_major') and t('holiday_moreContacts') | Renders in HE; correct counts |
| BL-S1-07 | AboutScreen full i18n (FINDING 27) | 🟡 Medium | ✅ Done | Sprint 1 | Improvement | Agent 1 | VALUES/TECH arrays + mission paragraph all hardcoded EN (16 strings); replaced all with t() | AboutScreen fully HE in Hebrew mode |
| BL-S1-08 | Dashboard/Groups div→button (FINDING 67) | 🔴 High | ✅ Done | Sprint 1 | Accessibility | Agent 1 | Today-highlight cards in Dashboard and group cards in GroupsScreen were `<div onClick>` — not keyboard accessible | Elements are `<button type=button>`; Tab+Enter works |
| BL-S1-09 | .btn:focus-visible rule (FINDING 69) | 🟡 Medium | ✅ Done | Sprint 1 | Accessibility | Agent 1 | `.btn` class lacked `:focus-visible` rule; primary buttons relied on UA default only | `outline: 2px solid var(--color-primary)` on focus; all 6 themes verified |
| BL-S1-10 | Desktop full-width layout | 🔴 High | ✅ Done | Sprint 1 | Bug | Agent 1 | `.app-layout` had `max-width: 480px` — app showed as narrow column on desktop/web | `@media (min-width: 768px)` removes constraint; full viewport on desktop |
| BL-S1-11 | Modal close aria-label (FINDING 30B) | 🟡 Medium | ✅ Done | Sprint 1 | Accessibility | Agent 1 | `aria-label="Close"` hardcoded EN in Modal.tsx; Modal had no useT() | Modal imports useT(); aria-label uses t('close') |
| BL-S1-12 | ImportContactsScreen finally block (FINDING 60) | 🟡 Medium | ✅ Done | Sprint 1 | Bug | Agent 1 | `setImporting(false)` placed after try/catch block, not in finally; import button could stay locked | `setImporting(false)` now in finally block |
| BL-S1-13 | ContactCard aria-hidden icons (FINDING 66) | 🟢 Low | ✅ Done | Sprint 1 | Accessibility | Agent 1 | Crown and Building2 icons in ContactCard missing `aria-hidden="true"`; verbose screen reader output | `aria-hidden="true"` on both icons |

---

## Archive

> Tasks completed 2+ sprints before current sprint. Never deleted — reference only.

| Task ID | Task | Sprint Completed | Completion Notes |
|---------|------|-----------------|-----------------|
| ARC-001 | storageService.ts silent catch | Iter. 1 | Added console.warn on JSON.parse failure (BUG-001) |
| ARC-002 | AppContext whole-tree re-render fix | Iter. 2 | Wrapped provider value in useMemo |
| ARC-003 | avatarUtils.ts — gradient consistency | Iter. 3 | Extracted to shared util with Map cache; fixed 8→10 gradient count (BUG-002) |
| ARC-004 | AppContext useMemo dashboardData | Iter. 4 | Replaced useState+useCallback+useEffect triple with useMemo |
| ARC-005 | HolidayCard full i18n | Iter. 5 | today/tomorrow/calendar_passed/days keys via t() |
| ARC-006 | GreetingEditorScreen i18n + labelHe removal | Iter. 6 | Removed labelHe hack; 8 strings via t(); 11 new i18n keys |
| ARC-007 | BUG-003–019: 17 lint errors | Iter. 5 | Agent 5 fixed across 9 files |
| ARC-008 | Feature Sprint F1: Greeting Media | Sprint F1 | MediaAttachmentPicker + GreetingEditor + WhatsAppButton image clipboard |
| ARC-009 | Feature Sprint F1: Multi-Channel Sending | Sprint F1 | Channel picker (WhatsApp/SMS/Email/Copy/Share) |
| ARC-010 | Feature Sprint F1: Group Holiday Assignment | Sprint F1 | holidayIds on Group; dashboard alerts |
| ARC-011 | Feature Sprint F1: Coupon System | Sprint F1 | NEVERMISS1/WELCOME2025/ISRAEL30; expiry logic; Settings display |
| ARC-012 | CalendarScreen key={h.id} fix | Iter. 7 | BUG-022 fixed — holiday dot reconciliation |
| ARC-013 | ContactCard div→button (WCAG 2.1.1) | Iter. 8 | Keyboard-accessible contact cards |
| ARC-014 | .card-interactive:focus-visible ring | Iter. 9 | WCAG 2.4.7 focus visible on cards |
| ARC-015 | WhatsApp phone normalization | Iter. 10 | Israeli local numbers (052-xxx → E.164) |
| ARC-016 | BUG-031–035 | Iter. 11 | CSS calc, 00-prefix, empty guard, execCommand, useMemo deps |
| ARC-017 | Hebrew calendar integration | Iter. 11 | @hebcal/core HDate + gematriya in CalendarScreen |
| ARC-018 | QA infrastructure | Iter. 11 | qa_status.json, make-qa-checklist.js, NeverMiss_QA_Checklist.xlsx, changelog_queue.json |
| ARC-019 | Modal focus trap | Sprint F1 | Tab/Shift+Tab trapped; focus restored on close |
| ARC-020 | Premium system | Sprint F1 | Free (20 contacts) / Premium gating; coupon redemption; expiry |
| ARC-021 | BUG-023 isOnboardingDone every render | Iter. 4 | Moved to useMemo in App.tsx (line 76) |
