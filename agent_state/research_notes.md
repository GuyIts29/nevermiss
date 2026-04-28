# Agent 2 — Research Notes
_Last updated: 2026-04-29 (Sprint 4 + Sprint 5)_

## NEW — priority improvements (Sprint 4 + Sprint 5)

### FINDING 74 — `exportBackupJSON()` and `downloadCSVTemplate()`: `URL.createObjectURL()` without `revokeObjectURL()` — memory leak on repeated calls
**Files:** `src/services/storageService.ts` (exportBackupJSON), `src/screens/premium/ImportContactsScreen.tsx` (downloadCSVTemplate)

**Problem:** Both functions create an object URL, trigger a download, and then leave the URL alive for the lifetime of the document:
```ts
// storageService.ts
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.click()
// ← URL.revokeObjectURL(url) never called

// ImportContactsScreen.tsx
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'nevermiss_import_template.csv'
a.click()
// ← URL.revokeObjectURL(url) never called
```
Each call allocates a `Blob` URL that holds a reference to the underlying `Blob` in browser memory. The URL (and associated blob) is never freed until the page is closed. If a user exports multiple times in one session (e.g., repeated backup exports), each export adds a new unreleased blob. On mobile (Capacitor/WKWebView) where memory pressure is higher, accumulating unreleased blobs increases the risk of the app being memory-killed.

**Fix (1 line each):** Add `URL.revokeObjectURL(url)` after the click triggers. Using `setTimeout(0)` ensures the browser has time to initiate the download before revocation:
```ts
a.click()
setTimeout(() => URL.revokeObjectURL(url), 100)
```

**Priority:** Low-Medium — correctness/hygiene. Easy 1-line fix per function; no API changes needed.

---

### FINDING 75 — `GroupsScreen.tsx`: `SUGGESTED_BASES` holiday suggestions ignore actual group member religions; no way to reject a suggested holiday
**File:** `src/screens/GroupsScreen.tsx` (SUGGESTED_BASES + applyPurpose)

**Problem A — suggestions blind to member religions:**
`SUGGESTED_BASES` is a static lookup table keyed by `GroupPurpose`. It always returns the same holidays regardless of which contacts are actually in the group. For example, a `clients` group containing only Muslim contacts will still auto-suggest `christmas` and `rosh-hashana` (because the static table includes them for all client groups). A smarter approach would compute suggestions based on the `religion` or `celebrationType` distribution of `group.contactIds`:
```ts
const memberReligions = new Set(
  group.contactIds
    .map(id => contacts.find(c => c.id === id))
    .filter(Boolean)
    .map(c => c.celebrationType ?? c.religion)
)
// then filter SUGGESTED_BASES results to holidays matching those religions
```
This would produce more relevant suggestions without changing the UX model.

**Problem B — no way to reject/undo a suggestion:**
`applyPurpose()` merges suggested holiday IDs into `selectedHolidayIds` using `[...new Set([...prev, ...suggested])]`. Once suggested holidays are added they become indistinguishable from manually selected ones. If a user changes the purpose (e.g., from `work` to `hr`), the new suggestions merge in but the old work-purpose suggestions are NOT removed. Over multiple purpose changes, the holiday list grows monotonically with no pruning. A "suggested" vs "manually selected" distinction (e.g., a separate `suggestedIds` state that can be rejected) would give the user explicit control.

**Fix A:** Add a `getSmartSuggestions(purpose, contactIds, contacts)` utility that cross-references member religions. Medium effort.
**Fix B:** Track suggestions separately; show a "Clear suggestions" button. Low effort.

**Priority:** Medium — affects UX quality of a core Sprint 5 feature. Problem B is a low-effort polish item.

---

### FINDING 76 — `ContactFormScreen.tsx`: `findDuplicate()` only guards NEW contacts; editing a contact to match an existing one creates a silent duplicate
**File:** `src/screens/ContactFormScreen.tsx` (findDuplicate)

**Problem:** `findDuplicate()` opens with:
```ts
const findDuplicate = (): Contact | null => {
  if (!isNew) return null
  ...
}
```
This intentionally skips the duplicate check when editing an existing contact. But it creates a blind spot: if a user edits an existing contact's name or phone number to exactly match another existing contact, no warning is shown and a true duplicate is silently created. The check for a renamed contact (e.g., renaming "Yossi" to match an existing "Yossi Cohen") should compare against all contacts EXCEPT the current contact being edited:
```ts
const findDuplicate = (): Contact | null => {
  const nameNorm = form.name?.trim().toLowerCase() ?? ''
  const phoneNorm = (form.phone ?? '').replace(/\D/g, '')
  return contacts.find(c => {
    if (c.id === contactId) return false  // exclude self
    const sameName = c.name.trim().toLowerCase() === nameNorm
    const samePhone = phoneNorm.length >= 7 && c.phone.replace(/\D/g, '') === phoneNorm
    return sameName || samePhone
  }) ?? null
}
```
The `handleSave` call site already validates before saving, so adding this check to edits as well would uniformly protect both creation and update paths.

**Fix:** Remove the `if (!isNew) return null` guard; add a `c.id === contactId` exclusion to the `find` predicate. Low effort — 2 line change.

**Priority:** Medium — duplicate data is a data-integrity issue in a CRM. The fix is trivial.

---

## NEW — priority improvements (iteration 10)

### FINDING 28 — HolidayDetailScreen.tsx: `★ Major` badge, `+N more contacts` string, and `GreetingRow` copy button `aria-label` are all hardcoded English
**File:** `src/screens/HolidayDetailScreen.tsx` (lines 87, 237, 296)

**Problem A — `★ Major` badge (line 87):**
```tsx
>★ Major</span>
```
The "major" holiday badge is hardcoded English. There is no `holiday_major` key in `src/i18n/index.ts`. Hebrew users see the English word "Major" inside the hero banner of every major holiday detail screen (e.g., Rosh Hashanah, Eid al-Adha, Passover — all tagged `type: 'major'`).

**Problem B — `+N more contacts` overflow text (line 237):**
```tsx
+{relatedContacts.length - 3} more contacts
```
When a holiday has more than 3 related contacts, the overflow count is hardcoded English. There is no `holiday_moreContacts` key in `src/i18n/index.ts`. This text appears inside the "Your Contacts" card that is specifically shown when a user has contacts matching the holiday's religion — a high-relevance moment where Hebrew users see English text.

**Problem C — `GreetingRow` copy button `aria-label` (line 296):**
```tsx
aria-label="Copy"
```
The copy icon button in every `GreetingRow` has a hardcoded English `aria-label="Copy"`. The `copied` key already exists in `src/i18n/index.ts` (value `'Copied!'`) but there is no `copy` key. The `GreetingRow` component does not currently accept or use `useT()` — it is a local function component inside `HolidayDetailScreen.tsx` that would need to either receive `t` as a prop or call `useT()` internally.

**Problem D — `dir` detection by hardcoded string comparison (line 288):**
```tsx
dir={lang === 'Hebrew' || lang === 'עברית' || lang === 'Arabic' || lang === 'ערבית' ? 'rtl' : 'ltr'}
```
The `dir` attribute for RTL/LTR text rendering is determined by comparing the `lang` label string against 4 hardcoded values in two languages. If the i18n keys `holiday_Hebrew` or `holiday_Arabic` ever change their translated values (e.g., to abbreviations), or if a new RTL language is added to the greetings data, this condition silently breaks and RTL text renders LTR (text alignment, punctuation marks, and quotation direction all flip). The correct fix is to pass the language *code* (e.g., `'he'`, `'ar'`) through the data rather than the display label, and derive `dir` from the code.

**Fix A:** Add key `holiday_major` → `en: '★ Major'`, `he: '★ ראשי'` and replace the hardcoded span content.

**Fix B:** Add key `holiday_moreContacts` → `en: '+{n} more contacts'`, `he: '+{n} אנשי קשר נוספים'` and use `t('holiday_moreContacts', { n: relatedContacts.length - 3 })`.

**Fix C:** Add key `copy` → `en: 'Copy'`, `he: 'העתק'`. Add `useT()` call inside `GreetingRow` (it is already inside the same file that imports `useT`) and replace `aria-label="Copy"` with `aria-label={t('copy')}`.

**Fix D:** Add a `langCode` prop to `GreetingRow` (e.g., `'he' | 'ar' | 'en' | 'transliteration'`) and derive `dir` from `['he', 'ar'].includes(langCode) ? 'rtl' : 'ltr'`. The three call sites in `HolidayDetailScreen` already know the language code.

**Priority:** Medium — Problems A and B affect all users visiting major holiday detail screens; Problem C is a WCAG 4.1.2 violation on every greeting copy button; Problem D is a latent correctness bug that will silently break RTL rendering if any translated label changes.

---

### FINDING 29 — ContactFormScreen.tsx: `Avatar Color` label and `Auto gradient` button title are hardcoded English; `PremiumFeaturePrompt` `feature` prop passes hardcoded English string
**File:** `src/screens/ContactFormScreen.tsx` (lines 173, 187, 355)

