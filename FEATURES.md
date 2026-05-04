# NeverMiss — Feature Map
_Last updated: 2026-04-28 | Iteration 12+ | Auto-maintained by Agent Loop_

> Intended for sharing with AI tools, designers, and collaborators for feedback and new feature ideas.
> Stack: React 19 · TypeScript · Vite 8 · Tailwind v4 · Capacitor 8 · localStorage (MVP)

---

## ✅ Completed Features

### Free Tier

#### Dashboard (`src/screens/DashboardScreen.tsx`)
- Time-of-day greeting (morning/afternoon/evening) with personalized text
- "Today's Highlights" section — today's holiday and birthday cards
- Priority contacts list (scored by relationship engine, top 5)
- Reconnect suggestions (overdue contacts, high/critical urgency)
- Tomorrow's holiday preview card
- Stats cards with gradient icon circles (contacts count, groups, upcoming holidays)
- Staggered list entrance animations
- Gradient FAB button (navigate to add contact)
- Group holiday alerts section (14-day window, shows coming holidays for groups)
- Today-highlight cards are `<button>` elements (keyboard accessible) ✅ _Iteration 12_

#### Contacts (`src/screens/ContactsScreen.tsx`)
- Full contact list with real-time search
- Filter chips: All / External / Internal / VIP
- Sort options: Score / Name / Last Contact / Importance
- Free-tier limit indicator (20 contacts)
- Staggered card entrance animations
- FAB to add new contact

#### Contact Detail (`src/screens/ContactDetailScreen.tsx`)
- Full-width gradient profile banner with avatar
- SVG ring arc showing relationship score (0–100)
- Score breakdown bars: Time Penalty / Importance Weight / Upcoming Events
- Contact info rows with icon badges (phone, relationship, type, religion, frequency)
- Urgency level, interaction frequency, suggested action — all i18n'd ✅ _Iteration 12_
- Greeting action button (gradient) → GreetingEditorScreen
- Related holidays list (upcoming 30 days)
- "Mark Contacted" button (resets last contact date)
- WhatsApp integration button
- **Group membership section** ✅ _Sprint 24 (BL-089)_ — shows all groups the contact belongs to as colored chips (emoji + name); hidden when no groups; reverse-lookup via Group.contactIds

#### Contact Form (`src/screens/ContactFormScreen.tsx`)
- Live gradient avatar preview (name-hashed, 10-option palette)
- Auto gradient + 8 solid color swatch options
- Section headers with colored gradient icon squares
- Free section: name, phone, relationship type, contact type (internal/external), religion, language, importance, interaction frequency, last contact date, notes
- Premium section (amber border, locked fields): birthday, Hebrew birthday (Judaism contacts), email, department, role, team
- **Hebrew Birthday field** (optional, `"DD-MM"` format): Day + Month dropdowns for Hebrew calendar; shown for Judaism contacts or when already set; stored as `hebrewBirthday` on Contact; clear button ✅ _FEATURE_
- **Group assignment** ✅ _Sprint 21 (BL-069)_ — optional group selector for new contacts only; selected group's contactIds updated on save; shown only when groups exist
- Auto-focus on name for new contacts
- Save bar with gradient fade

#### Calendar (`src/screens/CalendarScreen.tsx`)
- Monthly calendar with holiday dots per day
- **Birthday dots (pink) on calendar cells** for contacts with birthdays that month ✅ _BUG-039_
- **Birthday section panel** — shows contact names with 🎂 for the selected day or all month ✅ _BUG-039_
- Hebrew birthday dots: uses `hebrewBirthday` conversion when available (priority over Gregorian) ✅ _BUG-039_
- Religion filter chips with religion-specific colors
- Gradient-tinted day cells for active/today
- Holiday list below calendar (filtered by selected date or full month)
- Hebrew calendar integration via `@hebcal/core`:
  - Hebrew month label(s) shown above Gregorian month
  - Hebrew day in gematria (e.g. "ה׳") on each calendar cell

#### Groups (`src/screens/GroupsScreen.tsx`)
- Group cards with left color border + gradient tint
- Gradient emoji circle (w-12 h-12)
- Contact count + holiday count pills
- Create/edit group modal (name, description, color picker, emoji picker)
- **Contact picker in group modal** ✅ _Sprint 21 (BL-068)_ — searchable list of contacts with checkboxes in create/edit modal; selectedContactIds initialized from group; saved to contactIds on submit
- **Religion filter chips in holiday picker** ✅ _Sprint 24 (BL-093 Phase 1)_ — filter chips above holiday search filter the list by religion (display-only; no auto-selection); multi-select; clears on modal open
- **Group purpose hint improved** ✅ _Sprint 24 (BL-093 Phase 1)_ — updated from generic "(optional)" to descriptive "Pre-selects relevant holidays" / "מסייע לבחור חגים רלוונטיים"
- Free-tier limit: 2 groups
- Group cards are `<button>` elements (keyboard accessible) ✅ _Iteration 12_

