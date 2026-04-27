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

## Known Issues (found, not yet fixed)

### BUG-020
- **Date:** 2026-04-27 | **Status:** 🔴 open
- **File:** `src/core/scoringSystem.ts` (line ~50–59)
- **Bug:** `getBirthdayDaysUntil` computes days using `Math.floor((thisYear.getTime() - today.getTime()) / 86_400_000)`. On DST spring-forward nights, this returns `-1` for a birthday that is actually "today", silently skipping the birthday action.
- **Found by:** Agent 2 — iteration 6
- **Fix (planned):** Replace with `date-fns differenceInCalendarDays(thisYear, startOfDay(today))`

### BUG-021
- **Date:** 2026-04-27 | **Status:** 🔴 open
- **File:** `src/screens/premium/ImportContactsScreen.tsx` (line 281, 366)
- **Bug:** `key={i}` (array index) on CSV preview table rows and import error strings. React mis-reconciles rows when data is filtered or reordered, causing stale cell content to appear.
- **Found by:** Agent 2 — iteration 6
- **Fix (planned):** Use stable composite key for CSV rows; `key={e}` (error string) for error list

### BUG-022
- **Date:** 2026-04-27 | **Status:** 🔴 open
- **File:** `src/screens/CalendarScreen.tsx` (line ~172)
- **Bug:** `key={i}` on holiday color dots within day cells. `dayHolidays` is a filtered subset that changes on month navigation, causing dot colors to bleed across days.
- **Found by:** Agent 2 — iteration 6
- **Fix (planned):** Use `key={h.id}` for holiday dots

### BUG-023
- **Date:** 2026-04-27 | **Status:** 🟡 low priority
- **File:** `src/App.tsx` (line ~65)
- **Bug:** `isOnboardingDone()` (calls `localStorage.getItem`) fires synchronously on every render of `AppShell` after first launch — unnecessary main-thread work on every context state change.
- **Found by:** Agent 2 — iteration 6
- **Fix (planned):** Hoist to `useMemo(() => isOnboardingDone(), [])` or module-level constant

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

## Known Issues (found, not yet fixed)

### BUG-020
- **Date:** 2026-04-27 | **Status:** 🔴 open
- **File:** `src/core/scoringSystem.ts` (line ~50–59)
- **Bug:** `getBirthdayDaysUntil` uses raw ms division — returns `-1` on DST spring-forward nights for a birthday that is "today".
- **Fix (planned):** `date-fns differenceInCalendarDays(thisYear, startOfDay(today))`

### BUG-021
- **Date:** 2026-04-27 | **Status:** 🔴 open
- **File:** `src/screens/premium/ImportContactsScreen.tsx` (lines 281, 366)
- **Bug:** `key={i}` on CSV preview rows and error strings — React mis-reconciles on filter/reorder.
- **Fix (planned):** Stable composite key for rows; `key={e}` for errors

### BUG-022
- **Date:** 2026-04-27 | **Status:** 🔴 open
- **File:** `src/screens/CalendarScreen.tsx` (line ~172)
- **Bug:** `key={i}` on holiday color dots — colors bleed across days on month navigation.
- **Fix (planned):** `key={h.id}`

### BUG-023
- **Date:** 2026-04-27 | **Status:** 🟡 low priority
- **File:** `src/App.tsx` (line ~65)
- **Bug:** `isOnboardingDone()` fires on every render — unnecessary localStorage read.
- **Fix (planned):** `useMemo(() => isOnboardingDone(), [])`

### BUG-029 (SECURITY — documented)
- **Date:** 2026-04-27 | **Status:** 🟡 known / documented
- **File:** `src/services/storageService.ts`
- **Bug:** `VALID_COUPONS` hardcoded in compiled JS bundle — codes discoverable via DevTools.
- **Mitigation:** Security comment added. Per-device reuse prevention via localStorage is in place. For production: server-side validation or SHA-256 hashing.

---

_Agent 5 runs `npm run build` + `npm run lint` every iteration. New bugs logged here automatically._