**Problem A — `Avatar Color` section label (line 173):**
```tsx
<p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
  Avatar Color
</p>
```
The label above the avatar color picker is hardcoded English with no `t()` call. Despite the rest of `ContactFormScreen` being well-localized (all section headings, field labels, and placeholders use `t()`), this label is the only visible text on the avatar picker UI that bypasses the translation system. Hebrew users see an English label directly inside the contact form — a high-frequency screen visited every time a contact is created or edited.

**Problem B — `Auto gradient` button title (line 187):**
```tsx
title="Auto gradient"
```
The auto-gradient avatar button has a hardcoded English `title` attribute. While `title` is not read by most mobile screen readers (as noted in Finding 12), it is visible on desktop hover and is the only accessible name for this button. There is no `aria-label` at all — screen readers encounter a button with no accessible name. The button is part of the avatar color picker which is the first interactive element in the form body.

**Problem C — `PremiumFeaturePrompt feature` prop (line 355):**
```tsx
<PremiumFeaturePrompt feature="Birthday, Email, Department & Role" />
```
The `feature` prop passed to `PremiumFeaturePrompt` is a hardcoded English string listing premium-only fields. This string is rendered as marketing/upsell copy visible to all free-tier users when they open the contact form. No translation key exists for this string.

**Fix A:** Add key `contactForm_avatarColor` → `en: 'Avatar Color'`, `he: 'צבע אווטאר'` and replace the hardcoded label.

**Fix B:** Add `aria-label={t('contactForm_autoGradient')}` to the auto-gradient button and remove the `title`. Add key `contactForm_autoGradient` → `en: 'Auto gradient'`, `he: 'גרדיאנט אוטומטי'`.

**Fix C:** Either (a) add an i18n key `contactForm_premiumFields` → `en: 'Birthday, Email, Department & Role'`, `he: 'יום הולדת, אימייל, מחלקה ותפקיד'` and thread it through, or (b) check if `PremiumFeaturePrompt` accepts a translation key rather than a raw string — if so, pass the key directly.

**Priority:** Medium — Problem A is a visible English label on a high-frequency screen (every contact creation/edit); Problem B is an accessibility gap (button with no accessible name); Problem C is upsell copy shown to all free users that is untranslated.

---

### FINDING 30 — Modal.tsx: no focus trap; close button `aria-label` is hardcoded English; modal sheet not focused on open
**File:** `src/components/ui/Modal.tsx` (lines 83–88, 24–31, 36–41)

**Problem A — no focus trap (lines 24–31, 36–41):**
The `Modal` component handles `Escape` key dismissal via a `keydown` listener (line 26–30), but there is **no focus trap**. When the modal opens, keyboard Tab continues cycling through all elements in the document — including the background content obscured by the `backdrop`. For mobile users with external keyboards (iPad + keyboard, Android + Bluetooth keyboard) and desktop web users, Tab can escape the modal to background app content. This violates WCAG 2.1 SC 2.1.2 (No Keyboard Trap) which requires that keyboard focus remain within a modal dialog while it is open. The `Modal` component is used in at least 6 places across the app (ContactFormScreen delete confirm, GreetingEditorScreen send modal, WhatsApp confirmation modal, etc.).

**Problem B — close button `aria-label` hardcoded English (line 85):**
```tsx
aria-label="Close"
```
The modal close button has a hardcoded English `aria-label`. The key `close` already exists in `src/i18n/index.ts` (value `'Close'` / `'סגור'`). However, `Modal` does not currently import `useT()` — it has no `t` function available. Adding `useT()` requires adding `import { useT } from '@/context/LanguageContext'` and calling it inside the component.

**Problem C — modal sheet not focused on open:**
When `isOpen` flips from `false` to `true`, the modal sheet `<div>` receives no programmatic focus. Screen readers and keyboard users are not automatically placed inside the modal — they must Tab from wherever focus currently is (typically the trigger button) through all subsequent DOM elements until they reach the modal. The correct behavior (ARIA APG Modal Dialog pattern) is to focus the first interactive element inside the modal (or the modal container itself with `tabIndex={-1}`) as soon as it opens.

**Fix A (focus trap):** Add a `useEffect` that, when `isOpen` is true, intercepts `Tab` and `Shift+Tab` keypresses to cycle focus only among focusable elements within the modal container. A minimal implementation uses `querySelectorAll` on the modal ref to collect focusable elements and clamps the cycle:
```ts
const focusable = ref.current?.querySelectorAll<HTMLElement>(
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
)
```
Alternatively, adopt the `focus-trap-react` package (0.8 kB gzipped) which handles all edge cases.

**Fix B:** Import `useT` and replace `aria-label="Close"` with `aria-label={t('close')}`.

**Fix C:** Add a `ref` to the modal sheet `<div>` and a `useEffect([isOpen])` that calls `ref.current?.focus()` when `isOpen` becomes `true`. Set `tabIndex={-1}` on the sheet div so it can receive programmatic focus without appearing in Tab order.

**Priority:** High (Problem A) / Medium (Problems B and C) — the missing focus trap is a WCAG 2.1 SC 2.1.2 violation affecting every modal in the app; the modal is used for destructive actions (delete contact confirm) where keyboard accessibility is especially critical. Problem B is a quick 2-line fix using an already-existing i18n key.

---

## NEW — priority improvements (iteration 9)

### FINDING 25 — Navigation.tsx: `PageHeader` back button `aria-label` hardcoded English; `BottomNav` `NAV_ITEMS` rebuilt every render
**File:** `src/components/Navigation.tsx` (lines 67–72, 12–18)

**Problem A — hardcoded `aria-label` on back button (line 70):**
```tsx
aria-label="Go back"
```
The `PageHeader` back button has a hardcoded English `aria-label`. Every screen that uses `<PageHeader back />` (ContactDetailScreen, ContactFormScreen, GreetingEditorScreen, HolidayDetailScreen, SettingsScreen, AboutScreen, WhatsNewScreen, UpgradeScreen, PrivacyScreen, TermsScreen — at minimum 10 screens) exposes this label to screen readers in English only. Hebrew VoiceOver/TalkBack users hear "Go back" in English on every secondary screen. No `go_back` key exists in `src/i18n/index.ts`.

**Problem B — `NAV_ITEMS` rebuilt on every render (lines 12–18):**
```tsx
const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: t('nav_dashboard') },
  ...
] as const
```
`NAV_ITEMS` is declared as a plain `const` inside `BottomNav()`, so a new array with 5 new object literals is allocated on every render. `BottomNav` renders on every route change AND on every `AppContext` value change (since `BottomNav` is inside `WithNav` which is inside the context tree). With Finding 1/7 unresolved (double AppContext re-render), this is 5 × 2 = 10 object allocations per contact mutation — multiplied by however many renders the parent triggers. The `label` values themselves come from `t()` which reads from a stable context, so wrapping in `useMemo([t])` is safe (the array only needs to be rebuilt when the language changes).

**Fix A:** Add key `go_back` to `src/i18n/index.ts`:
| Key | en | he |
|---|---|---|
| `go_back` | `'Go back'` | `'חזור'` |

Add `const t = useT()` (and `useLang` import) to `PageHeader`, then replace the hardcoded string:
```tsx
aria-label={t('go_back')}
```

**Fix B:** Wrap `NAV_ITEMS` in `useMemo`:
```tsx
const NAV_ITEMS = useMemo(() => [
  { to: '/dashboard', icon: LayoutDashboard, label: t('nav_dashboard') },
  { to: '/calendar',  icon: Calendar,        label: t('nav_calendar')  },
  { to: '/contacts',  icon: Users,           label: t('nav_contacts')  },
  { to: '/groups',    icon: FolderOpen,      label: t('nav_groups')    },
  { to: '/settings',  icon: Settings,        label: t('nav_settings')  },
], [t])
```
`t` is a stable function reference that only changes on language switch — this is correct as a memo dependency.

**Priority:** Medium — Problem A is a WCAG 4.1.2 violation affecting all secondary screens; Problem B is a minor allocation issue that compounds with the existing double-render problem (Findings 1/7).

---

### FINDING 26 — communicationService.ts: `buildWhatsAppUrl` does not normalize local phone numbers; leading-zero numbers produce invalid `wa.me` URLs
**File:** `src/services/communicationService.ts` (lines 49–53)

