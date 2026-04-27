# NeverMiss — Feature Map
_Last updated: 2026-04-27 | Auto-maintained by Agent Loop_

> Intended for sharing with AI tools, designers, and collaborators for feedback and new feature ideas.
> Stack: React 19 · TypeScript · Vite 8 · Tailwind v4 · Capacitor 8 · localStorage (MVP)

---

## ✅ Completed Features

### Free Tier

#### Dashboard (`src/screens/DashboardScreen.tsx`)
- Welcome hero with decorative circles and gradient
- "Today's Highlights" section — today's holiday and birthday cards
- Priority contacts list (scored by relationship engine)
- Tomorrow's holiday preview card
- Stats cards with gradient icon circles
- Staggered list entrance animations
- Gradient FAB button (navigate to add contact)

#### Contacts (`src/screens/ContactsScreen.tsx`)
- Full contact list with search
- Filter chips: All / External / Internal / VIP
- Staggered card entrance animations
- FAB to add new contact

#### Contact Detail (`src/screens/ContactDetailScreen.tsx`)
- Full-width gradient profile banner
- SVG ring arc showing relationship score
- Contact info rows with icon badges
- Greeting action button (gradient)
- Related holidays list

#### Contact Form (`src/screens/ContactFormScreen.tsx`)
- Live gradient avatar preview (name-hashed)
- Auto gradient + solid color swatch options
- Section headers with colored gradient icon squares
- Premium section with amber border (locked fields)
- Auto-focus on name for new contacts
- Save bar with gradient fade

#### Calendar (`src/screens/CalendarScreen.tsx`)
- Monthly calendar with holiday dots
- Religion filter chips with religion-specific colors
- Gradient-tinted day cells for active/today
- Holiday list below calendar

#### Groups (`src/screens/GroupsScreen.tsx`)
- Group cards with left color border + gradient tint
- Gradient emoji circle (w-12 h-12)
- Contact/holiday count pills
- Create/edit group modal

#### Settings (`src/screens/SettingsScreen.tsx`)
- Language toggle (EN / HE) with sliding pill indicator
- Theme picker with 6 themes, active checkmark + glow ring
- Gradient icon squares on section headers
- Danger zone (red-tinted background)
- Premium gold/amber banner when active

#### About (`src/screens/AboutScreen.tsx`)
- Full gradient hero banner with floating 💌 emoji
- Core values with gradient icon circles
- Privacy facts with icon+pill layout

#### Privacy & Terms (`src/screens/PrivacyScreen.tsx`, `TermsScreen.tsx`)
- Full gradient hero banners
- Section icons with color-tinted badges
- Font-extrabold section titles

#### What's New (`src/screens/WhatsNewScreen.tsx`)
- Vertical timeline with animated gradient connector
- Version dots as gradient circles
- Change type badges with gradient backgrounds

#### Onboarding (`src/screens/OnboardingScreen.tsx`)
- 3-slide onboarding flow
- Gradient icon circles per slide with animate-float
- Progress dots with gradient active pill

---

### Premium Tier

#### Birthday Center (`src/screens/premium/BirthdayCenterScreen.tsx`)
- Birthday list with upcoming birthday tracking
- Days-until countdown
- Quick greeting button

#### Birthday Greeting Editor (`src/screens/premium/BirthdayGreetingEditorScreen.tsx`)
- Birthday-specific greeting templates
- Multi-language support

#### Import Contacts (`src/screens/premium/ImportContactsScreen.tsx`)
- CSV / Excel file upload
- Column mapping UI
- Preview table with error list
- Import result summary

---

### Components

#### ContactCard (`src/components/ContactCard.tsx`)
- Name-hashed gradient avatar (10-option palette)
- Urgency-tinted card background glow
- Score progress bar
- Staggered entrance animation
- Urgency badge as colored pill

#### HolidayCard (`src/components/HolidayCard.tsx`)
- Compact: gradient-tinted background + left color border
- Full: gradient color header strip, animate-float emoji
- **i18n: Today/Tomorrow/Passed/days labels fully localized** ✅

#### Navigation (`src/components/Navigation.tsx`)
- Bottom nav with gradient active pill
- Page header with font-extrabold
- Back button with active:scale-90, RTL-aware arrow flip

#### Modal (`src/components/ui/Modal.tsx`)
- Visible drag handle
- Backdrop blur(6px)
- danger prop for red title
- aria-labelledby for accessibility
- ESC key support

