# NeverMiss — Bug Report Log
_Maintained by Agent 5 (Bug Hunter). Updated after every iteration._

> Every bug found by Agent 5 is logged here with full context for traceability.

---

## Format

| Field | Description |
|-------|-------------|
| **Date** | YYYY-MM-DD |
| **Time** | HH:MM (approximate) |
| **File** | Relative path |
| **Bug** | What was wrong |
| **Status** | `found` / `fixed` / `wont-fix` |
| **Fix** | How it was resolved |

---

## 2026-04-27

### BUG-001
- **Date:** 2026-04-27 | **Time:** ~09:30 | **Status:** ✅ fixed
- **File:** `src/services/storageService.ts`
- **Bug:** Silent `catch {}` block — `JSON.parse` errors swallowed with no diagnostic output. If localStorage contained malformed JSON (e.g. from a previous app version or manual edits), the app would silently return `null` with no way to triage the issue in production.
- **Found by:** Agent 2 (Research), Agent 3 (Review) — iteration 1
- **Fixed by:** Agent 1 — iteration 1
- **Fix:** Added `console.warn(\`[storageService] Failed to parse localStorage key "${key}". Returning null. Error:\`, err)` to the catch block.

---

### BUG-002
- **Date:** 2026-04-27 | **Time:** ~10:30 | **Status:** ✅ fixed
- **File:** `src/utils/avatarUtils.ts` (fix), 5 consumer files (root cause)
- **Bug:** `getAvatarGradient` was copy-pasted across 6 files with **different gradient palette sizes** — `DashboardScreen`, `ContactFormScreen`, `HolidayDetailScreen`, `BirthdayCenterScreen`, and `BirthdayGreetingEditorScreen` all used 8 gradients while `ContactCard` used 10. Result: the same contact's avatar showed a **different color** on the Dashboard vs the Contacts list — a visible UI consistency bug.
- **Found by:** Agent 2 — iteration 3
- **Fixed by:** Agent 1 — iteration 3
- **Fix:** Extracted canonical `getInitials` + `getAvatarGradient` (10 gradients) into `src/utils/avatarUtils.ts` with a module-level `Map<string, string>` cache. All 7 consumers updated to import from the shared util.

---

### BUG-003 — BUG-019 (17 lint errors)
- **Date:** 2026-04-27 | **Time:** ~11:00 | **Status:** ✅ fixed
- **Found by:** Agent 5 — iteration 5 (first full lint run)
- **Fixed by:** Agent 5 — iteration 5

| # | File | Bug | Fix |
|---|------|-----|-----|
| 003 | `src/context/LanguageContext.tsx` | `react-refresh/only-export-components` — `useLang` hook exported alongside component | Added `eslint-disable` comment |
| 004 | `src/context/LanguageContext.tsx` | Same rule — `useT` hook | Added `eslint-disable` comment |
| 005 | `src/context/ThemeContext.tsx` | `react-refresh/only-export-components` — `useTheme` hook | Added `eslint-disable` comment |
| 006 | `src/screens/ContactDetailScreen.tsx` | `Date.now()` called in render body (impure) | Moved into `useState(() => Date.now())` initializer |
| 007 | `src/screens/ContactDetailScreen.tsx` | Hook called after conditional return (rules-of-hooks) | Moved hook above early return |
| 008 | `src/screens/ContactFormScreen.tsx` | `Math.random()` called in render body (impure) | Moved into `useState(() => ...)` lazy initializer |
| 009 | `src/screens/DashboardScreen.tsx` | Unused `Gift` import | Removed |
| 010 | `src/screens/DashboardScreen.tsx` | Unused `highlightHoliday` variable | Removed |
| 011 | `src/screens/GreetingEditorScreen.tsx` | `setState` called in `useEffect` (intentional sync) | Added `eslint-disable react-hooks/set-state-in-effect` |
| 012 | `src/screens/GreetingEditorScreen.tsx` | Same rule — second effect | Added `eslint-disable` |
| 013 | `src/screens/GroupsScreen.tsx` | Unused `Card` import | Removed |
| 014 | `src/screens/OnboardingScreen.tsx` | Unused `Button` import | Removed |
| 015 | `src/screens/premium/BirthdayCenterScreen.tsx` | Unused `Button` import | Removed |
| 016 | `src/screens/premium/BirthdayCenterScreen.tsx` | `turningAge` prop declared but never read | Made optional, removed from destructuring |
| 017 | `src/screens/premium/BirthdayGreetingEditorScreen.tsx` | Unused `Button` import | Removed |
| 018 | `src/screens/premium/BirthdayGreetingEditorScreen.tsx` | `navigate` assigned but never used | Removed `useNavigate`/`navigate` |
| 019 | `src/screens/premium/ImportContactsScreen.tsx` | Unused `Select` import | Removed |

---

### BUG-020
- **Date:** 2026-04-27 | **Status:** ✅ fixed
- **File:** `src/core/scoringSystem.ts` (line ~50–59)
- **Bug:** `getBirthdayDaysUntil` computes days using `Math.floor((thisYear.getTime() - today.getTime()) / 86_400_000)`. On DST spring-forward nights, this returns `-1` for a birthday that is actually "today", silently skipping the birthday action.
- **Found by:** Agent 2 — iteration 6
- **Fixed by:** Agent 1 — iteration 12
- **Fix:** Replaced with `differenceInCalendarDays(thisYear, today)` from date-fns. Also uses `differenceInCalendarDays` for the "is this year's birthday in the past?" check.

### BUG-021
- **Date:** 2026-04-27 | **Status:** ✅ fixed
- **File:** `src/screens/premium/ImportContactsScreen.tsx` (line 281, 366)
- **Bug:** `key={i}` (array index) on CSV preview table rows and import error strings. React mis-reconciles rows when data is filtered or reordered, causing stale cell content to appear.
- **Found by:** Agent 2 — iteration 6
- **Fixed by:** Agent 1 — iteration 12
- **Fix:** Preview rows use `key={\`row-${i}\`}` (prefixed). Error list uses `key={e}` (error message string, unique per error).

### BUG-022
- **Date:** 2026-04-27 | **Time:** ~14:00 | **Status:** ✅ fixed
- **File:** `src/screens/CalendarScreen.tsx` (line ~172)
- **Bug:** `key={i}` on holiday color dots within day cells. `dayHolidays` is a filtered subset that changes on month navigation, causing dot colors to bleed across days.
- **Found by:** Agent 2 — iteration 6
- **Fixed by:** Agent 1 — iteration 7
- **Fix:** Changed `key={i}` to `key={h.id}` on holiday dot elements.

### BUG-023
- **Date:** 2026-04-27 | **Status:** ✅ fixed
- **File:** `src/App.tsx` (line ~76)
- **Bug:** `isOnboardingDone()` (calls `localStorage.getItem`) potentially firing on every render — unnecessary main-thread work.
- **Found by:** Agent 2 — iteration 6
- **Fixed by:** Agent 1 — iteration 4 (confirmed fixed in code review, iteration 12)
- **Fix:** `const onboardingDone = useMemo(() => isOnboardingDone(), [])` in App.tsx (line 76).

---

### BUG-024
- **Date:** 2026-04-27 | **Time:** ~12:00 | **Status:** ✅ fixed
- **File:** `src/components/MediaAttachmentPicker.tsx`
- **Bug:** `handleStopRecording` referenced inside a `useEffect` before its `const` declaration. ESLint flagged it as a reference-before-declaration error.
- **Found by:** Agent 5 — feature sprint lint run
- **Fix:** Reordered declarations so `handleStopRecording` is defined above the effect that references it. Then moved the 60-second auto-stop logic inside the `setInterval` updater to eliminate the pattern entirely.

### BUG-025
- **Date:** 2026-04-27 | **Time:** ~12:00 | **Status:** ✅ fixed
- **File:** `src/components/MediaAttachmentPicker.tsx`
- **Bug:** `setState` called synchronously inside a `useEffect` body (ESLint `react-hooks/set-state-in-effect` rule). `handleStopRecording()` — which calls `setRecording(false)` — was called directly in the effect.
- **Found by:** Agent 5 — feature sprint lint run
- **Fix:** Removed the auto-stop `useEffect`; moved 60s limit check inside the `setInterval` updater instead.