**Problem:**
```ts
export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = phone.replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${normalized}?text=${encoded}`
}
```
`wa.me` URLs require an **international E.164 phone number** (digits only, starting with country code, no leading `+` or spaces). The current normalization strips all non-digits but does NOT handle the two most common real-world cases:

1. **Local format with leading zero** — Israeli mobile numbers stored as `052-1234567` or `0521234567` become `wa.me/0521234567`. WhatsApp does not resolve numbers with a leading `0`; the link opens WhatsApp but lands on "Phone number shared via URL is invalid." The correct output should be `wa.me/9725212345678` (drop the `0`, prepend country code).
2. **Numbers already formatted with `+`** — `+972-52-123-4567` correctly strips to `9725212345678` because `.replace(/\D/g, '')` removes the `+`. This case works.
3. **Numbers stored with country code but no `+`** — `972521234567` also works.

The app targets Israel as a primary market (full Hebrew locale, IDF holidays, etc.) where the vast majority of contact phone numbers are stored in local format. This means a large fraction of "Send via WhatsApp" attempts silently fail with an invalid link — the user sees the WhatsApp app open but the chat never starts.

**Additional issue — `WhatsAppButton` `media` prop is a UX lie:** `WhatsAppButton` accepts a `media` prop (`MediaAttachment | null`) and renders a download link with the hint "Save the media first, then attach it in WhatsApp." However, `openWhatsApp(phone, message)` (line 24) does not pass `media` at all — only the text message is URL-encoded. The `media` prop is handled purely in the confirmation modal preview. This is correct behavior (WhatsApp's `wa.me` URL scheme does not support media attachments), but the modal's inline hint is the only indication of this limitation. If the hint text is ever removed or missed by users, they will believe media is sent automatically.

**Fix (phone normalization):** Improve `buildWhatsAppUrl` to handle local Israeli format:
```ts
export function buildWhatsAppUrl(phone: string, message: string): string {
  let normalized = phone.replace(/\D/g, '')
  // Strip leading zero (local format) and prepend Israeli country code
  // Only auto-prepend if the number is clearly local (starts with 0 and is 9-10 digits)
  if (normalized.startsWith('0') && normalized.length >= 9 && normalized.length <= 10) {
    normalized = '972' + normalized.slice(1)
  }
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${normalized}?text=${encoded}`
}
```
Note: A more robust solution would store numbers in E.164 in `ContactFormScreen` at input time (add a phone field validator/formatter), but the above is a safe partial fix that resolves the most common Israeli number format without breaking international numbers.

**Fix (media clarity):** The existing `t('media_whatsapp_hint')` key already provides the correct explanatory text. No code change needed — the UX limitation is documented. However, the `media` type parameter in `WhatsAppButtonProps` could be strengthened with a comment.

**Priority:** High — affects the single most prominent CTA in the app (the "Send via WhatsApp" button). For Israeli users storing numbers in local format (the primary market), the button silently fails on every tap.

---

### FINDING 27 — AboutScreen.tsx: `VALUES` and `TECH` arrays are entirely hardcoded English; mission paragraph also hardcoded
**File:** `src/screens/AboutScreen.tsx` (lines 11–43, 76–82, 121–143)

**Problem:** `AboutScreen` uses `t()` for section headings (`about_title`, `about_mission`, `about_values`, `about_notice`, `about_noAutoSend`, `about_noAutoSendDesc`, `about_technical`) but all the **content** strings — the actual value propositions and technical facts — are hardcoded English:

**`VALUES` array (lines 11–36) — 4 items, each with hardcoded `title` and `desc`:**
| title | desc |
|---|---|
| `'Privacy First'` | `'All your data lives on your device...'` |
| `'Cultural Respect'` | `'We treat all religions and traditions...'` |
| `'Human Connection'` | `'Technology should strengthen relationships...'` |
| `'Smart Intelligence'` | `'Our relationship engine helps you prioritize...'` |

**Mission paragraph (lines 76–82):** A 3-sentence paragraph hardcoded directly in JSX — not behind any `t()` call. This is the most prominent text block on the screen.

**`TECH` array (lines 38–43) — 4 items, each with hardcoded `label` and `value`:**
| label | value |
|---|---|
| `'Data Storage'` | `'Local device only'` |
| `'External APIs'` | `'None — fully offline'` |
| `'Analytics'` | `'None'` |
| `'Tracking / Ads'` | `'None'` |

Also hardcoded at line 139: `'Platform'` and `'Web · Android · iOS (Capacitor)'`.

Hebrew users see the About screen entirely in English for all substantive content — only the section headings are translated. The About screen is often shown to new users or during app store review, making it a high-visibility gap.

**Fix:** Add i18n keys for all content strings. Suggested keys:

| Key | en | he |
|---|---|---|
| `about_value1_title` | `'Privacy First'` | `'פרטיות קודמת'` |
| `about_value1_desc` | `'All your data lives on your device...'` | `'כל הנתונים שלך נשמרים במכשירך...'` |
| `about_value2_title` | `'Cultural Respect'` | `'כבוד תרבותי'` |
| `about_value2_desc` | `'We treat all religions...'` | `'אנו מתייחסים לכל הדתות...'` |
| `about_value3_title` | `'Human Connection'` | `'קשר אנושי'` |
| `about_value3_desc` | `'Technology should strengthen...'` | `'הטכנולוגיה צריכה לחזק קשרים...'` |
| `about_value4_title` | `'Smart Intelligence'` | `'אינטליגנציה חכמה'` |
| `about_value4_desc` | `'Our relationship engine...'` | `'מנוע הקשרים שלנו...'` |
| `about_mission_text` | `'NeverMiss helps people maintain...'` | `'NeverMiss עוזרת לאנשים לשמור...'` |
| `about_tech_storage_label` | `'Data Storage'` | `'אחסון נתונים'` |
| `about_tech_storage_val` | `'Local device only'` | `'מכשיר מקומי בלבד'` |
| `about_tech_apis_label` | `'External APIs'` | `'ממשקי API חיצוניים'` |
| `about_tech_apis_val` | `'None — fully offline'` | `'אין — לגמרי אופליין'` |
| `about_tech_analytics_label` | `'Analytics'` | `'אנליטיקה'` |
| `about_tech_analytics_val` | `'None'` | `'אין'` |
| `about_tech_tracking_label` | `'Tracking / Ads'` | `'מעקב / פרסומות'` |
| `about_tech_tracking_val` | `'None'` | `'אין'` |
| `about_tech_platform_label` | `'Platform'` | `'פלטפורמה'` |
| `about_tech_platform_val` | `'Web · Android · iOS (Capacitor)'` | `'Web · Android · iOS (Capacitor)'` |

Convert `VALUES` and `TECH` from module-level constants to functions/computed values inside the component that call `t()`, similar to the pattern used in `WhatsNewScreen` for `TYPE_META`.

**Priority:** Medium — the About screen is a trust-building screen for new users and app store reviewers. Hebrew users currently see a screen where only the section headings are localized while all the value propositions are in English. This undermines the bilingual product positioning.

---

## NEW — priority improvements (iteration 8)

### FINDING 22 — greetingService.ts: `generateBirthdayGreeting` has a structural TypeScript type lie and an unused parameter
**File:** `src/services/greetingService.ts` (lines 725–750, 592)

**Problem A — type lie via double cast (lines 725–750):**
The `bodies` variable in `generateBirthdayGreeting` is declared as `Record<Language, string[]>`, but the `hebrew` entry is actually a `Record<GreetingTone, string[]>` object (with keys `friendly`, `business`, `formal`, `vip`), not a flat `string[]`. The code works around this with a double cast:
```ts
hebrew: { friendly: [...], business: [...], ... } as unknown as string[],
```
This completely bypasses TypeScript's type checker. The special-case tone-dispatch logic at lines 781–787 (`const heEntry = bodies.hebrew as unknown as Record<string, string[]>`) then decodes the lie. If any other language's entry were accidentally given a nested-object structure, the `!Array.isArray(pool)` fallback would silently swallow it. The real type of `bodies` should be `Record<Language, string[] | Record<GreetingTone, string[]>>` with a discriminated accessor, or Hebrew bodies should be extracted to a separate `HEBREW_BIRTHDAY_BODIES: Record<GreetingTone, string[]>` constant referenced directly in the dispatch logic.

**Problem B — unused `_contact` parameter in `buildGenericBody` (line 592):**
```ts
function buildGenericBody(_contact: Contact, tone: GreetingTone, lang: Language): string {
```
The `_contact` parameter is declared (with the underscore convention acknowledging it is unused) but is never accessed in the function body. The function only uses `tone` and `lang`. The `Contact` import exists only because of this parameter — removing it has no functional impact but reduces the function signature and removes a dead parameter that confuses callers who wonder what contact data the function uses.

**Fix A:** Extract Hebrew birthday bodies into:
```ts
const HEBREW_BIRTHDAY_BODIES: Record<GreetingTone, string[]> = {
  friendly: [...],
  business: [...],
  formal: [...],
  vip: [...],
  internal: [...],  // add fallback or alias to friendly
}
```
Then in `generateBirthdayGreeting`, replace the Hebrew special-case with `pool = HEBREW_BIRTHDAY_BODIES[tone] ?? HEBREW_BIRTHDAY_BODIES.friendly`.
Remove the `as unknown as string[]` cast and the `as unknown as Record<string, string[]>` cast entirely.

**Fix B:** Remove the `_contact` parameter from `buildGenericBody`. Update the two callsites to omit it.

**Priority:** Medium (type safety) — the double cast hides a structural mismatch. If a future developer adds a new language with tone-specific bodies following the Hebrew pattern, the type system will not catch the mistake and `!Array.isArray(pool)` may silently fall back to English.

---

### FINDING 23 — scoringSystem.ts: all `SuggestedAction` label/description strings are hardcoded English; shown in UI on ContactDetailScreen
**File:** `src/core/scoringSystem.ts` (lines 70–115), `src/screens/ContactDetailScreen.tsx`

**Problem:** `getSuggestedAction` constructs a `SuggestedAction` object with `label` and `description` fields that are hardcoded English strings:
- Line 73: `"It's their birthday!"` / `"Birthday in ${birthdayDays} day${...}"`
- Line 74: `"Send a birthday greeting to ${contact.name}"`
- Line 84: `"${holiday.name} in ${days} day${...}"`
- Line 85: `"Send a ${holiday.name} greeting to ${contact.name}"`
- Line 94: `"${daysSinceContact} days since contact"`
- Line 95: `"${contact.name} hasn't heard from you in a while — time to reconnect"`
- Line 103: `"Check-in overdue"`
- Line 104: `"Send a check-in message to ${contact.name}"`
- Line 111: `"Schedule follow-up"`
- Line 112: `"Keep up the relationship with ${contact.name}"`

`ContactDetailScreen` renders `score.suggestedAction.label` directly in the relationship score card (visible for every contact). Hebrew users see English action labels on the screen they visit for every contact interaction. The `scoringSystem` module has no access to `t()` since it is a pure service layer, not a React component — so translation cannot be done inside it.

**Fix:** Two viable approaches:
1. **Translate at render time (preferred):** Replace the hardcoded label/description strings with stable i18n key identifiers (e.g., `type: 'wish_birthday'` already encodes the action). In `ContactDetailScreen`, derive the displayed label from the `suggestedAction.type` using `t()`, rather than rendering `score.suggestedAction.label` directly. Add i18n keys:
   - `action_wish_birthday` / `action_wish_birthday_in` (with `{n}` param)
   - `action_wish_holiday` (with `{name}`, `{n}` params)
   - `action_reconnect` (with `{n}` param)
   - `action_checkin`
   - `action_followup`
2. **Pass `t` into `getSuggestedAction`:** Thread a translation function through the service call, which works but makes the service impure.

Approach 1 is cleaner — it keeps the scoring service a pure calculation layer and lets the UI layer handle presentation/localization.

**Priority:** High — `score.suggestedAction.label` is displayed prominently on the contact detail screen (the most frequently visited screen), and is completely untranslated for Hebrew users despite the app having full i18n infrastructure.

---

### FINDING 24 — BirthdayCenterScreen: 7 hardcoded English strings in hero banner, BirthdayCard, and empty state
**File:** `src/screens/premium/BirthdayCenterScreen.tsx` (lines 66–67, 70, 153, 197, 203, 236–237)

**Problem:** Despite the screen using `t()` for tab labels and empty-state messages, the hero section and `BirthdayCard` component contain hardcoded English strings that bypass the translation system:

| Location | Hardcoded string |
|---|---|
| Line 66 | `"Birthday Center"` — hero title (also the screen title, which IS translated via `t('birthday_title')` in `PageHeader` — but the hero repeats a hardcoded English version) |
| Line 67 | `"Never miss a special day"` — hero subtitle |
| Line 70 | `` `${withBirthdays.length} contacts with birthdays` `` — contact count badge |
| Line 153 | `"No birthdays tracked yet"` — empty state title when `withBirthdays.length === 0` |
| Line 197 | `"Today! 🎉"` — badge text on today's birthday card (the `<Badge>` variant="danger") |
| Line 203 | `"It's their birthday!"` — highlight label inside today's birthday card |
| Line 236–237 | `"day"` / `"days"` — countdown unit label below the day number in `BirthdayCard` non-today variant |

The `t('days')` key already exists in `src/i18n/index.ts` (value `'d'` in English, `'י׳'` in Hebrew). However, line 237 uses the full word `"days"` not the abbreviated `'d'`, so a new key is needed. The hero subtitle, contact count badge, empty-state title, today badge, and "It's their birthday!" label have no corresponding i18n keys.

**Fix:** Add the following keys to `src/i18n/index.ts`:

| Key | en | he |
|---|---|---|
| `birthday_heroSubtitle` | `'Never miss a special day'` | `'לעולם אל תפספס יום מיוחד'` |
| `birthday_contactCount` | `'{n} contacts with birthdays'` | `'{n} אנשי קשר עם יום הולדת'` |
| `birthday_noneTracked` | `'No birthdays tracked yet'` | `'עדיין לא עוקבים אחרי ימי הולדת'` |
| `birthday_todayBadge` | `'Today! 🎉'` | `'היום! 🎉'` |
| `birthday_itsTheirBirthday` | `"It's their birthday!"` | `'היום יום ההולדת שלהם!'` |
| `birthday_day` | `'day'` | `'יום'` |
| `birthday_days` | `'days'` | `'ימים'` |

Replace line 66's hardcoded `"Birthday Center"` with `{t('birthday_title')}` (key already exists — this is a duplication fix, not a new key needed).
Replace `"day"/"days"` with `{daysUntil === 1 ? t('birthday_day') : t('birthday_days')}`.

**Priority:** Medium — BirthdayCenterScreen is a premium feature but directly visible to all premium users; the hero section is the first thing they see on the screen, and the "Today!" badge on a birthday is a high-emotion moment where Hebrew users should see Hebrew text.

---

## NEW — priority improvements (iteration 7)

### FINDING 19 — ContactDetailScreen: `generateGreeting()` called unconditionally on every render; `relatedHolidays` not memoized
**File:** `src/screens/ContactDetailScreen.tsx` (lines 56–60, 40–43)

**Problem A — unconditional `generateGreeting()` call (line 56–60):**
`generateGreeting({ contact, tone: 'friendly', language: contact.language })` is called on every render of `ContactDetailScreen` regardless of whether the contact has a phone number. The result `previewMessage` is only ever consumed inside `{contact.phone && <WhatsAppButton message={previewMessage} ...>}` (line 248–255). When `contact.phone` is absent (any contact without a phone number), the generated greeting string is computed, held in memory, and immediately discarded. `generateGreeting` runs string template logic and may iterate over greeting template data — all wasted work for phone-less contacts.

**Problem B — `relatedHolidays` not memoized (line 40–43):**
`relatedHolidays` is computed inline in the component body via `HOLIDAYS.filter(...)` with no `useMemo`. HOLIDAYS has ~820 entries. Every re-render of `ContactDetailScreen` (triggered by any AppContext update — contact mutation elsewhere, settings change, etc.) re-runs this filter. The computation involves `new Date(h.date).getTime()` per entry, which creates ~820 short-lived Date objects per render.

**Fix A:** Guard the call: `const previewMessage = contact.phone ? generateGreeting({ contact, tone: 'friendly', language: contact.language }) : ''`

**Fix B:** Wrap in `useMemo`:
```ts
const relatedHolidays = useMemo(() =>
  HOLIDAYS.filter(h => {
    const days = (new Date(h.date).getTime() - nowMs) / (1000 * 60 * 60 * 24)
    return h.religion === contact.religion && days >= 0 && days <= 60
  }),
  [contact.religion, nowMs]
)
```
Note: `useMemo` is already imported in the file via React — only the call needs adding.
**Impact:** Medium performance — compounds with AppContext re-renders (Finding 1/2/7). Also avoids wasted greeting generation work for contacts without phone numbers, which is a common case for purely email-based or notes-only contacts.

---

### FINDING 20 — ContactDetailScreen: urgency level badge renders raw English enum value; 4 `interactionFrequency` values also hardcoded
**File:** `src/screens/ContactDetailScreen.tsx` (lines 167, 212)

**Problem A — urgency level badge (line 167):**
```tsx
<div ...>{score.urgencyLevel}</div>
```
`score.urgencyLevel` is a TypeScript union of `'critical' | 'high' | 'medium' | 'low'` — raw English enum values displayed directly in the UI with zero translation. Hebrew users see the English urgency badge on the relationship score card for every contact. There are no `urgencyLevel_*` keys in `src/i18n/index.ts`.

**Problem B — `interactionFrequency` capitalized manually (line 212):**
```tsx
value={contact.interactionFrequency.charAt(0).toUpperCase() + contact.interactionFrequency.slice(1)}
```
`contact.interactionFrequency` is `'daily' | 'weekly' | 'monthly' | 'quarterly'`. This manual capitalize-first pattern bypasses `t()` entirely — the value is always English regardless of language setting. No i18n keys exist for these values.

**Fix A:** Add 4 keys to `src/i18n/index.ts`:
| Key | en | he |
|---|---|---|
| `urgency_critical` | `'Critical'` | `'קריטי'` |
| `urgency_high` | `'High'` | `'גבוה'` |
| `urgency_medium` | `'Medium'` | `'בינוני'` |
| `urgency_low` | `'Low'` | `'נמוך'` |

Replace line 167 with: `{t(`urgency_${score.urgencyLevel}` as any)}`

**Fix B:** Add 4 frequency keys:
| Key | en | he |
|---|---|---|
| `freq_daily` | `'Daily'` | `'יומי'` |
| `freq_weekly` | `'Weekly'` | `'שבועי'` |
| `freq_monthly` | `'Monthly'` | `'חודשי'` |
| `freq_quarterly` | `'Quarterly'` | `'רבעוני'` |

Replace line 212 with: `value={t(`freq_${contact.interactionFrequency}` as any)}`
**Priority:** Medium — these are visible on every contact detail page; Hebrew users see English urgency/frequency text in a screen they visit for every contact interaction.

---

### FINDING 21 — ContactCard: `<div onClick>` is keyboard-inaccessible (WCAG 2.1.1 / 4.1.2); FAB `aria-label` hardcoded in English
**Files:**
- `src/components/ContactCard.tsx` (line 40–49)
- `src/screens/ContactsScreen.tsx` (line 201)

**Problem A — non-interactive element used as button (ContactCard.tsx line 40–49):**
```tsx
<div
  className={`card card-interactive ...`}
  onClick={handleClick}
>
```
The card root is a `<div>` with an `onClick` but no `role="button"`, no `tabIndex={0}`, and no `onKeyDown` handler. This means:
- Keyboard users cannot Tab to a contact card
- Pressing Enter/Space on a focused card does nothing
- Screen readers do not announce the element as interactive
This violates WCAG 2.1 SC 2.1.1 (Keyboard) and SC 4.1.2 (Name, Role, Value). With 20+ contacts in a list, this is the primary navigation method for assistive tech users and keyboard-only users on the Contacts screen.

**Problem B — FAB `aria-label` hardcoded (ContactsScreen.tsx line 201):**
```tsx
aria-label="Add contact"
```
The FAB (floating action button) for adding contacts has a hardcoded English `aria-label`. Hebrew screen-reader users hear "Add contact" in English rather than the localized equivalent. The key `add` already exists in i18n (`'Add'` / `'הוסף'`), and `contacts_addFirst` (`'Add your first contact'`) also exists.

**Fix A:** Change the root `<div>` to a semantic `<button>` element (preferred), or add `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler:
```tsx
onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }}
```
Using a `<button>` element is cleaner — it gets focus, keyboard, and ARIA semantics for free. Apply `className="..." style={{...}} onClick={handleClick}` to the `<button>` element directly.

**Fix B:** Replace the hardcoded string with a translated value:
```tsx
aria-label={t('contacts_addFirst')}
```
or add a dedicated key `contacts_addContact` / `'Add contact'` / `'הוסף איש קשר'`.
**Priority:** Medium-High (WCAG violation affects all keyboard/screen-reader users; the ContactCard issue affects the primary list view used on every session).

---

## NEW — priority improvements (iteration 6)

### FINDING 16 — scoringSystem.ts: `calculateRelationshipScore` called on every render with no memoization; iterates full ~820-entry HOLIDAYS array per contact
**File:** `src/core/scoringSystem.ts` (lines 118–165), `src/context/AppContext.tsx`
**Performance problem:** `calculateRelationshipScore(contact, holidays)` is called for every contact on every render. Inside it, `getUpcomingHolidaysForContact` (line 40–48) runs `holidays.filter(...)` over the entire HOLIDAYS array (~820 entries as of current data). With 50 contacts this is 41,000 iterations per render cycle. Combined with the AppContext double-render (Finding 2/7), every contact mutation triggers ~82,000 iterations for nothing.
**Correctness problem — DST edge case in `getBirthdayDaysUntil` (lines 50–59):** The function computes `Math.floor((thisYear.getTime() - today.getTime()) / 86_400_000)`. On the day clocks spring forward (lose 1 hour), `thisYear` is constructed with `new Date(year, month, day)` using local midnight, but `today` is `new Date()` (current moment). If it is currently, say, 11:30 PM on a spring-forward night, the gap to the next midnight is only 30 minutes in wall time but 90 minutes in UTC — the floor division can return -1 for a birthday that is actually "today", causing the birthday action to be silently skipped.
**Fix (performance):** Memoize `sortByScore` results in `AppContext` using `useMemo([contacts, HOLIDAYS])` — HOLIDAYS is a static constant so this effectively memoizes by contacts identity. Individual scores can be further cached with a `Map<contactId, { score, lastModified }>` keyed to `contact.lastContactDate`, so unchanged contacts are never re-scored.
**Fix (correctness):** Replace the raw ms division with date-fns `differenceInCalendarDays(thisYear, startOfDay(today))` which compares calendar dates independent of DST offsets.
**Impact:** Medium-High performance (compounds with Finding 2/7 double-render), Low-Medium correctness (DST bug is rare but silently drops birthday reminders on 2 days/year).

---

### FINDING 17 — `key={i}` (array-index key) used for mutable lists in 2 screens; stable-array uses are fine but 3 sites are genuine bugs
**Files:**
- `src/screens/premium/ImportContactsScreen.tsx` line 281: `key={i}` on CSV preview table rows — rows come from user-uploaded file data (`preview.rows`), items can be filtered/reordered. Index keys cause React to mis-reconcile rows when the array changes, silently producing stale cell content in the preview table.
- `src/screens/premium/ImportContactsScreen.tsx` line 366: `key={i}` on import error list items — `result.errors` is a string array derived from CSV parsing; index keys here mean if errors are re-generated (user re-imports) React may reuse DOM nodes with old text.
- `src/screens/CalendarScreen.tsx` line 172: `key={i}` on holiday color dots rendered inside each calendar day cell — `dayHolidays` is a filtered subset that changes whenever the user navigates months. Index keys cause dot colors to flicker/bleed across days when months change.
**Safe uses (not bugs):** `['S','M','T','W','T','F','S'].map((d, i) => <div key={i}>` (line 134) and `OnboardingScreen` slide array — these are static, never-reordered arrays where index keys are harmless.
**Fix:**
- `ImportContactsScreen` rows: use `key={i}-${row[preview.headers[0]] ?? i}` or (better) add a stable row index from the parsed CSV object.
- `ImportContactsScreen` errors: use `key={e}` (error string is unique enough) or `key={`err-${i}-${e.slice(0,20)}`}`.
- `CalendarScreen` dots: use `key={h.id}` — the holiday object already has a stable `id` field.
**Impact:** Low-Medium — the ImportContactsScreen issues affect a premium-only workflow; the CalendarScreen dot flicker is visible to all users on month navigation.

---

### FINDING 18 — `App.tsx`: `isOnboardingDone()` called on every `AppShell` render; `DashboardScreen` and `BottomNav` not wrapped in `Suspense` boundary
**File:** `src/App.tsx` (line 65)
**Problem A — `isOnboardingDone()` on every render:** Line 65 is inside `AppShell`'s JSX return value:
```tsx
<Route path="/" element={<Navigate to={isOnboardingDone() ? '/dashboard' : '/onboarding'} replace />} />
```
`isOnboardingDone()` calls `localStorage.getItem(...)` synchronously. This means every render of `AppShell` (triggered by any AppContext state change) calls `localStorage` — even though the onboarding flag never changes after first launch. On mobile PWA this is a synchronous I/O call on the main thread on every contact mutation.
**Fix:** Hoist the call above `AppShell` with `useMemo` or a module-level constant — since it only needs to be read once at app startup:
```tsx
// At module level or in App():
const onboardingDone = isOnboardingDone()
// In AppShell props or via a stable ref passed down:
<Route path="/" element={<Navigate to={onboardingDone ? '/dashboard' : '/onboarding'} replace />} />
```
**Problem B — `Suspense` gap (relates to Finding 8/15):** When `React.lazy` is applied (Finding 8), the `<Routes>` must be wrapped in `<Suspense>`. However, `BottomNav` sits inside `WithNav` which is a sibling of the lazy screen — meaning a suspended screen will also suspend `BottomNav` if the Suspense boundary wraps both. The correct placement is to wrap only the screen slot, not `WithNav` itself:
```tsx
function WithNav({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <main className="app-main">
        <Suspense fallback={<div className="screen-container" />}>
          {children}
        </Suspense>
      </main>
      <BottomNav />  {/* stays visible during screen load */}
    </div>
  )
}
```
**Impact:** Problem A: Low-Medium (localStorage is fast but synchronous on main thread; unnecessary on every render). Problem B: Medium UX — without this fix, lazy-loading screens would cause the bottom nav to disappear during navigation transitions.

---

## NEW — priority improvements (iteration 5)

### FINDING 13 — GreetingEditorScreen: exact i18n keys required to eliminate `labelHe` hack and all hardcoded strings `[IN PROGRESS — Agent 1 this iteration]`
**File:** `src/screens/GreetingEditorScreen.tsx`
**Confirmed hardcoded strings (full audit of current file):**
- Line 195: `'Greeting Tier'` — section heading
- Line 222: `{isHebrew ? tier.labelHe : tier.label}` — tier button label (2 strings per tier, repeated for activeTier at line 310)
- Line 224: `tier.desc` — 3 English description strings in `TIERS` constant (`'Warm & personal'`, `'Polished & clear'`, `'Elevated & bespoke'`)
- Line 263: `'Advanced tone options'` — toggle button text
- Line 310: `{isHebrew ? activeTier.labelHe : activeTier.label} Greeting` — editor header (also embeds hardcoded word `'Greeting'`)
- Line 314: `` `· for ${selectedContact.name.split(' ')[0]}` `` — hardcoded preposition `'for'`
- Line 352: `'Hide signature'` / `'Add signature'` — toggle text
- Line 363: `'Your name or signature...'` — input placeholder
- Line 377: `'Live Preview'` — section heading

**Exact new i18n keys needed (none of these exist in index.ts):**

| Key | en value | he value |
|---|---|---|
| `greeting_tier_section` | `'Greeting Tier'` | `'רמת ברכה'` |
| `greeting_tier_casual` | `'Casual'` | `'ידידותי'` |
| `greeting_tier_casual_desc` | `'Warm & personal'` | `'חם ואישי'` |
| `greeting_tier_professional` | `'Professional'` | `'מקצועי'` |
| `greeting_tier_professional_desc` | `'Polished & clear'` | `'מלוטש וברור'` |
| `greeting_tier_vip_desc` | `'Elevated & bespoke'` | `'מרומם ומותאם'` |
| `greeting_advanced` | `'Advanced tone options'` | `'אפשרויות טון מתקדמות'` |
| `greeting_header_label` | `'Greeting'` | `'ברכה'` |
| `greeting_for` | `'for'` | `'עבור'` |
| `greeting_hide_sig` | `'Hide signature'` | `'הסתר חתימה'` |
| `greeting_add_sig` | `'Add signature'` | `'הוסף חתימה'` |
| `greeting_sig_placeholder` | `'Your name or signature...'` | `'שמך או חתימתך...'` |
| `greeting_live_preview` | `'Live Preview'` | `'תצוגה מקדימה'` |

**VIP label reuses existing key path; `labelHe: 'VIP'` equals `label: 'VIP'` — no new key for VIP name, only `greeting_tier_vip_desc`.**

**Fix summary:** Drop `labelHe` from `Tier` interface entirely. Convert `TIERS` constant to a `getTiers(t)` function returning the array with `label: t('greeting_tier_casual')` etc. Replace all 9 hardcoded string sites with `t(key)` calls. Total: 13 new keys, 0 existing keys changed.
**Impact:** High for Hebrew users — the most-used action screen is currently a mix of Hebrew UI chrome and English tier labels, descriptions, and button text. This is the single highest-density remaining i18n gap after DashboardScreen.

---

### FINDING 14 — App.tsx: no error boundary anywhere; uncaught render error crashes entire app to blank screen
**Files:** `src/App.tsx` (line 71–83), `src/main.tsx` (line 6–10)
**Problem:** Neither `App.tsx` nor `main.tsx` wraps any subtree in an error boundary. There is no `ErrorBoundary` component anywhere in the codebase. If any screen throws during render (e.g., a corrupted contact object reaching `ContactDetailScreen`, or a `null` holiday ID reaching `HolidayDetailScreen`), React will unmount the entire tree and show a blank white screen with no user-facing message or recovery option.

This is especially relevant given:
- Finding in pending items: `storageService.ts` uses `JSON.parse` without try/catch — a corrupted localStorage value can cause a thrown exception that propagates up through AppContext into the entire tree
- `GreetingEditorScreen` accesses `selectedContact.name.split(...)` — if `selectedContact` becomes undefined mid-render (e.g., contact deleted while editor is open), this throws

**Fix:** Add a minimal error boundary class component to `src/components/ErrorBoundary.tsx`:
```tsx
class ErrorBoundary extends React.Component<{children: ReactNode}, {hasError: boolean}> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) return <ErrorScreen onReset={() => this.setState({ hasError: false })} />
    return this.props.children
  }
}
```
Wrap `<AppShell />` in `App.tsx` with this boundary. Optionally add a second boundary around the route content inside `WithNav` to allow recovery without losing the nav bar.
**Impact:** High for reliability — currently any unhandled render error causes a permanent blank screen that requires the user to manually clear the app. On mobile PWA (Capacitor target) there is no browser reload button; the user must close and reopen the app.

---

### FINDING 15 — App.tsx: `React.lazy` safe targets and `ContactCard` React.memo readiness
**File:** `src/App.tsx` (lines 10–28), `src/components/ContactCard.tsx`

**Lazy-loading — safe targets (screens with no cross-route shared state that must be synchronously available):**

All screens EXCEPT `DashboardScreen` and `OnboardingScreen` are safe to lazy-load. Exact changes needed:

```ts
// Replace lines 10–27 static imports in App.tsx with:
import { lazy, Suspense } from 'react'
const OnboardingScreen = lazy(() => import('@/screens/OnboardingScreen').then(m => ({ default: m.OnboardingScreen })))
const DashboardScreen = lazy(() => import('@/screens/DashboardScreen').then(m => ({ default: m.DashboardScreen })))  // keep eager or lazy — it IS the landing screen
const CalendarScreen = lazy(() => import('@/screens/CalendarScreen').then(m => ({ default: m.CalendarScreen })))
const HolidayDetailScreen = lazy(() => import('@/screens/HolidayDetailScreen').then(m => ({ default: m.HolidayDetailScreen })))
const ContactsScreen = lazy(() => import('@/screens/ContactsScreen').then(m => ({ default: m.ContactsScreen })))
const ContactDetailScreen = lazy(() => import('@/screens/ContactDetailScreen').then(m => ({ default: m.ContactDetailScreen })))
const ContactFormScreen = lazy(() => import('@/screens/ContactFormScreen').then(m => ({ default: m.ContactFormScreen })))
const GreetingEditorScreen = lazy(() => import('@/screens/GreetingEditorScreen').then(m => ({ default: m.GreetingEditorScreen })))
const GroupsScreen = lazy(() => import('@/screens/GroupsScreen').then(m => ({ default: m.GroupsScreen })))
const SettingsScreen = lazy(() => import('@/screens/SettingsScreen').then(m => ({ default: m.SettingsScreen })))
const UpgradeScreen = lazy(() => import('@/screens/UpgradeScreen').then(m => ({ default: m.UpgradeScreen })))
const AboutScreen = lazy(() => import('@/screens/AboutScreen').then(m => ({ default: m.AboutScreen })))
const PrivacyScreen = lazy(() => import('@/screens/PrivacyScreen').then(m => ({ default: m.PrivacyScreen })))
const TermsScreen = lazy(() => import('@/screens/TermsScreen').then(m => ({ default: m.TermsScreen })))
const WhatsNewScreen = lazy(() => import('@/screens/WhatsNewScreen').then(m => ({ default: m.WhatsNewScreen })))
const ImportContactsScreen = lazy(() => import('@/screens/premium/ImportContactsScreen').then(m => ({ default: m.ImportContactsScreen })))
const BirthdayCenterScreen = lazy(() => import('@/screens/premium/BirthdayCenterScreen').then(m => ({ default: m.BirthdayCenterScreen })))
const BirthdayGreetingEditorScreen = lazy(() => import('@/screens/premium/BirthdayGreetingEditorScreen').then(m => ({ default: m.BirthdayGreetingEditorScreen })))
```
Then in `AppShell`, wrap `<Routes>` with:
```tsx
<Suspense fallback={<div className="screen-container" />}>
  <Routes>...</Routes>
