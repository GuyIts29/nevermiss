# NeverMiss — Agent Definitions & Activity Log

> Derived from CLAUDE.md, BUG_REPORT.md, agent_state/, and git history.
> Last updated: 2026-04-28 | Iteration 12 complete. Sprint 2 in progress.

---

## Agent 1 — Developer

**Responsibility:** Implements features and bug fixes. Reads research notes from Agent 2 and review notes from Agent 3. ONLY implements, does NOT review.

**Actions taken so far:**
- Iteration 1: `storageService.ts` — added `console.warn` to silent catch block
- Iteration 2: `AppContext.tsx` — wrapped provider value in `useMemo`; simplified LIMITS literal
- Iteration 3: Created `src/utils/avatarUtils.ts` with Map cache; fixed 6 files using wrong gradient count (8→10 gradients visual bug)
- Iteration 4: `AppContext.tsx` — replaced `dashboardData` useState+useCallback+useEffect triple with `useMemo`; hoisted LIMITS to module scope
- Iteration 5: `HolidayCard.tsx` — added `useT()` + replaced 6 hardcoded EN strings with `t()` keys
- Iteration 6: `GreetingEditorScreen.tsx` — removed `labelHe` hack, replaced 8 strings with `t()`, added 11 i18n keys
- Feature Sprint F1: MediaAttachmentPicker, GreetingEditor media integration, WhatsAppButton preview, GroupsScreen holiday picker, DashboardScreen group alerts, UpgradeScreen coupon system, SettingsScreen premium expiry
- Iteration 7: `CalendarScreen.tsx` — `key={i}` → `key={h.id}` on holiday dots
- Iteration 8: `ContactCard.tsx` — `<div onClick>` → `<button type="button">` (WCAG 2.1.1 fix)
- Iteration 9: `index.css` — added `.card-interactive:focus-visible` rule (WCAG 2.4.7)
- Iteration 10: `communicationService.ts` — Israeli local phone normalization (052-xxx → E.164)
- Iteration 11: `SettingsScreen.tsx` language toggle CSS fix; `WhatsAppButton.tsx` image clipboard; `communicationService.ts` 00-prefix + execCommand removal; `CalendarScreen.tsx` Hebrew calendar (HDate/gematriya); `i18n/index.ts` new keys
- Iteration 12: `scoringSystem.ts` DST fix (differenceInCalendarDays); `i18n/index.ts` 39 new keys (urgency/freq/action/go_back/holiday/about); `Navigation.tsx` go_back translated; `ContactDetailScreen.tsx` urgency+freq+suggestedAction translated; `HolidayDetailScreen.tsx` holiday_major/moreContacts; `DashboardScreen.tsx` div→button; `GroupsScreen.tsx` div→button; `index.css` .btn:focus-visible + desktop layout; `Modal.tsx` t('close'); `ImportContactsScreen.tsx` finally block; `AboutScreen.tsx` full i18n; `ContactCard.tsx` aria-hidden icons

---

## Agent 2 — Researcher

**Responsibility:** Suggests max 3 improvements per iteration. Does NOT change code. Writes findings to `agent_state/research_notes.md`.

**Actions taken so far:**
- Seeded research_notes.md with initial architecture observations
- FINDING 1: AppContext whole-tree re-render on every state change
- FINDING 2: AppContext double-render cycle per contact mutation
- FINDING 3: ContactCard unstable handleClick + getAvatarGradient recalculation
- FINDING 4: getAvatarGradient copy-paste in 6 files with divergent gradient counts
- FINDING 5: DashboardScreen 8+ hardcoded EN strings
- FINDING 6: DashboardScreen 7 inline arrow functions with no useCallback
- FINDING 7: AppContext double-render still live after useMemo fix
- FINDING 8: App.tsx 18 eager screen imports (no code splitting)
- FINDING 9: HolidayCard.tsx + GreetingEditorScreen hardcoded i18n strings
- FINDING 10–18: Continued i18n gaps, performance issues, key={i} bugs
- FINDING 19–30: ContactDetailScreen, GroupsScreen, Modal, HolidayDetailScreen, BirthdayCenterScreen gaps
- FINDING 71–73: communicationService.ts edge cases (00-prefix, empty guard, execCommand)
- Iteration 12: Identified FINDINGS 20/23/25A/27/28A/30B/60/67/69 as still open; all resolved in iteration 12; top new findings seeded for Sprint 2: RELIGION_LABELS (BL-014), GreetingEditorScreen tier desc (BL-015), ContactCard action label (BL-016)

---

## Agent 3 — Code Reviewer

**Responsibility:** Validates every Agent 1 change. Does NOT implement. Writes to `agent_state/review_notes.md`.

**Actions taken so far:**
- Verified storageService.ts catch block fix (iteration 1)
- Verified AppContext useMemo fix and LIMITS hoisting (iterations 2, 4)
- Verified avatarUtils.ts implementation — confirmed Map cache and hash algorithm (iteration 3)
- Verified HolidayCard i18n fix, GreetingEditorScreen labelKey union type (iterations 5, 6)
- Feature sprint F1: Reviewed all 7 features; flagged 5 must-fix issues (FINDING 28, 30, 31, 35, 49, 51)
- Verified CalendarScreen key={h.id} fix and ImportContactsScreen error state (iteration 7)
- Verified ContactCard button conversion + WCAG findings 64–66 (iteration 8)
- Verified focus-visible ring + found themes with insufficient contrast (iteration 9)
- Verified WhatsApp phone normalization + flagged 00-prefix, empty guard, execCommand (iteration 10)
- Iteration 12: Verified all 13 backlog items; QA confirmed 56✅/0❌/1⚠️; new BL-017/018 (aria-labels/aria-expanded) flagged for Sprint 2