#### WhatsApp Button (`src/components/WhatsAppButton.tsx`)
- Authentic WhatsApp green gradient
- Green glow shadow
- Amber-tinted warning box in modal preview
- Fully i18n'd

#### EmptyState (`src/components/EmptyState.tsx`)
- Large gradient circle icon container
- animate-float icon
- Font-bold title

---

### Core Systems

#### Relationship Scoring (`src/core/scoringSystem.ts`)
- Time-decay penalty (days since last contact)
- Importance weighting (VIP / high / normal)
- Upcoming events weight (holidays, birthdays)
- Urgency levels: low / medium / high / critical
- Suggested actions per score

#### Greeting Engine (`src/services/greetingService.ts`)
- 4–7 tone variants per template
- HOLIDAY_SPECIFIC_BODIES lookup (rosh-hashana, yom-kippur, hanukkah, passover, eid-al-fitr, eid-al-adha, christmas)
- Authentic Hebrew Israeli casual voice (not translated English)
- VIP premium-letter quality templates
- Birthday greetings in 6 languages

#### i18n System (`src/i18n/index.ts`, `src/context/LanguageContext.tsx`)
- ~220+ translation keys
- `t(lang, key, vars?)` function with `{variable}` interpolation
- `useT()` hook (returns bound t fn)
- Persists to localStorage `nm_lang`
- Sets `document.dir = 'rtl'` on Hebrew

#### Theme System (`src/data/themes.ts`, `src/context/ThemeContext.tsx`)
- 6 themes: ocean, forest, sunset, purple, rose, midnight
- CSS custom properties on `:root`
- Runtime switching via ThemeContext
- All themes more vibrant (updated)

#### Storage Service (`src/services/storageService.ts`)
- Typed `get<T>` / `set` / `remove` helpers
- try/catch on all JSON.parse with console.warn ✅
- CRUD for contacts, groups, drafts, settings, premium

#### Greeting Media (`src/components/MediaAttachmentPicker.tsx`) ✅ _new — Premium_
- Image upload from device (FileReader → base64, 2MB guard)
- Voice recording up to 60 seconds (MediaRecorder API, auto-stop)
- Image thumbnail / audio player preview with remove button
- "Save to device" download link + WhatsApp attach-manually hint
- Premium-gated with Crown lock card for free users
- Integrated into GreetingEditorScreen and WhatsAppButton modal

#### Group Holiday Assignment ✅ _new — Premium_
- Holiday assignment section in group create/edit modal (searchable checkbox list)
- `group.holidayIds: string[]` stored and preserved across saves
- Dashboard "Coming up for your groups" alert section (14-day window)
- Alert cards with holiday emoji, days-until, group name, contact count, Send button

#### Coupon Code System ✅ _new_
- "Have a coupon?" collapsible section on Upgrade screen
- Auto-uppercase input, success/error feedback states
- Valid codes: `NEVERMISS1`, `WELCOME2025`, `ISRAEL30` → 1 month free Premium
- Used coupon tracking in localStorage (per-device reuse prevention)
- Auto-expiry: `checkAndExpirePremium()` on every app init
- "Premium active until [date]" in Settings screen (calendar icon)

#### Avatar Utils (`src/utils/avatarUtils.ts`) ✅ _new_
- Canonical `getInitials` + `getAvatarGradient`
- 10-option gradient palette (name-hashed)
- Module-level `Map<string, string>` cache
- Fixes visual bug: 5 files had 8 gradients (wrong) — all now 10

---

## 🚧 In Progress (current sprint)

_All recent features shipped. Agent loop resuming normal improvement iterations._

---

## 📋 Planned (not yet started)

### Performance
- **React.lazy code-splitting** — all 18 screens statically imported; premium screens (BirthdayCenter, BirthdayGreetingEditor, ImportContacts) should be lazy-loaded. Suspense boundary must go inside `WithNav` so bottom nav stays visible during loading.
- **ContactCard React.memo** — component is now ready after useCallback/useMemo fixes; needs `React.memo` wrapper
- **scoringSystem.ts memoization** — `calculateRelationshipScore` runs for every contact on every render; add per-contact `Map<id, score>` cache keyed by `updatedAt`
- **scoringSystem.ts DST bug** — `getBirthdayDaysUntil` uses raw ms division; should use `date-fns differenceInCalendarDays`

### Bug Fixes
- **`key={index}` anti-pattern** — `ImportContactsScreen` (CSV rows + error strings) and `CalendarScreen` (holiday color dots) use index as key, causing React mis-reconciliation on data changes
- **RELIGION_LABELS English-only** — HolidayCard renders religion name always in English regardless of locale; needs i18n lookup
- **`isOnboardingDone()` on every render** — App.tsx calls `localStorage.getItem` inside JSX return on every render; should be moved to `useMemo` with empty deps

