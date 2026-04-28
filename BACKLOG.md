# NeverMiss — Product Backlog
_Last updated: 2026-04-28 | Maintained by Agent 4 (Changelog Manager / Documentation Owner / Backlog Curator)_

> Source of truth: FEATURES.md (features), BUG_REPORT.md (bugs), AGENTS.md (agents).
> BACKLOG.md and BACKLOG.csv are planning views derived from those sources. Do NOT edit directly — update the source first.

---

## Sprint 2 — Next Active Sprint

| Task ID | Task | Priority | Status | Sprint | Type | Owner Agent | Description | Definition of Done |
|---------|------|----------|--------|--------|------|-------------|-------------|-------------------|
| BL-014 | RELIGION_LABELS i18n | 🔴 High | 📋 Backlog | Sprint 2 | Improvement | Agent 1 | HolidayCard and CalendarScreen show religion names in English regardless of locale; need t(`religion_${...}`) lookup | All religion names translated in HE; RTL verified; build+lint pass |
| BL-015 | GreetingEditorScreen tier desc i18n | 🟡 Medium | 📋 Backlog | Sprint 2 | Improvement | Agent 1 | Tier desc fields ('Warm & personal', 'Polished & clear', 'Elevated & bespoke') and signature placeholder are hardcoded EN | All strings via t(); HE translations present; build+lint pass |
| BL-016 | ContactCard action label translation | 🟡 Medium | 📋 Backlog | Sprint 2 | Improvement | Agent 1 | `score.suggestedAction.label` in ContactCard (line 80) shows raw EN — needs useT() + translatedActionLabel like ContactDetailScreen | Label shown in HE when language=he; no regression on EN |
| BL-017 | Missing aria-labels on icon-only buttons | 🟡 Medium | 📋 Backlog | Sprint 2 | Accessibility | Agent 1 | Edit button in ContactDetailScreen + Regenerate/Copy/Advanced toggle/Signature toggle in GreetingEditorScreen have no aria-label | All icon buttons have aria-label via t(); screen reader verified |
| BL-018 | aria-expanded on toggle buttons | 🟡 Medium | 📋 Backlog | Sprint 2 | Accessibility | Agent 1 | Advanced tone options toggle and Signature toggle in GreetingEditorScreen missing aria-expanded | aria-expanded reflects open/closed state; WCAG 4.1.2 |
| BL-019 | React.lazy for remaining screens | 🟡 Medium | 📋 Backlog | Sprint 2 | Performance | Agent 1 | ~15 screens still eagerly imported; only BirthdayCenter/BirthdayGreetingEditor/ImportContacts are lazy; split remaining premium + secondary screens | Bundle size reduced; Suspense fallback inside WithNav; no flash |
| BL-020 | scoringSystem.ts memoization | 🟢 Low | 📋 Backlog | Sprint 2 | Performance | Agent 1 | `calculateRelationshipScore` runs for every contact on every render; add per-contact Map cache keyed by `id + updatedAt` | Score cache hit verified; no stale results on contact edit |
| BL-021 | Pull-to-refresh on Dashboard | 🟢 Low | 📋 Backlog | Sprint 2 | UX | Agent 1 | Mobile users expect pull-to-refresh on a CRM dashboard; currently missing | Touch gesture triggers data recalculation; haptic feedback (if available) |
| BL-022 | Dashboard refresh button (no-op) | 🟢 Low | 📋 Backlog | Sprint 2 | Technical Debt | Agent 1 | Dashboard has a refresh button that is now a no-op since dashboardData uses useMemo; remove or repurpose | Button removed or repurposed; no dead code |

---

## Sprint 3 — Planned