---

## Agent 4 — Changelog Manager / Documentation Owner / Backlog Curator

**Responsibility:** Updates `changelog.xlsx` (via `node scripts/make-changelog.js`), `BUG_REPORT.md`, `FEATURES.md`, `BACKLOG.md`, `BACKLOG.csv`, and `AGENTS.md` after every change. Reads from `agent_state/changelog_queue.json`. Owns all documentation artifacts. Maintains backlog priorities and sprint assignments.

**Actions taken so far:**
- Maintained BUG_REPORT.md through BUG-029 (iterations 1–10)
- Processed changelog_queue.json entries into changelog.xlsx (77+ entries)
- Iteration 11: Created AGENTS.md; updated BUG_REPORT.md with BUG-030–035
- Iteration 12: Created BACKLOG.md and BACKLOG.csv (Sprint 2–4 planning); updated FEATURES.md (metrics, planned section, agent activity); updated BUG_REPORT.md (BUG-020/021 fixed, removed duplicate section); updated AGENTS.md (roles, iteration log); qa_status.json → 56✅/0❌/1⚠️; changelog_queue.json appended 12 entries; ran `npm run changelog` + `npm run qa`
- Note: BUG_REPORT.md must be updated AFTER every iteration, not just at sprint end

---

## Agent 5 — Bug Hunter

**Responsibility:** Runs `npm run build` + `npm run lint` after every change. Fixes ONLY errors, not features. Logs all found issues to BUG_REPORT.md in real time.

**Actions taken so far:**
- Iteration 5: Found and fixed 17 lint errors across 9 files (BUG-003 through BUG-019)
- Feature sprint F1: Fixed 3 lint errors (MediaAttachmentPicker stop-recording, ESLint setState-in-effect)
- Iterations 7–10: Confirmed clean build+lint after each change
- Iteration 11: Confirmed clean build+lint; fixed 3 pre-existing lint errors in integration stub files (BUG-030)
- Iteration 12: Build + lint clean. 2143 modules, ~370kB main chunk (gzip 111kB). QA: 56✅/0❌/1⚠️

---

## QA Agent

**Responsibility:** Validates completed features manually. Creates QA checklist, tests Hebrew RTL, mobile UX, edge cases, premium/free gating. Does NOT change code. Reports bugs to Bug Hunter. Runs AFTER each Feature Agent completes and AFTER Agent 3 Code Reviewer.

**Actions taken so far:**
- Validated Feature Sprint F1 features (media, groups, coupons, multi-channel)
- Identified RTL rendering issues in language toggle (CSS calc whitespace — now fixed)
- Confirmed premium banner i18n keys are present in both locales
- Iteration 12: Validated all 56 QA items; confirmed 56✅/0❌/1⚠️; T42 ErrorBoundary false negative corrected

---

## Product/UX Agent

**Responsibility:** Reviews user flows, onboarding, upgrade screen, audience fit (HR managers + team event organizers). Suggests max 3 high-impact UX improvements per phase. Does NOT change code. Reports to Agent 1 via research_notes.md. Runs AFTER each phase is complete and BEFORE user confirmation step.

**Actions taken so far:**
- Phase completion reviews — reported findings in research_notes.md
- Identified Hebrew RTL language toggle visual confusion (indicator invisible due to CSS calc)
- Suggested WhatsApp image clipboard copy + Hebrew instruction popup (implemented this session)

---

## Foundation Agent

**Responsibility:** Sets up types, storage, i18n keys, shared state. MUST complete before Feature Agents start.

**Actions taken so far:**
- Initial project setup: `src/types/index.ts`, `src/config/appConfig.ts`, `src/i18n/index.ts` (~500+ keys EN + HE)
- Phase 2 foundation: Added `MediaAttachment` type, `GreetingDraft.media` field, `Group.holidayIds` field, coupon storage functions, `premiumExpiresAt` field
- Ongoing: Adding new i18n keys each iteration as gaps are found (whatsapp_image_*, etc.)
- Iteration 12: Added 39 i18n keys (urgency_*, go_back, action_*, holiday_*, about_*) in both EN + HE

---

## Feature Agents (parallel, isolated)

**Responsibility:** Work in parallel on isolated features. Do NOT modify shared core logic. Do NOT conflict with each other.

**Sprint features implemented:**
- Greeting Media (camera, voice recording, compression, size guards)
- Multi-Channel Sending (WhatsApp, SMS, Email, Copy, Share; channel picker bottom sheet)
- Group Holiday Assignment (holiday picker in group edit, dashboard alerts)
- Coupon System (NEVERMISS1, WELCOME2025, ISRAEL30; expiry logic; Settings display)
- Haptic feedback (Capacitor), success animation, CSV export, celebrationType field
- Hebrew calendar integration (@hebcal/core HDate + gematriya in CalendarScreen) — Iteration 11
- WhatsApp image clipboard copy + Hebrew paste instruction popup — Iteration 11