</Suspense>
```
**Priority lazy targets** (highest JS weight): `GreetingEditorScreen` (pulls in `greetingService` with ~300-line inline data), `ImportContactsScreen` (CSV parsing), `BirthdayCenterScreen`, `BirthdayGreetingEditorScreen` (premium screens most users never load), `OnboardingScreen` (one-time use).

Note: all 18 current imports use named exports (not default exports), so the `.then(m => ({ default: m.ScreenName }))` re-export pattern is required for `React.lazy`.

**ContactCard React.memo readiness:**
ContactCard is NOT yet fully ready for `React.memo` to be effective, despite the useCallback fixes, because:
1. The `style` prop passed to ContactCard (if any parent passes inline style objects) will always be a new object reference — but ContactCard does not accept a `style` prop, so this is not an issue here.
2. The real blocker: `contacts` array from `useApp()` is re-created on every AppContext render (Finding 1 / Finding 7 still unresolved). `ContactsScreen` maps over `contacts` and passes each contact object as a prop. If `contacts` is a new array reference each render but the individual contact objects are the same references (they come from `JSON.parse` in storage — they are NOT the same references), then every contact prop fails `===` comparison and `React.memo` busts on every parent render.
3. `onClick` prop: if the parent passes an inline `() => navigate(...)` (Finding 6 pattern), that new function reference also busts memo. This is fixable with `useCallback` in the parent.

**Verdict:** Apply `React.memo` now — it will help in cases where the parent does NOT re-render. But memo will not be fully effective until (a) Finding 1/7 (AppContext double-render) is fixed AND (b) contact objects are stabilized by identity (e.g., via a `Map` keyed by id rather than re-parsing from storage each render). Tag as a partial win until those fixes land.
**Impact:** Medium now, High after AppContext stabilization.

---

## NEW — priority improvements (iteration 4)

### FINDING 10 — HolidayCard.tsx: all 4 hardcoded badge strings map to EXISTING i18n keys; zero new keys needed `[IN PROGRESS — Agent 1 this iteration]`
**File:** `src/components/HolidayCard.tsx` (lines 26, 98)
**Problem:** Finding 9 (iteration 3) correctly identified the 4 hardcoded strings. Deeper audit of `src/i18n/index.ts` confirms all 4 map directly to keys that **already exist** in both `en` and `he` locales — no new keys need to be added to `index.ts`:

| Hardcoded string | Existing key | en value | he value |
|---|---|---|---|
| `'🎉 Today!'` (×2) | `today` | `'Today'` | `'היום'` |
| `'Tomorrow'` | `tomorrow` | `'Tomorrow'` | `'מחר'` |
| `'Passed'` | `calendar_passed` | `'Passed'` | `'עבר'` |
| `` `${daysUntil}d` `` | `days` | `'d'` | `'י׳'` |

**Fix:** Add `useT()` import and replace the 4 literals:
- Line 26: `daysUntil === 0 ? \`🎉 \${t('today')}!\` : daysUntil === 1 ? t('tomorrow') : \`\${daysUntil}\${t('days')}\``
- Line 98: `daysUntil === 0 ? \`🎉 \${t('today')}!\` : daysUntil < 0 ? t('calendar_passed') : \`\${daysUntil}\${t('days')}\``