### BUG-026
- **Date:** 2026-04-27 | **Time:** ~12:00 | **Status:** ✅ fixed
- **File:** `src/components/MediaAttachmentPicker.tsx`
- **Bug:** Microphone permission-denied error showed `t('media_record_limit')` = "Max 60 seconds" — completely wrong user-facing message.
- **Found by:** Agent 3 — feature sprint review
- **Fix:** Changed to a plain descriptive string "Could not access microphone. Please allow permission."

### BUG-027
- **Date:** 2026-04-27 | **Time:** ~12:00 | **Status:** ✅ fixed
- **File:** `src/components/MediaAttachmentPicker.tsx`
- **Bug:** No file size guard on image upload. A user selecting a 15 MB image would encode ~20 MB base64 into memory, then crash localStorage with a silent `QuotaExceededError`.
- **Found by:** Agent 3 — feature sprint review
- **Fix:** Added `if (file.size > 2 * 1024 * 1024)` guard with `t('media_file_too_large')` error display. Added `media_file_too_large` i18n key in both EN/HE.

### BUG-028
- **Date:** 2026-04-27 | **Time:** ~12:00 | **Status:** ✅ fixed
- **File:** `src/screens/GreetingEditorScreen.tsx`
- **Bug:** `mediaAttachment` state not cleared when greeting is regenerated. Changing contact/holiday and regenerating would silently carry over a previous attachment to the new greeting.
- **Found by:** Agent 3 — feature sprint review
- **Fix:** Added `setMediaAttachment(null)` at the top of the `generate()` function.

---

## 2026-04-28

### BUG-030
- **Date:** 2026-04-28 | **Time:** ~10:00 | **Status:** ✅ fixed
- **File:** `src/integrations/supabase/client.ts`, `src/integrations/payment/payme.ts`, `src/integrations/ai/claudeClient.ts`
- **Bug:** Pre-existing `@typescript-eslint/no-unused-vars` lint errors on stub function parameters (`_userId`, `_req`). The ESLint config version did not recognize underscore-prefix convention to suppress unused-param warnings.
- **Found by:** Agent 5 — current session lint run
- **Fixed by:** Agent 5 — current session
- **Fix:** Added `// eslint-disable-next-line @typescript-eslint/no-unused-vars` before each stub function declaration.

### BUG-031
- **Date:** 2026-04-28 | **Time:** ~10:30 | **Status:** ✅ fixed
- **File:** `src/screens/SettingsScreen.tsx`
- **Bug:** Language toggle indicator invisible when Hebrew selected. Root cause: Tailwind arbitrary-value class `w-[calc(50%-4px)]` generates invalid CSS `width: calc(50%-4px)` — missing required whitespace around the `-` operator. With zero width, the indicator was invisible; the unselected button (dark text on light bg) visually appeared "active" while the selected button (white text on transparent bg) looked inactive. Users could not tell which language was selected.
- **Found by:** QA Agent — current session
- **Fixed by:** Agent 1 — current session
- **Fix:** Removed `w-[...]` and `rounded-[...]` Tailwind classes; moved `width`, `borderRadius` to inline `style` prop with valid `calc(50% - 4px)` syntax. Added comment documenting why `calc()` with spaces must be inline.

### BUG-032
- **Date:** 2026-04-28 | **Time:** ~11:00 | **Status:** ✅ fixed
- **File:** `src/services/communicationService.ts` — `buildWhatsAppUrl`
- **Bug:** Phone numbers with `00` international prefix (e.g. `00972501234567`) were not normalized. After stripping non-digits, `00972...` passed the `startsWith('0')` branch and got `972` prepended again, producing `97200972501234567` — an invalid WhatsApp number.
- **Found by:** Agent 3 — FINDING 71
- **Fixed by:** Agent 1 — current session
- **Fix:** Added `if (normalized.startsWith('00')) normalized = normalized.slice(2)` before the Israeli local-number branch.

### BUG-033
- **Date:** 2026-04-28 | **Time:** ~11:00 | **Status:** ✅ fixed
- **File:** `src/services/communicationService.ts` — `buildWhatsAppUrl`
- **Bug:** No guard on empty phone string. `buildWhatsAppUrl('', msg)` would call `wa.me/?text=...` — an invalid URL that opens WhatsApp with no recipient.
- **Found by:** Agent 3 — FINDING 72
- **Fixed by:** Agent 1 — current session
- **Fix:** Added `if (!normalized) return ''` after stripping non-digits.

### BUG-034
- **Date:** 2026-04-28 | **Time:** ~11:00 | **Status:** ✅ fixed
- **File:** `src/services/communicationService.ts` — `copyToClipboard`
- **Bug:** Used deprecated `document.execCommand('copy')` as a clipboard fallback. `execCommand` was removed in modern browsers and its behavior is undefined in non-secure contexts (non-HTTPS). The function would silently return `false` on any browser that removed it.
- **Found by:** Agent 3 — FINDING 73
- **Fixed by:** Agent 1 — current session
- **Fix:** Removed the `execCommand` fallback branch entirely. Function now relies solely on `navigator.clipboard.writeText` and returns `false` on failure.

### BUG-035
- **Date:** 2026-04-28 | **Time:** ~11:30 | **Status:** ✅ fixed
- **File:** `src/screens/CalendarScreen.tsx`
- **Bug:** `useMemo(() => ..., [days])` used `days` (a mutable array reference from `eachDayOfInterval`) as a dependency. React Compiler's `react-hooks/preserve-manual-memoization` rule flagged: "Compilation Skipped: Existing memoization could not be preserved." The memo would re-run on every render.
- **Found by:** Agent 5 — lint run after Hebrew calendar integration
- **Fixed by:** Agent 1 — current session
- **Fix:** Removed `days` from the dependency array; rewrote the `useMemo` to compute its own interval from `currentMonth` (a stable Date value) as the sole dependency.

---

### BUG-036 — FINDINGS 25A / 20 / 23 / 27 / 28A / 30B / 60 / 66 / 67 / 69 (Iteration 12 findings)
- **Date:** 2026-04-28 | **Time:** ~15:00 | **Status:** ✅ all fixed
- **Found by:** Agent 3 + QA Agent — various iterations
- **Fixed by:** Agent 1 — iteration 12

| Finding | File | Issue | Fix |
|---------|------|-------|-----|
| FINDING 25A | `Navigation.tsx` | `aria-label="Go back"` hardcoded EN in PageHeader | Added `useT()`; `aria-label={t('go_back')}` |
| FINDING 20 | `ContactDetailScreen.tsx` | `score.urgencyLevel` + `interactionFrequency` shown as raw EN enum | `t(\`urgency_${...}\`)` and `t(\`freq_${...}\`)` |
| FINDING 23 | `ContactDetailScreen.tsx` | `suggestedAction.label` always EN from scoringSystem.ts | Added `translatedActionLabel` IIFE with switch on `action.type` |
| FINDING 27 | `AboutScreen.tsx` | VALUES/TECH arrays + mission paragraph all hardcoded EN (16 strings) | Added 19 `about_*` i18n keys; screen uses `t()` for all content |
| FINDING 28A | `HolidayDetailScreen.tsx` | `"★ Major"` and `"+{n} more contacts"` hardcoded EN | `t('holiday_major')` and `t('holiday_moreContacts', { n })` |
| FINDING 30B | `Modal.tsx` | `aria-label="Close"` hardcoded EN; Modal had no `useT()` | Added `useT()` import + call; `aria-label={t('close')}` |
| FINDING 60 | `ImportContactsScreen.tsx` | `setImporting(false)` after try/catch, not in `finally`; button could stay locked | Moved to `finally` block |
| FINDING 66 | `ContactCard.tsx` | Crown and Building2 icons missing `aria-hidden="true"`; verbose screen reader | Added `aria-hidden="true"` to both decorative icons |
| FINDING 67 | `DashboardScreen.tsx`, `GroupsScreen.tsx` | Today-highlight cards and group cards were `<div onClick>` — not keyboard reachable | Changed to `<button type="button">` with `w-full text-left` |
| FINDING 69 | `src/index.css` | `.btn` missing `:focus-visible` rule; relied on UA default only | Added `.btn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }` |

---