#### Settings (`src/screens/SettingsScreen.tsx`)
- Language toggle (EN / HE) with sliding pill indicator (CSS calc fix applied)
- Theme picker with active checkmark + glow ring (3 built-in themes; premium unlocks more)
- Notifications toggle (browser permission-based)
- Premium gold/amber banner when premium active
- "Premium active until [date]" display with calendar icon
- Coupon input section (collapsible) with auto-uppercase + success/error feedback
- Danger zone (clear all data, red-tinted background)
- App links: What's New, About, Privacy, Terms

#### About (`src/screens/AboutScreen.tsx`)
- Full gradient hero banner with floating 💌 emoji
- Mission text fully i18n'd ✅ _Iteration 12_
- Core values (4) with gradient icon circles — all i18n'd ✅ _Iteration 12_
- Privacy tech facts (4) with icon+pill layout — all i18n'd ✅ _Iteration 12_

#### Privacy & Terms (`src/screens/PrivacyScreen.tsx`, `TermsScreen.tsx`)
- Full gradient hero banners
- Section icons with color-tinted badges
- Font-extrabold section titles

#### What's New (`src/screens/WhatsNewScreen.tsx`)
- Vertical timeline with animated gradient connector
- Version dots as gradient circles
- Change type badges (feature/improvement/bugfix/security) with gradient backgrounds
- Latest version highlighted

#### Onboarding (`src/screens/OnboardingScreen.tsx`)
- 4-slide onboarding flow (setup, occasions, groups, features)
- Gradient icon circles per slide with animate-float
- Progress dots with gradient active pill
- Skippable

#### Upgrade (`src/screens/UpgradeScreen.tsx`)
- Hero gradient banner with premium pitch
- Free vs Premium comparison table (see feature gate details below)
- Testimonials section
- Pricing display (₪29/month · ₪249/year)
- Coupon code section ("Have a coupon?" collapsible)
- Demo premium activation button
- Shows "Already Active" state when premium is live

**Free vs Premium feature comparison (documented gates):**

| Feature | Free | Premium |
|---------|------|---------|
| Contacts | Up to 20 | Unlimited |
| Groups | Up to 2 | Unlimited |
| Import contacts (CSV) | ❌ | ✅ |
| Import from device contacts | ❌ | ✅ |
| Export contacts to CSV | ❌ | ✅ |
| Birthday tracking & Birthday Center | ❌ | ✅ |
| Birthday Greeting Editor | ❌ | ✅ |
| Premium themes | ❌ | ✅ |
| Contact fields (email, department, role, team) | ❌ | ✅ |
| Backup / restore JSON | ❌ | ✅ |
| **Holiday reminder notifications** | ❌ locked | ✅ Push · SMS · Email · WhatsApp |
| **Notification channels** | — | Push · SMS · Email · WhatsApp (per toggle) |

---

### Premium Tier

#### Birthday Center (`src/screens/premium/BirthdayCenterScreen.tsx`)
- Birthday list with tabs: Today / This Week / This Month
- Days-until countdown with gradient badge
- Today birthdays highlighted with gradient card background
- Empty states per tab
- Quick "Send Greeting" navigation

#### Birthday Greeting Editor (`src/screens/premium/BirthdayGreetingEditorScreen.tsx`)
- 3 tone tiers: Heartfelt 💝 / Celebratory 🎉 / Elegant 🌹
- 8-language support
- Live gift-card preview, editable textarea, character count
- Copy + WhatsApp send buttons

#### Import Contacts (`src/screens/premium/ImportContactsScreen.tsx`)
- 3-step wizard: Upload → Map Columns → Done
- CSV / Excel file upload (drag-drop or browse)
- Auto-detect column names (multi-language patterns including Hebrew)
- Column mapping UI with preview table
- Import result summary (imported / skipped / errors)
- Error list with stable keys (no React reconciliation warnings)
- `setImporting(false)` in `finally` block (button never stays locked) ✅ _Iteration 12_

---

### Components