### i18n Completeness
- **GreetingEditorScreen** — `desc` fields on Tiers (`'Warm & personal'`, `'Polished & clear'`, `'Elevated & bespoke'`) and signature placeholder still hardcoded English
- **DashboardScreen** — Several section labels / empty state strings not yet translated
- **UpgradeScreen** — FREE_FEATURES list items are hardcoded English strings

### Accessibility
- **Missing `aria-label`** on icon-only buttons in ContactDetailScreen (Edit) and GreetingEditorScreen (Regenerate, Copy, Advanced toggle, Signature toggle)
- **Missing `aria-expanded`** on Advanced tone options toggle and Signature toggle in GreetingEditorScreen
- **Modal focus trap** — Tab key can escape to background content

### UX / Mobile
- **Haptic feedback** — Capacitor Haptics plugin not wired up on key actions (save contact, send greeting, coupon success)
- **Pull-to-refresh** on Dashboard — common mobile CRM expectation
- **Tap target size** — some icon-only buttons are ~36px; WCAG 2.5.5 requires ≥ 48×48px
- **Refresh button on Dashboard** — now a no-op since dashboardData is derived via useMemo; should be removed or repurposed

### Architecture
- **Error boundary** — no top-level `<ErrorBoundary>` in App.tsx or main.tsx; unhandled render errors crash the whole app
- **Bundle size** — `date-fns` may have wildcard imports in some files; should use named imports for tree-shaking
- **greetingService.ts refactor** — `HOLIDAY_SPECIFIC_BODIES` (~300 lines) should move to `src/data/greetingTemplates.ts`

### Future Premium Ideas
- **Smart Reminders** — push notifications (Capacitor local notifications) for upcoming holidays with contacts assigned
- **Contact relationship map** — visual graph of relationships and shared holidays
- **AI greeting suggestions** — Claude API integration for personalized greeting text
- **WhatsApp Business API** — direct message sending (not just link-opening)
- **Export contacts** — reverse of import; export to CSV
- **Recurring greeting scheduler** — schedule a greeting to send reminder for same holiday next year
- **Multi-language greeting** — detect contact's language automatically from name/phone region

---

## 🤖 Current Agent Activity

| Agent | Role | Current Status |
|-------|------|---------------|
| **Agent 1** — Developer | Implements improvements from Agent 2+3 notes | _Iteration 6 complete. Next: Tier desc i18n or key={i} fix_ |
| **Agent 2** — Researcher | Finds 3 new improvements per iteration | _Iteration 6 complete. Latest: scoringSystem DST bug, key={i} in 3 lists, isOnboardingDone perf_ |
| **Agent 3** — Code Reviewer | Reviews every Agent 1 change | _Iteration 6 complete. Last reviewed: GreetingEditorScreen i18n fix — verified correct_ |
| **Agent 4** — Changelog Manager | Updates changelog.xlsx after every change | _changelog.xlsx at 41 entries. Runs after Agent 3 each iteration_ |
| **Agent 5** — Bug Hunter | Runs build+lint every iteration, fixes immediately | _Feature sprint: fixed 3 lint bugs in MediaAttachmentPicker. Build + lint clean._ |
| **Foundation Agent** | One-shot: types + storage + context + i18n for 3 new features | ✅ Complete |
| **Feature Agent B** | One-shot: Greeting Media UI | ✅ Complete — MediaAttachmentPicker + GreetingEditor + WhatsApp |
| **Feature Agent C** | One-shot: Group Holiday Assignment | ✅ Complete — GroupsScreen + DashboardScreen |
| **Feature Agent D** | One-shot: Coupon System UI | ✅ Complete — UpgradeScreen + SettingsScreen |

---

## 📊 Metrics

| Metric | Value |
|--------|-------|
| Total screens | 18 (15 regular + 3 premium) |
| Total components | 15+ |
| i18n keys | ~230+ |
| changelog.xlsx entries | 52 |
| Agent loop iterations completed | 6 |
| Lint errors fixed by Agent 5 | 17 |
| Build time | ~870ms |
| Bundle size (main chunk) | 272 kB (gzip: 74 kB) |
| localStorage keys | 7 |
| Holiday database | 30+ holidays |
| Supported languages (greetings) | 6 (Hebrew, Arabic, English, French, Spanish, Russian) |
| UI languages | 2 (EN, HE with full RTL) |