### BUG-037 — Yom HaAtzmaut incorrect Gregorian date
- **Date:** 2026-04-28 | **Time:** ~16:00 | **Status:** ✅ fixed
- **File:** `src/data/holidays.ts`
- **Bug:** `israel-independence-day-2026` had `date: '2026-04-29'` — wrong by 8 days. The actual Yom HaAtzmaut 5786 is April 21, 2026 (ד׳ באייר תשפ״ו, moved 1 day earlier from 5 Iyar/Wednesday per Israeli holiday adjustment rules).
- **Found by:** User — 2026-04-28
- **Fixed by:** Agent 1 — 2026-04-28
- **Fix:** Replaced hardcoded date with runtime computation via `HebrewCalendar.getHolidaysForYearArray(5786, true)` from `@hebcal/core`. Added `hebcalDate()` helper function in `holidays.ts` with a reliable fallback. Also created `src/utils/hebrewDateUtils.ts` — `getHebrewDateStr(isoDate)` converts any date to Hebrew gematria format (e.g. "ד׳ באייר תשפ״ו"). Hebrew date badges added to `HolidayCard` and `HolidayDetailScreen` for all `dateType === 'hebrew'` holidays.

### BUG-038 — Terms of Service always displayed in English
- **Date:** 2026-04-28 | **Time:** ~17:00 | **Status:** ✅ fixed
- **File:** `src/screens/TermsScreen.tsx`, `src/i18n/index.ts`
- **Bug:** Terms of Service page showed English text regardless of the selected language. The `SECTIONS` array (holding all section titles and body text) was defined at module scope. Because it called `t()` during module initialization — before any language state existed — all strings were computed once in English and never updated when the user switched to Hebrew.
- **Found by:** User — 2026-04-28
- **Fixed by:** Agent 1 + Foundation Agent — 2026-04-28
- **Fix:** Moved `SECTIONS` inside the component function so `t()` is called on every render with the current language. Replaced all hardcoded English strings in the array with `titleKey`/`bodyKey` string references and a matching `as const` assertion for TypeScript narrowing. Added 22 new i18n keys (EN + HE) to `src/i18n/index.ts` covering all 10 section titles and bodies, the last-updated subtitle, and the intro paragraph.

### BUG-039 — Contact birthdays not displayed in the Calendar
- **Date:** 2026-04-28 | **Time:** ~19:00 | **Status:** ✅ fixed
- **File:** `src/screens/CalendarScreen.tsx`
- **Bug:** The Calendar screen only showed holiday dots and holiday cards. Contact birthdays (stored as `YYYY-MM-DD` in `Contact.birthday`) were never rendered in the calendar — no dot indicator on cells and no birthday section in the panel below.
- **Found by:** User — 2026-04-28
- **Fixed by:** Agent 1 — 2026-04-28
- **Fix:** 
  - Added `birthdayMap` useMemo in CalendarScreen that builds a `Map<"YYYY-MM-DD", Contact[]>` for the visible month; handles both `hebrewBirthday` (via `hebrewBirthdayToGregorianInCalendarYear`) and regular `birthday` fields.
  - Added a pink dot (💗 `#EC4899`) alongside holiday dots in each calendar cell.
  - Added a "Birthdays" section panel (with `style={{ borderLeft: '3px solid #EC4899' }}` cards) below the calendar that shows all contacts whose birthday falls on the selected day (or all birthdays in the month when no day is selected).
  - Added 3 new i18n keys: `calendar_birthdays`, `calendar_birthdayLabel`, `calendar_birthdaysOn` (EN + HE).

---

### BUG-040 — iteration_log.md missing iterations 13–17
- **Date:** 2026-04-28 | **Time:** 20:30 | **Status:** ✅ fixed
- **File:** `agent_state/iteration_log.md`
- **Bug:** Agent 4 last wrote to iteration_log.md at iteration 12 (timestamp 13:00). Iterations 13–17 (timestamps 16:00–20:00, 2026-04-28) were never appended. The log was therefore missing 5 entries covering: Hebrew date display, BUG-038 Terms fix, local analytics foundation, BUG-039 birthday calendar + Hebrew birthday feature, and Sprint 2 i18n/accessibility/celebration feedback work.
- **Fixed by:** Agent 4 — 2026-04-28
- **Fix:** Reconstructed iterations 13–17 from `changelog_queue.json` (sole authoritative source). Agent 2 and Agent 3 columns marked TBD where `research_notes.md` / `review_notes.md` have no corresponding entries. Appended all five rows without modifying iterations 0–12. Log is now continuous 0–17.

---

## Known Issues (open)

### BUG-029 (SECURITY — documented)
- **Date:** 2026-04-27 | **Status:** 🟡 known / documented
- **File:** `src/services/storageService.ts`
- **Bug:** `VALID_COUPONS` hardcoded in compiled JS bundle — codes discoverable via DevTools.
- **Mitigation:** Security comment added. Per-device reuse prevention via localStorage is in place. For production: server-side validation or SHA-256 hashing.

---

_Agent 5 runs `npm run build` + `npm run lint` every iteration. New bugs logged here automatically._

---

### BUG-043 — Multi-day holidays showing only first day in calendar
- **Date:** 2026-04-28 | **Time:** 23:00 | **Status:** ✅ fixed
- **File:** `src/screens/CalendarScreen.tsx`
- **Bug:** `getHolidaysForDay` used `isSameDay(h.date, date)` — only matched the start date. Sukkot (Oct 6–13), Hanukkah (Dec 14–22) etc. showed a dot only on the first day. Monthly list filter (`isSameMonth(h.date, currentMonth)`) also only checked the start month.
- **Fixed by:** Agent 1 — 2026-04-28
- **Fix:** Replaced `isSameDay` with numeric `YYYYMMDD` range comparison `dayNum >= startNum && dayNum <= endNum`. Monthly list now uses year-month overlap check to correctly include holidays that start in the previous month but extend into the current one. Removed unused `isSameMonth` import.

### BUG-044 — Sukkot 2026 missing from holiday data
- **Date:** 2026-04-28 | **Time:** 23:00 | **Status:** ✅ fixed
- **File:** `src/data/holidays.ts`
- **Bug:** `sukkot-2025` entry existed; no `sukkot-2026` entry. Calendar showed no Sukkot for Sep/Oct 2026.
- **Fixed by:** Agent 1 — 2026-04-28
- **Fix:** Added `sukkot-2026` entry: date `2026-09-25`, endDate `2026-10-02` (15–22 Tishrei 5787 — covers Hoshana Rabbah and Shemini Atzeret/Simchat Torah).

---

### FINDING 28D — GreetingRow RTL dir detection used hardcoded string comparison
- **Date:** 2026-04-29 | **Time:** 15:02 | **Status:** ✅ fixed
- **File:** `src/screens/HolidayDetailScreen.tsx`
- **Bug:** `dir` attribute on greeting text element was computed via `lang === 'Hebrew' || lang === 'עברית' || lang === 'Arabic' || lang === 'ערבית'`. Any translation label change would silently break RTL rendering.
- **Found by:** Agent 3 — Code Review (Sprint 7)
- **Fixed by:** Agent 1 — 2026-04-29 (Sprint 8)
- **Fix:** Added `dir(langCode: string): 'rtl' | 'ltr'` function to `src/i18n/index.ts` using a stable `RTL_LANG_CODES` Set. Added `langCode` prop to `GreetingRow`; `dir` attribute now calls `dir(langCode)`. Call sites pass `'he'`, `'ar'`, `'en'` literals — immune to translation label changes.

---

### FINDING 29A — ContactFormScreen "Avatar Color" label hardcoded in English
- **Date:** 2026-04-29 | **Time:** 15:03 | **Status:** ✅ fixed
- **File:** `src/screens/ContactFormScreen.tsx`
- **Bug:** Section label `"Avatar Color"` was a hardcoded English string not going through the i18n system.
- **Found by:** Agent 3 — Code Review (Sprint 7/8)
- **Fixed by:** Agent 1 — 2026-04-29 (Sprint 8)
- **Fix:** Added `contactForm_avatarColor` key (EN: 'Avatar Color', HE: 'צבע אווטאר') to `src/i18n/index.ts`. Replaced hardcoded string with `{t('contactForm_avatarColor')}`.

---