#### ContactCard (`src/components/ContactCard.tsx`)
- Name-hashed gradient avatar (10-option palette, canonical via avatarUtils)
- Urgency-tinted card background glow
- Score progress bar with color-coded urgency
- Staggered entrance animation
- Urgency badge as colored pill
- `<button>` element (WCAG 2.1.1 keyboard accessible) ✅ _Iteration 8_
- Crown and Building2 icons have `aria-hidden="true"` ✅ _Iteration 12_
- **Score badge is tappable** ✅ _Sprint 21 (BL-082)_ — tap opens tooltip explaining score (title + body); EN+HE; click-outside/Escape close
- **Group membership chips** ✅ _Sprint 24 (BL-089)_ — shows up to 2 groups (emoji + name, group color) below relationship type; +N overflow for 3+ groups

#### HolidayCard (`src/components/HolidayCard.tsx`)
- Compact: gradient-tinted background + left color border
- Full: gradient color header strip, animate-float emoji
- Hebrew date line for `dateType === 'hebrew'` holidays ✅ _Sprint 2_
- **i18n: Today/Tomorrow/Passed/days labels fully localized** ✅

#### Navigation (`src/components/Navigation.tsx`)
- Bottom nav with gradient active pill
- Page header with font-extrabold
- Back button with active:scale-90, RTL-aware arrow flip
- **i18n: Back button aria-label via t('go_back')** ✅ _Iteration 12_

#### Modal (`src/components/ui/Modal.tsx`)
- Visible drag handle
- Backdrop blur(6px)
- `danger` prop for red title
- `aria-labelledby` for accessibility
- ESC key support
- Focus trap (Tab/Shift+Tab trapped; focus restored on close) ✅ _Sprint F1_
- **i18n: Close button aria-label via t('close')** ✅ _Iteration 12_

#### WhatsApp Button (`src/components/WhatsAppButton.tsx`)
- Authentic WhatsApp green gradient
- Green glow shadow
- Amber-tinted warning box in modal preview
- Image clipboard copy + Hebrew paste instruction popup ✅ _Iteration 11_
- Fully i18n'd

#### EmptyState (`src/components/EmptyState.tsx`)
- Large gradient circle icon container
- animate-float icon
- Font-bold title

#### Channel Picker (`src/components/ChannelPicker.tsx`)
- Bottom sheet modal for channel selection
- Channels: WhatsApp, SMS, Email, Copy to Clipboard, Web Share
- Remembers last-used channel per contact
- Fully localized

#### Media Attachment Picker (`src/components/MediaAttachmentPicker.tsx`)
- Image upload from device (FileReader → base64, 2MB guard)
- Voice recording up to 60 seconds (MediaRecorder API, auto-stop)
- Image thumbnail / audio player preview with remove button
- "Save to device" download link + WhatsApp attach-manually hint
- Premium-gated with Crown lock card for free users
- Integrated into GreetingEditorScreen and WhatsAppButton modal

#### Premium Components
- **PremiumBadge** — Crown + "Premium" inline badge
- **PremiumGate** — HOC gate to conditionally render premium content with fallback
- **PremiumFeaturePrompt** — Inline upgrade CTA card with navigation to /upgrade

---

### Core Systems

#### Relationship Scoring (`src/core/scoringSystem.ts`)
- Time-decay penalty (0–50 pts based on days since last contact vs. interaction frequency)
- Importance weighting (0–30 pts: VIP/high/normal)
- Upcoming events weight (0–20 pts: holiday or birthday within 14 days)
- Urgency levels: low / medium / high / critical
- Suggested actions per score: wish_birthday / wish_holiday / reconnect / send_checkin / follow_up
- All action labels i18n'd ✅ _Iteration 12_
- **DST-safe birthday countdown via `differenceInCalendarDays`** ✅ _Iteration 12 (BUG-020)_

#### Relationship Engine (`src/core/relationshipEngine.ts`)
- `buildRelationshipInsight()` — aggregates score, upcoming holidays, birthday countdown per contact
- `buildDashboardData()` — derives priorityContacts, reconnectSuggestions, upcomingHolidays, todayBirthdays, upcomingBirthdays, teamBirthdays, overdueFollowUps
- Fully derived via `useMemo` in AppContext (no manual refresh)

