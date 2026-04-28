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

## Known Issues (open)

### BUG-029 (SECURITY — documented)
- **Date:** 2026-04-27 | **Status:** 🟡 known / documented
- **File:** `src/services/storageService.ts`
- **Bug:** `VALID_COUPONS` hardcoded in compiled JS bundle — codes discoverable via DevTools.
- **Mitigation:** Security comment added. Per-device reuse prevention via localStorage is in place. For production: server-side validation or SHA-256 hashing.

---

_Agent 5 runs `npm run build` + `npm run lint` every iteration. New bugs logged here automatically._