### FINDING 29B — ContactFormScreen "Auto gradient" button missing aria-label (WCAG 4.1.2)
- **Date:** 2026-04-29 | **Time:** 15:04 | **Status:** ✅ fixed
- **File:** `src/screens/ContactFormScreen.tsx`
- **Bug:** The Auto gradient color-picker button had `title="Auto gradient"` but no `aria-label`. Icon-only buttons without `aria-label` violate WCAG 4.1.2 (Name, Role, Value).
- **Found by:** Agent 3 — Code Review (Sprint 7/8)
- **Fixed by:** Agent 1 — 2026-04-29 (Sprint 8)
- **Fix:** Added `contactForm_autoGradient` key (EN: 'Auto gradient', HE: 'גרדיאנט אוטומטי') to `src/i18n/index.ts`. Replaced `title` attribute with `aria-label={t('contactForm_autoGradient')}`.

---

### FINDING 29C — PremiumFeaturePrompt feature prop hardcoded EN (pre-verified)
- **Date:** 2026-04-29 | **Time:** 15:05 | **Status:** ✅ already fixed
- **File:** `src/screens/ContactFormScreen.tsx`
- **Note:** Inspection of the current code confirmed `feature={t('premium_feat_birthday_fields')}` was already in place. No change required.

---

### BUG-047 — Greeting type not applied: switching tier does not regenerate message
- **Date:** 2026-04-29 | **Time:** 16:20 | **Status:** ✅ fixed (Sprint 11)
- **File:** `src/screens/GreetingEditorScreen.tsx`
- **Bug:** Clicking a different tier (VIP / Professional / Casual) correctly calls `setTone(tier.value)`, which updates the `tone` React state and re-highlights the selected card. However, the already-displayed greeting text is NOT regenerated — it keeps the tone from when Generate was last clicked. The user has no indication that they need to re-click Generate. As a result, switching tiers appears to have no effect on the output.
- **Root cause:** No `useEffect` or reactive path re-invoked `generate()` on `tone` changes.
- **Found by:** User — 2026-04-29 (Sprint 11 bug report)
- **Fixed by:** Developer — 2026-04-29 (Sprint 11)
- **Fix:** Added `useEffect([tone])` in `GreetingEditorScreen.tsx` (line ~189–193) that calls `generate()` whenever tone changes and a message is already displayed.

---

### BUG-048 — Hebrew `friendly` greeting templates contain unnatural / grammatically incorrect phrasing
- **Date:** 2026-04-29 | **Time:** 16:21 | **Status:** ✅ fixed (Sprint 11)
- **File:** `src/services/greetingService.ts`
- **Bug:** Several Hebrew body templates in the `friendly` generic pool use awkward or grammatically incorrect phrasing. Confirmed example: `"סתם חשבתי עליך ורציתי לברר מה שלומך."` — "לברר" (to clarify/find out) is semantically wrong; natural Hebrew would use "לאחל", "לשאול", or "לדעת". Additional templates contain similar issues. Other tone pools (business, vip) should also be reviewed.
- **Root cause:** Template strings written without native Hebrew speaker review.
- **Found by:** User — 2026-04-29 (Sprint 11 bug report)
- **Fixed by:** Developer — 2026-04-29 (Sprint 11)
- **Fix:** Rewrote affected Hebrew body templates in `greetingService.ts`: `'לברר'` → `'לדעת'`, `'שכל טוב'` → `'שיהיה הכל טוב'`; business `'שלחתי ידו/ת'` → `'פניתי'`. No AI API — template strings only.

---

### BUG-045 — UpgradeScreen CTA button uses provider-specific text
- **Date:** 2026-04-29 | **Time:** 16:00 | **Status:** ✅ fixed
- **File:** `src/screens/UpgradeScreen.tsx`, `src/i18n/index.ts`
- **Bug:** The primary upgrade CTA button used `t('payme_goPayMe')` which renders "שלם עם PayMe" (EN: "Pay with PayMe") — a provider-specific string. This violates the no-provider-mention rule for the Upgrade screen CTA and is misleading when no payment is yet processed.
- **Found by:** User — 2026-04-29 (Sprint 10 bug report)
- **Fixed by:** Agent 1 — 2026-04-29 (Sprint 10 hotfix)
- **Fix:** Added generic `upgrade_cta` i18n key (EN: 'Upgrade Now' / HE: 'שדרג עכשיו') to both locales in `src/i18n/index.ts`. Replaced `{t('payme_goPayMe')}` with `{t('upgrade_cta')}` in `UpgradeScreen.tsx`. Button still navigates to `/payment`.

---

### BUG-046 — UpgradeScreen hero title "פתח הכל" is unclear
- **Date:** 2026-04-29 | **Time:** 16:01 | **Status:** ✅ fixed
- **File:** `src/i18n/index.ts`
- **Bug:** Hebrew value for `upgrade_unlockEverything` was `'פתח הכל'` ("Open Everything") — vague, doesn't communicate the upgrade action clearly to the user.
- **Found by:** User — 2026-04-29 (Sprint 10 bug report)
- **Fixed by:** Agent 1 — 2026-04-29 (Sprint 10 hotfix)
- **Fix:** Changed `upgrade_unlockEverything` HE value from `'פתח הכל'` to `'שדרג לפרמיום'` ("Upgrade to Premium") in `src/i18n/index.ts`. EN value ('Unlock Everything') unchanged.

---

### BUG-049 — PaymeScreen throws payment error; users cannot access Premium without coupon
- **Date:** 2026-04-30 | **Time:** 10:30 | **Status:** ✅ fixed
- **File:** `src/screens/PaymeScreen.tsx`, `src/i18n/index.ts`
- **Bug:** `/payment` screen rendered a name+email form that called `createPaymentLink()` — a stub that always threw an error. Users who clicked "Upgrade Now" on the UpgradeScreen saw "Payment service coming soon. Use a coupon code." with no path to activate Premium. The demo activation button on UpgradeScreen was guarded by `import.meta.env.DEV` — invisible in production.
- **Found by:** User — 2026-04-30 (Bug Fix Mode)
- **Fixed by:** Developer — 2026-04-30 (Bug Fix Mode)
- **Fix:** Rewrote `PaymeScreen.tsx` as a demo-mode screen: removed form, plan picker, and `createPaymentLink()` call. Added amber demo notice banner (`payme_demoNotice`: "זוהי גרסת הדגמה — לא נדרש תשלום אמיתי") and "הפעל פרימיום (הדגמה)" button that calls `activatePremium()` + navigates to `/dashboard`. Added 2 new i18n keys (`payme_demoNotice`, `payme_activateDemo`) in EN + HE. UpgradeScreen unchanged — its "שדרג עכשיו" CTA was already correct.

---

### BUG-050 — Upgrade Now CTA button not visible above coupon section in UpgradeScreen
- **Date:** 2026-04-30 | **Time:** 11:00 | **Status:** ✅ fixed
- **File:** `src/screens/UpgradeScreen.tsx`, `src/i18n/index.ts`
- **Bug:** The primary "שדרג עכשיו" / "Upgrade Now" CTA button was not visible immediately above the coupon section in the UpgradeScreen production build. Users saw only the coupon toggle and "המשך בחינמי" button.
- **Found by:** User — 2026-04-30 (Bug Fix Mode)
- **Fixed by:** Developer — 2026-04-30 (Bug Fix Mode)
- **Fix:** Added a full-width h-14 gradient (amber→orange) button using `t('upgrade_now')` immediately above the coupon section. Added i18n key `upgrade_now` (EN: 'Upgrade Now' / HE: 'שדרג עכשיו') to both locales. Button navigates to `/payment`.

---

### BUG-051 — Duplicate Upgrade CTA buttons in UpgradeScreen
- **Date:** 2026-04-30 | **Time:** 11:30 | **Status:** ✅ fixed
- **File:** `src/screens/UpgradeScreen.tsx`
- **Bug:** Two upgrade CTA buttons existed side-by-side: the original `upgrade_cta` button (CreditCard icon) from Sprint 10, and the newly added `upgrade_now` button (Crown icon) from BUG-050 fix. Both navigated to `/payment` and were visually identical.
- **Found by:** User — 2026-04-30 (Bug Fix Mode)
- **Fixed by:** Developer — 2026-04-30 (Bug Fix Mode)
- **Fix:** Removed the older `upgrade_cta`/CreditCard button block. Kept only the `upgrade_now`/Crown button directly above the coupon section. Removed unused `CreditCard` import.