#### Greeting Engine (`src/services/greetingService.ts`)
- 4–7 tone variants per template (friendly / business / formal / internal / VIP)
- `HOLIDAY_SPECIFIC_BODIES` lookup (rosh-hashana, yom-kippur, hanukkah, passover, eid-al-fitr, eid-al-adha, christmas)
- Authentic Hebrew Israeli casual voice (not translated English)
- VIP premium-letter quality templates
- Birthday greetings in 6+ languages
- Data split to `src/data/greetingTemplates.ts` for maintainability

#### i18n System (`src/i18n/index.ts`, `src/context/LanguageContext.tsx`)
- ~300+ translation keys
- `t(lang, key, vars?)` function with `{variable}` interpolation
- `useT()` hook (returns bound t fn)
- Persists to localStorage `nm_lang`
- Sets `document.dir = 'rtl'` on Hebrew

#### Theme System (`src/data/themes.ts`, `src/context/ThemeContext.tsx`)
- 3–4 themes: ocean, forest, sunset (+ premium unlock for more)
- CSS custom properties on `:root`
- Runtime switching via ThemeContext
- All themes with vibrant colors

#### Storage Service (`src/services/storageService.ts`)
- Typed `get<T>` / `set` / `remove` helpers
- `try/catch` on all JSON.parse with `console.warn` ✅
- CRUD for contacts, groups, drafts, settings, premium
- Coupon redemption + expiry tracking
- Per-contact last-used communication channel

#### Communication Service (`src/services/communicationService.ts`)
- WhatsApp URL builder with Israeli phone normalization (052-xxx → +972-5x-xxx) ✅ _Iteration 10_
- 00-prefix normalization (00972 → +972) ✅ _Iteration 11_
- Empty phone guard ✅ _Iteration 11_
- SMS (sms:), Email (mailto:), Web Share API, clipboard copy
- `getAvailableChannels()` returns actionable channels per contact

#### Import Service (`src/services/importService.ts`)
- CSV/XLSX parsing via PapaParse
- Auto-detect column names (multi-language patterns including Hebrew)
- Column validation (name required)
- Contact object creation from mapped columns
- **Hebrew Birthday column support** ✅ _Sprint 20 (BL-076)_ — `hebrewBirthday` auto-detected from "Hebrew Birthday" / "יום הולדת עברי" headers; written to Contact; `hebrewBirthday` pattern ordered before `birthday` to prevent false match
- **Birthday normalization** ✅ _Sprint 21 (BL-084)_ — `normalizeBirthday()` normalizes CSV birthday strings to YYYY-MM-DD; handles ISO, DD/MM/YYYY, and other common formats; prevents RangeError crash in ContactDetailScreen
- **Hebrew birthday validation** ✅ _Sprint 22 (BL-090)_ — `normalizeHebrewBirthday()` validates DD-MM format; rejects malformed strings (returns `undefined`); prevents garbage data being stored from CSV import
- **celebrationType round-trip** ✅ _Sprint 22 (BL-092)_ — `celebrationType` added to `DETECTABLE_FIELDS`; `normalizeCelebrationType()` maps common inputs to `CelebrationType` enum; `processImport` writes it to Contact; export↔import round-trip complete

#### Notification Service (`src/services/notificationService.ts`)
- Browser Notification API wrapper
- Birthday + holiday reminders
- Per-day deduplication via localStorage
- Permission request flow

#### Hebrew Date Utils (`src/utils/hebrewDateUtils.ts`) ✅ _Sprint 2_
- `getHebrewDateStr(isoDate)` converts any Gregorian ISO date to Hebrew date in gematria format
- E.g. "2026-04-21" → "ד׳ באייר תשפ״ו"
- Uses `HDate` + `gematriya` from `@hebcal/core`
- DST-safe local time parsing

#### Avatar Utils (`src/utils/avatarUtils.ts`)
- Canonical `getInitials` + `getAvatarGradient`
- 10-option gradient palette (name-hashed)
- Module-level `Map<string, string>` cache
- Consistent across all 7 consumer files

#### Group Holiday Assignment ✅ _Sprint F1_
- Holiday assignment section in group create/edit modal (searchable checkbox list)
- `group.holidayIds: string[]` stored and preserved across saves
- Dashboard "Coming up for your groups" alert section (14-day window)
- Alert cards with holiday emoji, days-until, group name, contact count, Send button

#### Coupon Code System ✅ _Sprint F1_
- "Have a coupon?" collapsible section on Upgrade screen
- Auto-uppercase input, success/error feedback states
- Valid codes: `NEVERMISS1`, `WELCOME2025`, `ISRAEL30` → 1 month free Premium
- Used coupon tracking in localStorage (per-device reuse prevention)
- Auto-expiry: `checkAndExpirePremium()` on every app init
- "Premium active until [date]" in Settings screen (calendar icon)