This is the smallest-possible fix: one new import, four substitutions, zero schema changes.
**Impact:** Medium-High — HolidayCard renders on both Dashboard and Calendar; Hebrew users currently see English badge text on every holiday card. The `days` key already produces the correct Hebrew suffix `י׳`.

---

### FINDING 11 — GreetingEditorScreen: `labelHe` hack scope is wider than noted; also has 3 additional hardcoded English strings
**File:** `src/screens/GreetingEditorScreen.tsx`
**Scope of `labelHe` usage (2 sites, not 1):**
- Line 222 (tier selector buttons): `{isHebrew ? tier.labelHe : tier.label}`
- Line 310 (message editor header): `{isHebrew ? activeTier.labelHe : activeTier.label} Greeting`

**Additional hardcoded English strings not yet in i18n (3 more):**
- Line 195: `'Greeting Tier'` — section heading, completely outside `t()`
- Line 263: `'Advanced tone options'` — toggle button label
- Line 314: `` `· for ${selectedContact.name.split(' ')[0]}` `` — attribution line in editor header (not a string to translate per se, but uses a hardcoded preposition `for`)
- Line 351: `'Hide signature'` / `'Add signature'` toggle text
- Line 363: `'Your name or signature...'` placeholder

**Fix:** Drop the `labelHe` field from the `Tier` interface entirely. Add 2 new i18n keys:
```ts
greeting_tier_casual / greeting_tier_professional / greeting_tier_vip  // replaces label + labelHe
greeting_tier_section  // 'Greeting Tier' / 'רמת ברכה'
greeting_advanced      // 'Advanced tone options' / 'אפשרויות טון מתקדמות'
greeting_hide_sig / greeting_add_sig  // signature toggle
greeting_for           // 'for' / 'עבור'
```
The `desc` field (`'Warm & personal'`, `'Polished & clear'`, `'Elevated & bespoke'`) also needs Hebrew equivalents — currently always shown in English regardless of language setting.
**Impact:** Medium — GreetingEditorScreen is the core action screen; Hebrew users see English labels on the most prominent tier-selection UI and in the editor header on every generated message.