---

### BUG-052 — PaymeScreen demo mode changes never committed
- **Date:** 2026-04-30 | **Time:** 11:30 | **Status:** ✅ fixed
- **File:** `src/screens/PaymeScreen.tsx`
- **Bug:** PaymeScreen was rewritten to demo mode locally (BUG-049 fix) but the file was never staged or committed. The pushed repository still contained the broken original with name/email inputs and `createPaymentLink()`.
- **Found by:** User — 2026-04-30 (Bug Fix Mode)
- **Fixed by:** Developer — 2026-04-30 (Bug Fix Mode)
- **Fix:** Committed the local demo-mode PaymeScreen.tsx. Screen now shows amber demo notice (`payme_demoNotice`) and "הפעל פרימיום (הדגמה)" button (`payme_activateDemo`) that calls `activatePremium()` and navigates to `/dashboard`.

---

### BUG-053 — Date input fields do not open calendar picker in RTL mode
- **Date:** 2026-04-30 | **Time:** 12:00 | **Status:** ✅ fixed
- **File:** `src/screens/ContactFormScreen.tsx`
- **Bug:** The "תאריך קשר אחרון" and birthday `type="date"` inputs did not open the native calendar picker when clicked in Hebrew (RTL) mode. The date format (YYYY-MM-DD) is inherently LTR; without an explicit `dir="ltr"` on the input, Chromium/WebKit browsers suppress the date picker interaction in RTL documents.
- **Found by:** User — 2026-04-30 (Bug Fix Mode)
- **Fixed by:** Developer — 2026-04-30 (Bug Fix Mode)
- **Fix:** Added `dir="ltr"` to both date inputs (`lastContactDate` and `birthday`) in ContactFormScreen.tsx. Value handling unchanged.

---

### BUG-054 — Hebrew birthday day dropdown showing numbers instead of Gematria (changes never committed)
- **Date:** 2026-04-30 | **Time:** 12:00 | **Status:** ✅ fixed
- **File:** `src/screens/ContactFormScreen.tsx`, `src/utils/hebrewDateUtils.ts`, `src/screens/ContactDetailScreen.tsx`, `src/screens/CalendarScreen.tsx`
- **Bug:** Hebrew birthday day dropdown displayed numeric values (1–30) instead of Gematria letters (א–ל). The gematriya() fix and all related Bug Fix 1 changes (RTL calendar arrows, Hebrew birthday as independent event, formatHebrewBirthdayDisplay) existed only in the local working directory and were never committed or pushed.
- **Found by:** User — 2026-04-30 (Bug Fix Mode)
- **Fixed by:** Developer — 2026-04-30 (Bug Fix Mode)
- **Fix:** Committed all Bug Fix 1 local changes: gematriya(d) label in day dropdown, formatHebrewBirthdayDisplay utility, HebrewBirthday display row in ContactDetailScreen, BirthdayEntry type + RTL arrows in CalendarScreen.

---