---

### Data

#### Holiday Database (`src/data/holidays.ts`)
- ~50+ holidays across dynamic year range (THIS_YEAR-1 → THIS_YEAR+2); auto-rolls forward every year ✅ _Sprint 14 (BL-077)_
- Religions covered: Judaism, Islam, Christianity, Druze, Buddhism, Hinduism, Sikhism, Bahá'í, East Asian, Secular/National
- Fields per holiday: name, alternativeNames, religion, type, date, endDate, year, dateType, description, greetingGuidance, greetings (hebrew/arabic/english/transliteration), sensitivityNotes, do/dontLists, color, emoji
- **Jewish holidays generated dynamically at runtime via `@hebcal/core` (Israel mode)** — 17 HebrewTemplates including all major holidays, fasts, and Israeli national days; zero hardcoded dates for Hebrew-calendar holidays ✅ _Sprint 14 (BL-077)_
- Static Gregorian holidays (Christmas, Easter, Islamic, Hindu, etc.) remain as-is
- **Yom HaAtzmaut 2026 fixed**: now correctly calculated as April 21 (ד׳ באייר תשפ״ו) ✅ _Sprint 2 (BUG-037)_

#### Greeting Templates (`src/data/greetingTemplates.ts`)
- Holiday-specific message bodies per tone × language
- Covers: Rosh Hashana, Yom Kippur, Hanukkah, Passover, Eid al-Fitr, Eid al-Adha, Christmas

---

### Architecture & Quality

#### Error Handling
- `ErrorBoundary` class component in `App.tsx` (wraps full app)
- `storageService.ts` — `console.warn` on all JSON.parse failures
- `ImportContactsScreen` — `setImporting(false)` in `finally` block

#### Accessibility
- `.card-interactive:focus-visible` ring (WCAG 2.4.7) ✅ _Iteration 9_
- `.btn:focus-visible` rule ✅ _Iteration 12_
- All contact/holiday/group cards are `<button>` elements ✅ _Iterations 8, 12_
- Modal focus trap (Tab/Shift+Tab) ✅ _Sprint F1_
- `aria-hidden="true"` on decorative icons ✅ _Iteration 12_
- RTL-aware back button arrow flip
- `aria-label` on close button via `t('close')` ✅ _Iteration 12_

#### Layout
- Full-width desktop layout (`@media (min-width: 768px)` removes max-width constraint) ✅ _Iteration 12_
- Mobile-first responsive design

#### Integrations (Stubbed — no live integration)
- **Supabase v2** (`src/integrations/supabase/client.ts`) — cloud sync stub
- **PayMe** (`src/integrations/payment/payme.ts`) — payment flow stub
- **Claude API** (`src/integrations/ai/claudeClient.ts`) — AI greeting suggestions stub

---

## 🚧 In Progress (Sprint 2)

_All Sprint 1 items complete. QA score: 56✅ / 0❌ / 1⚠️. Sprint 2 active._

---

## 📋 Planned (not yet started)

### Sprint 2 — Next

- **RELIGION_LABELS i18n** — religion names in HolidayCard/CalendarScreen still EN-only; need `t(\`religion_${...}\`)` (BL-014)
- **GreetingEditorScreen tier desc i18n** — `'Warm & personal'`, `'Polished & clear'`, `'Elevated & bespoke'` hardcoded EN (BL-015)
- **ContactCard action label translation** — `score.suggestedAction.label` in card (line ~80) still raw EN; needs `translatedActionLabel` pattern like ContactDetailScreen (BL-016)
- **Missing `aria-label`** on icon-only buttons: Edit in ContactDetailScreen; Regenerate/Copy/Advanced/Signature in GreetingEditorScreen (BL-017)
- **`aria-expanded`** on tone toggle and signature toggle in GreetingEditorScreen (BL-018)
- **React.lazy** for remaining ~15 eagerly-loaded screens; BirthdayCenter/BirthdayGreetingEditor/ImportContacts already lazy (BL-019)
- **scoringSystem.ts Map cache** — `calculateRelationshipScore` runs per render; add `Map<id, score>` cache keyed by `updatedAt` (BL-020)
- **Pull-to-refresh** on Dashboard (BL-021)
- **Dashboard refresh button** — no-op since useMemo; remove or repurpose (BL-022)

### Sprint 3 — Planned