---

### FINDING 12 — Missing `aria-label` on 5 icon-only interactive buttons across 2 high-traffic screens
**Files:**
- `src/screens/ContactDetailScreen.tsx` line 77–82: Edit icon `<button>` in `PageHeader right={}` — renders an `<Edit size={16}>` icon with no `aria-label`. Screen readers announce "button" with no context.
- `src/screens/GreetingEditorScreen.tsx`:
  - Line 319–325: Regenerate button — has `title={t('greeting_regenerate')}` but no `aria-label`; `title` is not read by most mobile screen readers.
  - Line 326–334: Copy icon button — no `aria-label` and no `title`.
  - Line 255–258: "Advanced tone options" toggle `<button>` — has visible text but the `<ChevronDown>` icon inside has no `aria-label`; the button itself is fine but the collapsed state is not announced.
  - Line 347–352: Show/hide signature toggle `<button>` — no `aria-label`; text is conditional but works; the `<Pen size={11}>` icon has no label.

**Pattern:** Icon-only or icon+text buttons in `GreetingEditorScreen` consistently omit `aria-label`. The existing `title` attribute on the regenerate button is insufficient for mobile assistive tech (VoiceOver/TalkBack do not announce `title` on touch targets).
**Fix:** Add `aria-label={t('greeting_regenerate')}` to the regenerate button, `aria-label={t('greeting_copy')}` to the copy button, and `aria-label={t('edit')}` to the ContactDetailScreen edit button. Also add `aria-expanded={showAdvanced}` to the advanced-toggle button and `aria-expanded={showSignature}` to the signature-toggle button.
**Impact:** Medium — affects screen-reader users on the two most-used interaction screens. The ContactDetailScreen edit button is particularly problematic as it is the only way to reach `ContactFormScreen` from the detail view.