| Task ID | Task | Priority | Status | Sprint | Type | Owner Agent | Description | Definition of Done |
|---------|------|----------|--------|--------|------|-------------|-------------|-------------------|
| BL-023 | Capacitor Local Notifications | 🟡 Medium | 📋 Backlog | Sprint 3 | Feature | Agent 1 | Birthday and holiday push notifications via Capacitor Local Notifications; smart reminder: "Haven't spoken with X in 45 days, birthday in 3 days" | Notifications fire on schedule; HE text used in Hebrew mode; no duplicate notifications |
| BL-024 | Haptic feedback | 🟢 Low | 📋 Backlog | Sprint 3 | Feature | Agent 1 | Capacitor Haptics on key actions: save contact, send greeting, coupon success | Haptic fires on target actions; graceful no-op in web browser |
| BL-025 | Export contacts to CSV | 🟡 Medium | 📋 Backlog | Sprint 3 | Feature | Agent 1 | Premium feature: export all contacts to CSV file; reverse of import | CSV downloadable; all Contact fields included; Premium gate |
| BL-026 | celebrationType field on Contact | 🟢 Low | 📋 Backlog | Sprint 3 | Feature | Foundation Agent | Add `celebrationType: Jewish/Christian/Muslim/Druze/Secular` field to Contact type; filter holiday suggestions by celebrationType | Field stored; ContactForm shows it; holiday filter uses it; Premium optional |
| BL-027 | greetingService.ts refactor | 🟢 Low | 📋 Backlog | Sprint 3 | Technical Debt | Agent 1 | `HOLIDAY_SPECIFIC_BODIES` (~300 lines) inside greetingService.ts; move to `src/data/greetingTemplates.ts` | File split; imports updated; no behavioral change; build+lint pass |
| BL-028 | date-fns named imports | 🟢 Low | 📋 Backlog | Sprint 3 | Performance | Agent 1 | Audit all date-fns imports; ensure all use named imports (not wildcard) for tree-shaking | Bundle size unchanged or reduced; no import regressions |
| BL-029 | Tap target size WCAG 2.5.5 | 🟡 Medium | 📋 Backlog | Sprint 3 | Accessibility | Agent 1 | Some icon-only buttons are ~36×36px; WCAG 2.5.5 requires ≥ 48×48px tap target | All interactive elements ≥ 48px; no layout regressions |
| BL-030 | Import from device contacts | 🟡 Medium | 📋 Backlog | Sprint 3 | Feature | Agent 1 | Capacitor Contacts plugin — read device phonebook (Premium only); show consent screen first | Permission flow in Hebrew; contacts imported correctly; Premium gate |

---

## Sprint 4+ — Future

| Task ID | Task | Priority | Status | Sprint | Type | Owner Agent | Description | Definition of Done |
|---------|------|----------|--------|--------|------|-------------|-------------|-------------------|
| BL-031 | Supabase v2 integration | 🟡 Medium | 📋 Backlog | Sprint 4 | Feature | Agent 1 | Replace localStorage with Supabase cloud sync; stub already prepared in `src/integrations/supabase/client.ts` | Auth + CRUD working; data migration from localStorage; offline fallback |
| BL-032 | PayMe payment integration | 🟡 Medium | 📋 Backlog | Sprint 4 | Feature | Agent 1 | Real payment flow via PayMe; stub at `src/integrations/payment/payme.ts` | Payment page renders; checkout flow in Hebrew; receipt/confirmation |
| BL-033 | Claude AI greeting suggestions | 🟡 Medium | 📋 Backlog | Sprint 4 | Feature | Agent 1 | AI-personalized greeting via Claude API; stub at `src/integrations/ai/claudeClient.ts` | API call works; response integrated into GreetingEditorScreen; Premium gate |
| BL-034 | Backup / restore JSON | 🟢 Low | 📋 Backlog | Sprint 4 | Feature | Agent 1 | Full app data export to JSON; restore from file; useful before cloud sync | Export/import cycle preserves all contacts, groups, drafts |
| BL-035 | Duplicate contact detection | 🟢 Low | 📋 Backlog | Sprint 4 | Feature | Agent 1 | On import and on manual add: detect duplicates by name + phone similarity; offer merge or skip | Detected at import stage; HE UI for merge/skip decision |
| BL-036 | Demo mode with sample data | 🟢 Low | 📋 Backlog | Sprint 4 | Feature | Agent 1 | Onboarding option to pre-fill with realistic sample contacts and holidays for first-time exploration | Sample data loads correctly; can be cleared; doesn't overwrite real data |
| BL-037 | Contact relationship map | 🟢 Low | 📋 Backlog | Sprint 4 | Feature | Agent 1 | Visual graph of relationships and shared holidays (nice-to-have for v2) | Graph renders; zoomable; RTL-aware layout |
| BL-038 | Recurring greeting scheduler | 🟢 Low | 📋 Backlog | Sprint 4 | Feature | Agent 1 | Schedule a reminder to re-send greeting for same holiday next year | Reminder set; notification fires next year; Hebrew UI |

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