- **Capacitor Local Notifications** — birthdays + holidays; smart reminder with days-since-contact logic (BL-023)
- **Haptic feedback** — Capacitor Haptics on save/send/coupon-success (BL-024)
- **Export contacts to CSV** — Premium feature (BL-025); **group assignment warning** ✅ _Sprint 22 (BL-091)_ — note displayed below export button in SettingsScreen that group assignments are not included in the CSV
- **celebrationType field** on Contact + holiday suggestions filter (BL-026)
- **greetingService.ts refactor** — `HOLIDAY_SPECIFIC_BODIES` → already split to `src/data/greetingTemplates.ts` ✅
- **date-fns named imports** — audit all imports for tree-shaking (BL-028)
- **Tap target size** WCAG 2.5.5 — some icon buttons ~36px (BL-029)
- **Import from device contacts** — Capacitor Contacts plugin; Premium (BL-030)

### Sprint 9 — Planned

- **PayMe payment page UI** — Hebrew checkout flow; stub at `src/integrations/payment/payme.ts` (BL-032)
- **Premium holiday reminder notifications** — Push, SMS, Email, WhatsApp channels; per-contact+holiday toggles; dedup via localStorage; free users see premium lock (BL-059)

### Sprint 10 — Planned

- **Claude AI greeting suggestions** — AI-personalized greetings via Claude API; stub ready at `src/integrations/ai/claudeClient.ts` (BL-033)

### Sprint 4+ — Future

- **Supabase v2 integration** — cloud sync; stubs ready (BL-031)
- **Backup / restore JSON** — export all app data (BL-034)
- **Duplicate contact detection** — merge or skip on import (BL-035)
- **Demo mode** with realistic sample data (BL-036)
- **Contact relationship map** — visual graph (BL-037)
- **Recurring greeting scheduler** (BL-038)

---

## 🤖 Current Agent Activity

| Agent | Role | Current Status |
|-------|------|---------------|
| **Agent 1** — Developer | Implements improvements from Agent 2+3 notes | _Sprint 2 active: Yom HaAtzmaut fixed, Hebrew date display added. Next: RELIGION_LABELS i18n, GreetingEditorScreen tier desc_ |
| **Agent 2** — Researcher | Finds 3 new improvements per iteration | _Iteration 12 complete. Latest findings: RELIGION_LABELS, GreetingEditorScreen tier i18n, ContactCard action label EN_ |
| **Agent 3** — Code Reviewer | Reviews every Agent 1 change | _Sprint 2 active. Reviewed: Jewish holiday date fix, hebrewDateUtils.ts_ |
| **Agent 4** — Changelog Manager / Documentation Owner / Backlog Curator | Updates changelog.xlsx, BUG_REPORT.md, FEATURES.md, AGENTS.md, BACKLOG.md, BACKLOG.csv after every change | _Sprint 2 active. QA: 56✅/0❌/1⚠️. FEATURES.md fully regenerated from codebase scan._ |
| **Agent 5** — Bug Hunter | Runs build+lint every iteration, fixes ONLY errors | _Sprint 2: Build clean. 2144 modules, ~425kB main chunk._ |
| **Foundation Agent** | Sets up types + storage + i18n; active as needed | _Active: Added 39 i18n keys iteration 12. hebrewDateUtils.ts added Sprint 2._ |
| **Feature Agents** | Parallel isolated feature work | _Sprint F1 complete. Next: Sprint 3 features (notifications, haptics, export)_ |

---

## 📊 Metrics

| Metric | Value |
|--------|-------|
| Total screens | 18 (15 regular + 3 premium) |
| Total components | 21 (13 feature + 8 UI base) |
| i18n keys | ~300+ |
| changelog.xlsx entries | 64+ |
| Agent loop iterations completed | 12+ |
| Lint errors fixed | 20+ |
| Build time | ~400ms |
| Bundle size (main chunk) | ~425kB (gzip: ~127kB) |
| localStorage keys | 7 |
| Holiday database | 50+ holidays |
| Supported languages (greetings) | 8 (Hebrew, Arabic, English, French, Spanish, Russian, Amharic, Other) |
| UI languages | 2 (EN, HE with full RTL) |
| Religion categories | 10 |
| Contact relationship types | 10 |
| Greeting tones | 5 (friendly/business/formal/internal/VIP) |
| QA test score | 56 ✅ / 0 ❌ / 1 ⚠️ (57 total) |
| Integration stubs | 3 (Supabase, PayMe, Claude API) |