---

## NEW — priority improvements (iteration 3)

### FINDING 7 — AppContext: `refreshDashboard` + `useEffect` double-render still live; `useMemo` fix not yet applied `[IN PROGRESS — Agent 1 this iteration]`
**File:** `src/context/AppContext.tsx` (lines 55–68)
**Problem:** The `contextValue` is already memoized with `useMemo` (line 125), which is good — but the double-render cycle documented in Finding 2 is **still present and not fixed**. The `dashboardData` is stored as a separate `useState` (line 55–57), and `refreshDashboard` is a `useCallback([contacts])` (lines 64–66) that calls `setDashboardData`. The `useEffect([refreshDashboard])` on line 68 then fires on every `contacts` change, causing a second render via `setDashboardData`. Because `dashboardData` sits in the `useMemo` dependency array (line 141), that second render also busts the memoized context value, meaning **every contact mutation still forces two full context-tree re-renders**, even though `contextValue` is wrapped in `useMemo`.
**Fix:** Delete the `dashboardData` useState, the `refreshDashboard` useCallback, and the `useEffect`. Replace with:
```ts
const dashboardData = useMemo(() => buildDashboardData(contacts, HOLIDAYS), [contacts])
```
Then remove `dashboardData` and `refreshDashboard` from the `useMemo([...deps])` array and update `AppContextValue` — `refreshDashboard` can be a no-op stub or removed from the interface. The `RefreshCw` button in `DashboardScreen` (line 61) calls `refreshDashboard` directly; with `useMemo` it can force a re-render by toggling a cheap `refreshKey` counter instead.
**Impact:** High — halves render count on every contact add/update/delete. Also removes the `refreshDashboard` prop from the public context API, simplifying all consumers.

### FINDING 8 — App.tsx: all 18 screen imports are eager; no route-level code-splitting
**File:** `src/App.tsx` (lines 10–28)
**Problem:** All 18 screens are imported statically at the top of `App.tsx`. Vite bundles them into a single JavaScript chunk that the browser must parse before the app can render. Several screens are heavy:
- `GreetingEditorScreen` includes `greetingService.ts` which embeds ~300 lines of HOLIDAY_SPECIFIC_BODIES inline (noted in pending items)
- `ImportContactsScreen` includes CSV parsing logic
- `BirthdayCenterScreen` and `BirthdayGreetingEditorScreen` are premium-only (most users never see them)
- `OnboardingScreen` is shown only once per device lifetime

None of these screens use `React.lazy()` and there is no `<Suspense>` boundary anywhere in `App.tsx` or `main.tsx`. Every user pays the parse cost for all 18 screens on first load.
**Fix:** Wrap all non-critical screens (everything except `DashboardScreen` and `OnboardingScreen`) in `React.lazy()`:
```ts
const GreetingEditorScreen = React.lazy(() => import('@/screens/GreetingEditorScreen'))
const ImportContactsScreen = React.lazy(() => import('@/screens/premium/ImportContactsScreen'))
// ...etc
```
Then wrap the `<Routes>` block in `<Suspense fallback={<div className="screen-container" />}>`. Priority targets are the 3 premium screens and `GreetingEditorScreen` — these alone likely represent 40%+ of JS weight for free-tier users who never access them.
**Impact:** High for initial load time — reduces time-to-interactive, especially on mid-range Android devices that are the primary target for a mobile CRM.

### FINDING 9 — HolidayCard.tsx and GreetingEditorScreen.tsx: hardcoded i18n strings + HolidayCard missing `useT()`
**Files:**
- `src/components/HolidayCard.tsx` (lines 26, 98) — no `useT()` import at all
- `src/screens/GreetingEditorScreen.tsx` (lines 30–53) — `TIERS` array has `label`/`desc` fields with hardcoded English strings, bypassing `t()`

**HolidayCard problems (line 26, 98):**
- `badgeText` is assembled with hardcoded English: `'🎉 Today!'`, `'Tomorrow'`, `'${daysUntil}d'`
- Full-card mode (line 98): `'🎉 Today!'`, `'Passed'` are hardcoded
- The component never imports or calls `useT()` — it is completely unlocalized despite being rendered on the main Dashboard and Calendar screens

**GreetingEditorScreen problems:**
- `TIERS` (lines 28–53) is a module-level constant with `label: 'Casual'`, `label: 'Professional'`, `label: 'VIP'` and `desc: 'Warm & personal'`, etc. — these strings are hardcoded English that Hebrew users will always see in English regardless of language setting. The `labelHe` field is a manual workaround that duplicates the translation system rather than using `t()`.

**Fix for HolidayCard:** Add `useT()` import and replace the 4 hardcoded strings with translation keys (`holiday_today` already exists in i18n, `today` and `tomorrow` keys also exist — reuse them). Add `calendar_passed` key usage (already in i18n at line 66 of index.ts).
**Fix for GreetingEditorScreen:** Convert `TIERS` from a module-level constant to a function that takes `t` and returns the localized array, or add new i18n keys (`greeting_tier_casual`, `greeting_tier_professional`, etc.) and drop the manual `labelHe` field.
**Impact:** Medium-High — HolidayCard appears on both Dashboard and Calendar; Hebrew users see English badge labels on every holiday card they encounter.