### BUG-055 — Calendar picker icon invisible in dark mode (Midnight theme)
- **Date:** 2026-04-30 | **Time:** 13:00 | **Status:** ✅ fixed
- **File:** `src/index.css`, `src/data/themes.ts`
- **Bug:** The browser-native `::-webkit-calendar-picker-indicator` icon on `type="date"` inputs renders as a dark icon by default. In the Midnight dark theme (background: #080818, surface: #12123A) it was invisible. In all themes it was also small and lacked hover affordance.
- **Found by:** User — 2026-04-30 (Bug Fix Mode)
- **Fixed by:** Developer — 2026-04-30 (Bug Fix Mode)
- **Fix:** Added `--calendar-picker-invert` CSS variable (value `1` when `isDark`, else `0`) in `applyTheme`. Added CSS rules for `input[type="date"]::-webkit-calendar-picker-indicator`: 20×20px, opacity 0.65→1 on hover, `filter: invert(var(--calendar-picker-invert))` to flip to white in dark mode, `background-color: var(--color-surface-2)` on hover. Default `--calendar-picker-invert: 0` added to `:root`. No hardcoded colors. No value logic changes.

---

### BUG-056 — Date fields require clicking the small calendar icon; full field area not clickable
- **Date:** 2026-04-30 | **Time:** 14:00 | **Status:** ✅ fixed
- **File:** `src/screens/ContactFormScreen.tsx`, `src/index.css`
- **Bug:** Clicking the text area of a `type="date"` input moved the cursor inside the field text but did not open the calendar picker. Users had to click the small calendar icon on the right edge. Affected: "תאריך קשר אחרון" and "תאריך לידה לועזי" fields.
- **Found by:** User — 2026-04-30 (Bug Fix Mode)
- **Fixed by:** Developer — 2026-04-30 (Bug Fix Mode)
- **Fix:** Added `useRef` refs (`lastContactRef`, `birthdayRef`) to both date inputs and a shared `openDatePicker` helper that calls `ref.current?.showPicker()` (with `ref.current?.click()` fallback) from each field's `onClick` handler. This forces the picker to open on any click/tap of the field area. Added `cursor: pointer` to `input[type="date"].form-input` in index.css, consistent with how `select.form-input` is already styled. Date value and storage logic unchanged.

---

### BUG-057 — Hebrew birthday dropdowns clear after selection (partial value not persisted)
- **Date:** 2026-04-30 | **Time:** 15:00 | **Status:** ✅ fixed
- **File:** `src/screens/ContactFormScreen.tsx`
- **Bug:** After selecting a day or month in the Hebrew birthday dropdowns, the chosen value immediately disappeared and the field reverted to the placeholder. Root cause: `hbParts` was a `useMemo` derived from `form.hebrewBirthday`. `setHebBirthday` only writes to the form when **both** day and month are valid (`if (d && m)`). Selecting one part while the other was empty caused `parseInt("", 10) = NaN` → condition false → `hebrewBirthday` set to undefined → `hbParts` re-derived as `{ day: '', month: '' }` → dropdown reset to placeholder.
- **Found by:** User — 2026-04-30 (Bug Fix Mode)
- **Fixed by:** Developer — 2026-04-30 (Bug Fix Mode)
- **Fix:** Replaced the `hbParts` useMemo with two `useState` variables (`hbDay`, `hbMonth`) initialized from `existing.hebrewBirthday`. Dropdowns now bind to local state (always reflect the user's last selection) while `setHebBirthday` still only writes to the form when both parts are valid. Clear button resets both local state and form. `useMemo` import removed. Storage logic unchanged.

---

### BUG-058 — Group form description field loses focus after every character typed
- **Date:** 2026-04-30 | **Time:** 16:00 | **Status:** ✅ fixed
- **File:** `src/components/ui/Modal.tsx`
- **Bug:** Typing any character in the description (or name) field inside the "צור קבוצה" modal caused focus to jump away immediately. Root cause: Modal's `useEffect` had `[isOpen, onClose]` as its dependency array. The `onClose` prop (`() => setShowForm(false)`) is an inline arrow function in GroupsScreen — a new reference is created on every render. Each keystroke → `setForm` → GroupsScreen re-renders → new `onClose` reference → Modal's `useEffect` re-runs → `requestAnimationFrame(() => first?.focus())` fires → focus moved to the first focusable element (the close button), stealing it from the description field.
- **Found by:** User — 2026-04-30 (Bug Fix Mode)
- **Fixed by:** Developer — 2026-04-30 (Bug Fix Mode)
- **Fix:** Added `onCloseRef` to Modal. A separate `useEffect([onClose])` keeps the ref current. The focus-trap effect now depends only on `[isOpen]`, so it re-runs only when the modal opens or closes — never on prop reference churn. The Escape key handler reads `onCloseRef.current` (always latest value). This fix applies to ALL modals in the app that use this component.

---

### BUG-059 — Google Translate overrides app language and translates Hebrew UI
- **Date:** 2026-05-01 | **Time:** 00:00 | **Status:** ✅ fixed
- **File:** `index.html`
- **Bug:** Mobile Chrome users with Google Translate active could have the entire app auto-translated, overriding the built-in EN/HE language switcher and garbling Hebrew text.
- **Found by:** User — 2026-05-01 (Bug Fix Mode)
- **Fixed by:** Developer — 2026-05-01 (Bug Fix Mode)
- **Fix:** Added `translate="no"` and `class="notranslate"` to `<html>`, `<meta name="google" content="notranslate">` to `<head>`, and `class="notranslate"` to `<div id="root">`. These three attributes collectively disable Google Translate on all browsers and the Translate API.

---

### BUG-060 — Holiday descriptions always shown in English on HolidayDetailScreen
- **Date:** 2026-05-01 | **Time:** 00:00 | **Status:** ✅ fixed
- **File:** `src/types/index.ts`, `src/data/holidays.ts`, `src/screens/HolidayDetailScreen.tsx`
- **Bug:** The holiday detail screen always displayed the English `description` field regardless of the active language. Hebrew users saw English paragraphs.
- **Found by:** User — 2026-05-01 (Bug Fix Mode)
- **Fixed by:** Developer — 2026-05-01 (Bug Fix Mode)
- **Fix:** Added `heDescription?: string` to the Holiday type. Added Hebrew descriptions (`heDescription`) to all 46 holiday entries in holidays.ts. Updated HolidayDetailScreen to import `useLang` and render `holiday.heDescription` when `lang === 'he'` and the field exists, falling back to the English `description` otherwise.

---

### BUG-062 — SettingsScreen upgrade button shows broken price in RTL (`mo/₪29 – –`)
- **Date:** 2026-05-01 | **Time:** 11:00 | **Status:** ✅ fixed
- **File:** `src/screens/SettingsScreen.tsx`
- **Bug:** The upgrade CTA button in Settings displayed `שדרג — — mo/₪29` in Hebrew RTL mode instead of `שדרג — ₪29/חודש`. Root cause: `/mo` was a hardcoded English string, and the price+period were not wrapped in `dir="ltr"`, causing the bidi algorithm to visually reverse the order and duplicate the em dash.
- **Found by:** User screenshot — 2026-05-01 (Bug Fix Mode)
- **Fixed by:** Developer — 2026-05-01 (Bug Fix Mode)
- **Fix:** Replaced `/mo` with `{t('upgrade_month')}` (existing i18n key: EN `/month`, HE `/חודש`). Wrapped the price+period in `<span dir="ltr">` to prevent bidi reversal. Price now renders correctly in both locales.

---

### BUG-064 — Toggle switches have reversed semantics in RTL (dot always starts left)
- **Date:** 2026-05-01 | **Time:** 11:30 | **Status:** ✅ fixed
- **Files:** `src/screens/SettingsScreen.tsx`, `src/screens/HolidayRemindersScreen.tsx`
- **Bug:** All toggle switch dots used `absolute left-0.5` and `translateX(20px)` when ON. In Hebrew RTL mode the dot always starts on the LEFT side regardless of state — the OFF/ON visual semantics are reversed (OFF looks active, ON looks inactive). Three toggles affected: notifications (SettingsScreen), reminders master switch (HolidayRemindersScreen), and channel toggles (HolidayRemindersScreen).
- **Found by:** Developer code audit — 2026-05-01 (Bug Fix Mode)
- **Fixed by:** Developer — 2026-05-01 (Bug Fix Mode)
- **Fix:** Added `lang` from `useLang()` in both files. Toggle dot now uses `right-0.5` in RTL and `left-0.5` in LTR. Translation becomes `translateX(-20px)` when ON in RTL vs `translateX(20px)` in LTR. `useLang` import added to `HolidayRemindersScreen.tsx`.

---

### BUG-063 — WhatsNew timeline on wrong side in RTL (dot and line stay on left)
- **Date:** 2026-05-01 | **Time:** 11:10 | **Status:** ✅ fixed
- **File:** `src/screens/WhatsNewScreen.tsx`
- **Bug:** The vertical timeline line (`absolute left-[19px]`), timeline dot (`absolute left-0`), and entry padding (`pl-10`) all used physical `left`/`padding-left` values. In Hebrew RTL mode, the timeline appeared on the LEFT side of the screen while content flowed from the RIGHT — visually disconnected.
- **Found by:** User screenshot — 2026-05-01 (Bug Fix Mode)
- **Fixed by:** Developer — 2026-05-01 (Bug Fix Mode)
- **Fix:** Added `useLang()` and `isRTL` flag. Timeline line uses inline style `{ [isRTL ? 'right' : 'left']: '19px' }`. Entry div uses `pr-10` in RTL / `pl-10` in LTR. Dot uses `right-0` in RTL / `left-0` in LTR. Date badge margin flips from `ml-2` to `mr-2` in RTL.

---

### BUG-061 — Holiday list in group form shows duplicates and English-only names/religion labels
- **Date:** 2026-05-01 | **Time:** 00:00 | **Status:** ✅ fixed
- **File:** `src/screens/GroupsScreen.tsx`
- **Bug:** The holiday picker in the group create/edit modal listed the same holidays twice (once for 2025, once for 2026). Holiday names were always English, and religion labels were always English raw strings (e.g., "Judaism" instead of "יהדות").
- **Found by:** User — 2026-05-01 (Bug Fix Mode)
- **Fixed by:** Developer — 2026-05-01 (Bug Fix Mode)
- **Fix:** Added `uniqueHolidays` useMemo that deduplicates by base holiday ID (strips year suffix), keeping the more recent year's entry. Added `getHolidayDisplayName` helper that finds the Hebrew name from `alternativeNames` (first string containing Hebrew Unicode chars) when `lang === 'he'`. Updated search filter to also match against `alternativeNames`. Changed religion label from `{h.religion}` to `{t(\`religion_${h.religion}\`)}` using existing i18n keys.

---

### BUG-065 — Physical `ml-*` margin classes not adapted for RTL across multiple screens
- **Date:** 2026-05-01 | **Time:** 12:00 | **Status:** ✅ fixed
- **Files:** `src/screens/UpgradeScreen.tsx`, `src/screens/CalendarScreen.tsx`, `src/screens/GreetingEditorScreen.tsx`
- **Bug:** Several inline spans used `ml-1` / `ml-2` as the gap between adjacent text elements. In RTL these gaps ended up on the wrong (outer) side instead of between the elements, causing zero visual gap between them.
- **Found by:** Developer — Bug Fix Mode scan
- **Fixed by:** Developer — 2026-05-01
- **Fix:** Replaced all physical `ml-1`/`ml-2` "sibling gap" classes with Tailwind logical-property equivalents `ms-1`/`ms-2` (`margin-inline-start`), which automatically resolves to left margin in LTR and right margin in RTL.

---

### BUG-066 — Upgrade screen shows hardcoded English testimonials in Hebrew UI
- **Date:** 2026-05-01 | **Time:** 12:00 | **Status:** ✅ fixed
- **File:** `src/screens/UpgradeScreen.tsx`, `src/i18n/index.ts`
- **Bug:** The two testimonial cards in UpgradeScreen had hardcoded English names, roles, and quotes (David M., Sarah L., Sales Manager, HR Director) that displayed in English even when the app was in Hebrew mode.
- **Found by:** Developer — Bug Fix Mode scan
- **Fixed by:** Developer — 2026-05-01
- **Fix:** Added 6 i18n keys (`upgrade_testimonial_1/2_name/role/quote`) in both EN and HE locales. UpgradeScreen now renders testimonials via `t()` so they display in the active language.

---

### BUG-067 — Physical `borderLeft` accent bars not adapted for RTL across 6 screens
- **Date:** 2026-05-01 | **Time:** 12:30 | **Status:** ✅ fixed
- **Files:** `CalendarScreen.tsx`, `DashboardScreen.tsx`, `GreetingEditorScreen.tsx`, `ContactFormScreen.tsx`, `HolidayDetailScreen.tsx`, `GroupsScreen.tsx`
- **Bug:** Decorative left-side accent borders (`borderLeft: '3px solid ...'`) on cards and sections remained on the left in RTL, where they should visually appear on the right (start side).
- **Found by:** Developer — Bug Fix Mode scan
- **Fixed by:** Developer — 2026-05-01
- **Fix:** Each `borderLeft` replaced with a conditional computed property key: `[lang === 'he' ? 'borderRight' : 'borderLeft']`. For files that lacked `useLang`, added the import and `const { lang } = useLang()` hook call (DashboardScreen, GreetingEditorScreen, ContactFormScreen).

---

### BUG-068 — Physical `text-left` alignment overrides ignore RTL direction
- **Date:** 2026-05-01 | **Time:** 13:00 | **Status:** ✅ fixed
- **Files:** `GroupsScreen.tsx`, `DashboardScreen.tsx`, `SettingsScreen.tsx`, `premium/ImportContactsScreen.tsx`
- **Bug:** Several interactive buttons, list items, and table headers used `text-left` to override browser defaults. In RTL, `text-left` forces LTR alignment and makes Hebrew text appear on the wrong (left) side instead of the start (right).
- **Found by:** Developer — Bug Fix Mode scan
- **Fixed by:** Developer — 2026-05-01
- **Fix:** Replaced all `text-left` occurrences with `text-start` (Tailwind logical property = `text-align: start`, resolves to left in LTR and right in RTL). Also fixed `border-l-2` → `border-s-2` on SettingsScreen DEV danger-zone accent.

---

### BUG-069 — Disclosure/navigation ChevronRight icons don't flip in RTL
- **Date:** 2026-05-01 | **Time:** 13:30 | **Status:** ✅ fixed
- **Files:** `src/screens/SettingsScreen.tsx`, `src/screens/OnboardingScreen.tsx`
- **Bug:** SettingsScreen list items and the OnboardingScreen continue button used `ChevronRight` (→) as a directional indicator. In RTL flex layout, these icons appear on the left side of content but still point right — the opposite of the RTL "forward" direction.
- **Found by:** Developer — Bug Fix Mode scan
- **Fixed by:** Developer — 2026-05-01
- **Fix:** Added `ChevronLeft` import. SettingsScreen: all 5 disclosure chevrons wrapped in `lang === 'he' ? ChevronLeft : ChevronRight` ternary. OnboardingScreen: added `useLang` import + `const { lang } = useLang()`, continue button chevron conditionally renders `ChevronLeft` in Hebrew.

---

### BUG-070 — RTL physical CSS issues in shared components (ContactCard, HolidayCard, Card, ChannelPicker)
- **Date:** 2026-05-01 | **Time:** 14:00 | **Status:** ✅ fixed
- **Files:** `src/components/ContactCard.tsx`, `src/components/HolidayCard.tsx`, `src/components/ui/Card.tsx`, `src/components/ChannelPicker.tsx`
- **Bug:** Four shared components had physical CSS issues that affected every screen using them: (1) `ContactCard` used `text-left` and `borderLeft` urgency bar; (2) `HolidayCard` (compact mode) used `borderLeft` accent; (3) `Card` component used `borderLeft` for the `accent` prop; (4) `ChannelPicker` used `text-left` on label spans.
- **Found by:** Developer — Bug Fix Mode scan
- **Fixed by:** Developer — 2026-05-01
- **Fix:** Added `useLang` + `const { lang }` to ContactCard, HolidayCard, and Card. Changed all `borderLeft` to computed key `[lang === 'he' ? 'borderRight' : 'borderLeft']`. Changed `text-left` to `text-start` in ContactCard and ChannelPicker.

---

### BUG-071 — BirthdayGreetingEditorScreen has hardcoded English UI strings (not translated to Hebrew)
- **Date:** 2026-05-01 | **Time:** 14:30 | **Status:** ✅ fixed
- **Files:** `src/screens/premium/BirthdayGreetingEditorScreen.tsx`, `src/i18n/index.ts`, `src/screens/CalendarScreen.tsx`
- **Bug:** BirthdayGreetingEditorScreen showed English strings in a Hebrew-first app: tier names (Heartfelt/Celebratory/Elegant), descriptions, page subtitle "Birthday Greeting", prompt text, "Choose Style", "Preview", "Birthday Message", and character count. CalendarScreen filter button had hardcoded `aria-label="Filter by religion"` despite the key existing in i18n.
- **Found by:** Developer — Bug Fix Mode scan
- **Fixed by:** Developer — 2026-05-01
- **Fix:** Added 14 new i18n keys (`birthday_greeting_*`, `birthday_tier_*`) in both EN and HE. Moved `BIRTHDAY_TIERS` array inside the component to use `t()`. Replaced all 8 hardcoded strings with `t()` calls. CalendarScreen filter button now uses `t('calendar_filterByReligion')` for `aria-label`.

---

### BUG-072 — ImportContactsScreen hardcoded English UI strings
- **Date:** 2026-05-01 | **Time:** 15:00 | **Status:** ✅ fixed
- **Files:** `src/screens/premium/ImportContactsScreen.tsx`, `src/i18n/index.ts`
- **Bug:** ImportContactsScreen had multiple hardcoded English strings: (1) `CONTACT_FIELDS` array with 10 column-mapping labels at module level; (2) `StepIndicator` subcomponent hardcoded "Upload"/"Map"/"Done" labels despite keys existing; (3) import result stats "Imported"/"Skipped"/"Total rows".
- **Found by:** Developer — Bug Fix Mode scan
- **Fixed by:** Developer — 2026-05-01
- **Fix:** Added 13 i18n keys (`import_field_*`, `import_stat_*`) in EN + HE. Moved `CONTACT_FIELDS` inside main component to use `t()`. Added `useT()` to `StepIndicator` to use existing `import_upload/map/done` keys. Replaced 3 hardcoded stats labels with `t()`.

---

### BUG-073 — GroupsScreen edit/delete icon buttons missing aria-label
- **Date:** 2026-05-01 | **Time:** 15:15 | **Status:** ✅ fixed
- **File:** `src/screens/GroupsScreen.tsx`
- **Bug:** The Edit and Delete icon buttons on group cards had no `aria-label`, making them inaccessible to screen readers.
- **Found by:** Developer — Bug Fix Mode accessibility scan
- **Fixed by:** Developer — 2026-05-01
- **Fix:** Added `aria-label={t('groups_editGroup')}` and `aria-label={t('groups_deleteGroup')}` using existing i18n keys.

---

### BUG-074 — Input component icon positioning not RTL-aware
- **Date:** 2026-05-01 | **Time:** 15:30 | **Status:** ✅ fixed
- **File:** `src/components/ui/Input.tsx`
- **Bug:** The `Input` component always placed the leading icon on the left and the trailing icon on the right using physical CSS classes (`left-3`, `right-3`, `pl-10`, `pr-10`). In Hebrew/RTL mode, search icons and other input icons appeared on the wrong side, with input text padding also on the wrong side.
- **Found by:** Developer — Bug Fix Mode RTL scan
- **Fixed by:** Developer — 2026-05-01
- **Fix:** Added `useLang` import and `isRTL` flag. Replaced all physical positioning classes with RTL-conditional equivalents: icon uses `right-3`/`left-3` in RTL, iconRight uses `left-3`/`right-3` in RTL. Input padding flips accordingly.

---

### BUG-075 — PrivacyScreen all content hardcoded in English
- **Date:** 2026-05-01 | **Time:** 15:45 | **Status:** ✅ fixed
- **Files:** `src/screens/PrivacyScreen.tsx`, `src/i18n/index.ts`
- **Bug:** The entire PrivacyScreen was locked to English: all 10 section titles and body texts were hardcoded in the module-level `SECTIONS` array, plus the hero title, "Last updated:" prefix, privacy badge, intro paragraph, and footer text.
- **Found by:** Developer — Bug Fix Mode i18n scan
- **Fixed by:** Developer — 2026-05-01
- **Fix:** Added 25 i18n keys (`privacy_hero_title`, `privacy_last_updated`, `privacy_badge`, `privacy_intro`, `privacy_footer`, `privacy_s1_title/body` through `privacy_s10_title/body`) in EN + HE. Moved `SECTIONS` array inside component to use `t()`. All strings now localize to Hebrew.

---

### BUG-076 — Remaining physical CSS margins not using logical properties
- **Date:** 2026-05-01 | **Time:** 16:00 | **Status:** ✅ fixed
- **Files:** `src/screens/premium/BirthdayGreetingEditorScreen.tsx`, `src/App.tsx`, `src/screens/DashboardScreen.tsx`, `src/components/MediaAttachmentPicker.tsx`, `src/screens/GreetingEditorScreen.tsx`, `src/screens/WhatsNewScreen.tsx`
- **Bug:** Several files still used physical CSS margin/alignment classes that break RTL layout: `ml-auto`, `ml-2`, `ml-0.5`, `mr-0.5`, `mr-1.5`, `text-right`, and a conditional `${isRTL ? 'mr-2' : 'ml-2'}` that could be simplified.
- **Found by:** Developer — Bug Fix Mode RTL scan
- **Fixed by:** Developer — 2026-05-01
- **Fix:** Replaced all physical margin classes with logical equivalents: `ml-*` → `ms-*`, `mr-*` → `me-*`, `ml-auto` → `ms-auto`, `text-right` → `text-end`. Simplified RTL-conditional margin ternary to `ms-2`.

---

### BUG-077 — WhatsApp emoji encoding — investigation
- **Date:** 2026-05-01 | **Time:** 16:30 | **Status:** ✅ verified (no code change)
- **File:** `src/services/communicationService.ts`
- **Bug:** Reported: WhatsApp sharing does not preserve emojis (🎂 🎉 ❤️ ✨).
- **Found by:** User report
- **Investigation:** `buildWhatsAppUrl` (line 15) already uses `encodeURIComponent(message)`. All WhatsApp call sites — `ChannelPicker`, `WhatsAppButton`, `DashboardScreen` quick-send — funnel through `openWhatsApp` → `buildWhatsAppUrl`. Emoji encoding is correct: `encodeURIComponent('🎂')` → `%F0%9F%8E%82`, which WhatsApp decodes correctly.
- **Resolution:** No code change required. Encoding was already present and correct at all call sites.

---

### BUG-078 — Voice message flow unclear after WhatsApp opens
- **Date:** 2026-05-01 | **Time:** 16:35 | **Status:** ✅ fixed
- **Files:** `src/components/ChannelPicker.tsx`, `src/components/WhatsAppButton.tsx`, `src/i18n/index.ts`
- **Bug:** When a voice (audio) media attachment exists, tapping WhatsApp sends the text but gives no guidance on how to attach the audio manually. WhatsApp does not support audio attachment via URL — user was left with no instructions.
- **Found by:** User report
- **Fixed by:** Developer — 2026-05-01
- **Fix:** Added a post-send `Modal` (stays visible until explicitly dismissed, RTL-ready) to both `ChannelPicker` and `WhatsAppButton`. The modal fires when `media?.type === 'audio'` after WhatsApp is opened. Uses new i18n keys `whatsapp_voice_hint_title` and `whatsapp_voice_hint_body` (EN+HE). Text-only WhatsApp flow is unchanged.

---

### BUG-079 — Missing Jewish minor holidays and fast days in calendar and greeting editor
- **Date:** 2026-05-01 | **Time:** 17:00 | **Status:** ✅ fixed
- **File:** `src/data/holidays.ts`
- **Bug:** 7 Jewish observances had no entries in `holidays.ts`: Lag Ba'Omer, Simchat Torah, Tisha B'Av, 17th of Tammuz (Shiva Asar B'Tammuz), 10th of Tevet (Asara B'Tevet), Fast of Esther (Ta'anit Esther), Fast of Gedaliah (Tzom Gedaliah). Users could not select these as Event Types in the Greeting Editor, and they did not appear in the Calendar view.
- **Found by:** User report — Sprint 13
- **Fixed by:** Developer — 2026-05-01
- **Fix:** Added 14 new holiday entries (2025+2026 pairs for each missing holiday) to `src/data/holidays.ts`. Used `hebcalDate()` with `@hebcal/core` for accurate Hebrew-calendar dates. All entries include EN+HE descriptions, greetings with transliterations, appropriate colors, and emojis. Types: `'minor'` for Lag Ba'Omer, `'major'` for Simchat Torah, `'fast'` for all 5 fast days.

---

### BUG-080 — Duplicate holiday names in Greeting Editor Event Type dropdown
- **Date:** 2026-05-01 | **Time:** 17:15 | **Status:** ✅ fixed
- **File:** `src/screens/GreetingEditorScreen.tsx`
- **Bug:** The Event Type `<Select>` in GreetingEditorScreen showed duplicate holiday names (e.g. "Rosh Hashana" appeared twice) because the raw `HOLIDAYS` array contains both 2025 and 2026 entries with the same `name`. All major Jewish and other holidays were duplicated in the dropdown.
- **Found by:** User report — Sprint 13
- **Fixed by:** Developer — 2026-05-01
- **Fix:** Added `useMemo`-based deduplication to `GreetingEditorScreen`. Sorts holidays by date (upcoming-first), then filters to keep only the first occurrence of each unique `name`. This ensures each holiday appears exactly once, showing the most upcoming/relevant year entry. GroupsScreen already had its own deduplication.

---

### BL-064 — One-tap greeting send flow from dashboard alert cards
- **Date:** 2026-05-01 | **Time:** 18:00 | **Status:** ✅ implemented
- **Files:** `src/screens/DashboardScreen.tsx`, `src/i18n/index.ts`
- **Feature:** Added one-tap greeting flow to all dashboard alert cards. (1) Today's holiday highlight card: added inline "Send Greeting" CTA button that opens Greeting Editor pre-filled with the holiday. (2) Tomorrow's holiday banner: same CTA added. (3) Quick Send panel: replaced direct WhatsApp button with a "Send" button that opens ChannelPicker pre-filled with the selected message — enabling WhatsApp, SMS, Email, Copy, and Share from the quick send panel. Added 2 i18n keys (EN+HE): `dashboard_quick_send_channel`, `dashboard_send_greeting`.
- **Found by:** Sprint 13 planned feature
- **Fixed by:** Developer — 2026-05-01

---

### BUG-081 — Premium UI labels visible when TEMP_PREMIUM_UNLOCK = true

- **Date:** 2026-05-01 | **Time:** 23:45 | **Status:** ✅ fixed
- **Files:** `src/context/AppContext.tsx`, `src/screens/ContactFormScreen.tsx`, `src/screens/SettingsScreen.tsx`
- **Bug:** When `TEMP_PREMIUM_UNLOCK = true` (all users have all features), the UI still showed Premium-branded indicators: "פרטי פרימיום" section header with Crown icon in ContactFormScreen; "Premium" section with gold "Premium Active" banner and Crown icons in SettingsScreen; "Premium Features" nav section title in SettingsScreen. This creates a confusing mismatch — users see Premium labels even though no subscription exists.
- **Root cause:** UI components used `isPremium` (which is `true` for all users when temp unlocked) to show premium features, but had no separate signal for whether to *label* those features as Premium.
- **Fix:** Added `showPremiumUI = !TEMP_PREMIUM_UNLOCK` to AppContext. Conditioned all premium labels and Crown icons on `showPremiumUI`. Feature access unchanged — only labels/icons hidden. Reversing `TEMP_PREMIUM_UNLOCK` to `false` restores full premium UI automatically.
- **Affected components:** ContactFormScreen (Premium Details header), SettingsScreen (Premium section + features nav). PremiumBadge component not used directly — not changed.
- **Found by:** User report — 2026-05-01
- **Fixed by:** Developer — 2026-05-02
- **Fixed by:** Developer — 2026-05-01

---

### BUG-082 — Incorrect notification timing for Israeli holidays

- **Date:** 2026-05-01 | **Time:** 23:59 | **Status:** ✅ fixed
- **Files:** TBD (notification scheduling logic, holiday date source)
- **Bug:** Notifications triggered on the wrong date for Yom HaZikaron and Yom HaAtzmaut. Suspected causes: Hebcal not running in Israel mode (`il: true`), or timezone not set to Asia/Jerusalem in notification scheduling logic.
- **Root cause:** Under investigation. @hebcal/core must be called with `il: true` for Israeli date rules. Notification trigger must use Asia/Jerusalem timezone. A missing-date safeguard is also absent.
- **Fix:** parseDateLocal() helper replaces all new Date("YYYY-MM-DD") calls in notificationService.ts. Parses date strings as local midnight (new Date(y, m-1, d)) avoiding UTC offset shift. Added missing-date safeguards for holiday.date. Hebcal Israel mode (il:true) was already correct — no change needed. Fixed Sprint 17.
- **Found by:** User report — 2026-05-01