---

## NEW — priority improvements (iteration 2)

### FINDING 4 — Copy-paste duplication: `getAvatarGradient` + `getInitials` defined in 6 separate files `[IN PROGRESS — Agent 1 this iteration]`
**Files:**
- `src/components/ContactCard.tsx` (lines 12, 29) — canonical definition
- `src/screens/DashboardScreen.tsx` (lines 21, 27) — duplicate (slightly different `AVATAR_GRADIENTS` array length: 8 pairs vs 10 in ContactCard)
- `src/screens/ContactDetailScreen.tsx` (line 30) — duplicate
- `src/screens/ContactFormScreen.tsx` (lines 34, 41) — duplicate
- `src/screens/HolidayDetailScreen.tsx` (lines 16, 21) — duplicate
- `src/screens/premium/BirthdayCenterScreen.tsx` (lines 17, 22) — duplicate
- `src/screens/premium/BirthdayGreetingEditorScreen.tsx` (lines 21, 26) — duplicate

**Problem:** Both utility functions are copy-pasted verbatim (with minor variations) across 6+ files. `DashboardScreen` uses only 8 gradient pairs while `ContactCard` uses 10 — so the same contact name produces **different avatar colors** depending on which screen renders it. This is a silent visual inconsistency bug, not just dead code.
**Fix:** Extract both functions (and the `AVATAR_GRADIENTS` constant) into `src/utils/avatarUtils.ts`. Replace all 6+ local definitions with a single named import. The canonical 10-pair version from `ContactCard` should be the one kept.
**Impact:** High — eliminates a real visual inconsistency bug, reduces ~60 lines of duplicated code, and ensures a contact's avatar color is stable across every screen.

### FINDING 5 — i18n: DashboardScreen has 8+ hardcoded English strings that bypass `t()`
**File:** `src/screens/DashboardScreen.tsx`
**Hardcoded strings (all missing from translation system):**
- Line 120: `"Today's Highlights"` (section heading)
- Line 134: `"{holiday.name} is Today!"` (holiday highlight card title)
- Line 135: `"Tap to send greetings to your contacts"` (holiday highlight card subtitle)
- Line 151: `"{contact.name}'s Birthday! 🎉"` (birthday card title)
- Line 152: `"Don't forget to send a birthday wish!"` (birthday card subtitle)
- Line 239: `label: 'Add Contact'` (EmptyState action button)
- Line 298: `"{tomorrowHoliday.name} is Tomorrow!"` (tomorrow banner title)
- Line 300: `"Prepare your greetings now"` (tomorrow banner subtitle)
- Line 108: `` ` in ${daysToNext} days` `` (hero banner countdown — also embeds a number mid-string making it unpluralisable in Hebrew)

**Problem:** The app uses a full `t()` i18n system via `LanguageContext`, but DashboardScreen — the first screen every user sees — has the highest density of untranslated strings in the codebase. Hebrew users see English across the entire Today's Highlights section and all holiday banners.
**Fix:** Add translation keys (e.g. `dashboard_todaysHighlights`, `dashboard_holidayToday`, `dashboard_tapToSend`, `dashboard_birthdayTitle`, `dashboard_birthdayReminder`, `dashboard_addContact`, `dashboard_holidayTomorrow`, `dashboard_prepareGreetings`, `dashboard_inNDays`) to both `en` and `he` locale files, then replace all literals with `t(key, { name, n })` calls.
**Impact:** High for Hebrew users — the main screen is entirely untranslated in several sections. Also blocks RTL layout correctness (Hebrew punctuation direction is wrong inside English strings).

### FINDING 6 — DashboardScreen: 7 inline `() => navigate(...)` arrow functions in JSX with no `useCallback`
**File:** `src/screens/DashboardScreen.tsx`
**Lines:** 69, 130, 147, 169, 193, 293, 310
**Problem:** Every render of `DashboardScreen` allocates 7 new function objects for navigation handlers. More importantly, 3 of these (`/calendar/${todayHoliday.id}`, `/contacts/${contact.id}`, `/calendar/${tomorrowHoliday.id}`) are inside list `.map()` callbacks or conditionally-rendered sections, so they are re-created on every parent re-render. When combined with the AppContext re-render issue (Finding 1), these fire on every contact mutation even though no navigation-related state changed.
**Fix:** Hoist stable routes to `useCallback` at the component top level. For list-item handlers (today's birthday contacts, tomorrow holiday), move the handler into the child component or pass a stable `id`-based callback. The FAB handler on line 310 is the simplest win: `const handleAddContact = useCallback(() => navigate('/contacts/new'), [navigate])`.
**Impact:** Medium — compounds with Finding 1's re-render storm; also prevents potential stale-closure issues if `navigate` reference ever becomes unstable.

---

## Priority improvements from iteration 1

### FINDING 1 — AppContext: monolithic context causes whole-tree re-renders on every state change `[IN PROGRESS — Agent 1 this iteration]`
**File:** `src/context/AppContext.tsx` (line 125–138)
**Problem:** The `<AppContext.Provider value={{ ... }}>` object literal is constructed inline every render. Every time *any* piece of state changes (e.g., a single contact update), all consumers of `useApp()` re-render — even components that only care about `settings` or `premium`. There is no context splitting or selector pattern.
**Fix:** Split AppContext into at least 3 narrower contexts (`ContactsContext`, `SettingsContext`, `UIContext`), or keep one context but memoize the value object with `useMemo` keyed to each individual state slice. Consumers that only read `settings` will then be immune to contact mutations.
**Impact:** High — affects every screen; ContactCard list, Dashboard, and BottomNav all re-render on unrelated state changes.

### FINDING 2 — AppContext: double-render cycle on every contact mutation
**File:** `src/context/AppContext.tsx` (lines 64–68)
**Problem:** `refreshDashboard` is wrapped in `useCallback([contacts])`, so it gets a new reference every time `contacts` changes. The `useEffect([refreshDashboard])` then fires again, calling `setDashboardData`, which triggers a *second* render for every contact add/update/delete. Net cost: every mutation causes 2 full re-renders of the entire context tree instead of 1.
**Fix:** Remove the `useEffect` + `refreshDashboard` pattern entirely. Instead derive dashboard data inline with `useMemo`: `const dashboardData = useMemo(() => buildDashboardData(contacts, HOLIDAYS), [contacts])`. This collapses two renders into one and eliminates the stale-closure risk.
**Impact:** High — halves render count for the most common user action (contact operations).

### FINDING 3 — ContactCard: unstable `handleClick` + unguarded `getAvatarGradient` recalculation on every render
**File:** `src/components/ContactCard.tsx` (lines 37, 29–33)
**Problem A:** `const handleClick = onClick ?? (() => navigate(...))` creates a new function reference on every render with no `useCallback`. In a contacts list of 20+ cards, this means 20+ new function allocations per parent re-render.
**Problem B:** `getAvatarGradient(contact.name)` runs a `.reduce()` character hash on every render. Because ContactCard is not memoized (already noted for `React.memo`), even a parent scroll-state update causes this computation to repeat for every visible card.
**Fix A:** Wrap `handleClick` in `useCallback([onClick, contact.id, navigate])`.
**Fix B:** Move the hash computation inside `useMemo([contact.name])` or precompute it once in `getInitials`/`getAvatarGradient` and cache via a module-level `Map<string, string>`.
**Impact:** Medium-High — multiplied by list length; compounds once `React.memo` is added (the memo will short-circuit rendering but the callback instability can still bust it if passed as a prop).

---

## Pending improvements to hand to Agent 1

### React / TypeScript
- Use `React.memo` on ContactCard, HolidayCard — they re-render on every parent state change
- Move heavy `useMemo` arrays (scoredContacts, upcomingHolidays) out of render into custom hooks
- Replace raw `localStorage` calls in services with a typed wrapper that validates schema on read

### Mobile UX
- Bottom nav active indicator should use `transform: translateX` animation (hardware-accelerated) instead of re-rendering
- Tap targets must be ≥ 48×48 px (WCAG 2.5.5) — some icon-only buttons in ContactDetailScreen are ~36px
- Pull-to-refresh pattern missing on Dashboard (common expectation in mobile CRM apps)
- Haptic feedback not wired up via Capacitor's Haptics plugin on key actions (save contact, send greeting)

### Accessibility
- Color contrast: score bar fill may fail 3:1 against light backgrounds in some themes
- Missing `aria-label` on FAB buttons (screen readers say "button")
- Modal focus trap incomplete — Tab can escape to background

### Performance
- `date-fns` imported as `import * as dateFns` in some places — should use named imports for tree-shaking
- LottieAnimation loads JSON file synchronously; should use React.lazy + Suspense
- scoringSystem.ts recalculates on every call; memoize by contact ID + last-modified timestamp

### Code Quality
- `storageService.ts` uses `JSON.parse` without try/catch — will throw on corrupted localStorage **[IN PROGRESS — Agent 1 this iteration]**
- `greetingService.ts` HOLIDAY_SPECIFIC_BODIES is ~300 lines of inline data; move to `src/data/greetingTemplates.ts`
- Several screens import `useNavigate` but never use it (dead import) — NOTE: re-checked iteration 4, all `useNavigate` imports in screens ARE used. This item can be closed.
