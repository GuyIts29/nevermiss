# NeverMiss — Feature Map
_Last updated: 2026-04-28 | Iteration 12 | Auto-maintained by Agent Loop_

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
- **i18n: Mission text, all VALUES titles/desc, all TECH labels/values fully localized** ✅ _Iteration 12_

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
- **i18n: Back button aria-label via t('go_back')** ✅ _Iteration 12_

#### Modal (`src/components/ui/Modal.tsx`)
- Visible drag handle
- Backdrop blur(6px)
- danger prop for red title
- aria-labelledby for accessibility
- ESC key support
- Focus trap (Tab/Shift+Tab trapped; focus restored on close) ✅ _Sprint F1_
- **i18n: Close button aria-label via t('close')** ✅ _Iteration 12_

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
- **DST-safe birthday countdown via `differenceInCalendarDays`** ✅ _Iteration 12 (BUG-020)_

#### Greeting Engine (`src/services/greetingService.ts`)
- 4–7 tone variants per template
- HOLIDAY_SPECIFIC_BODIES lookup (rosh-hashana, yom-kippur, hanukkah, passover, eid-al-fitr, eid-al-adha, christmas)
- Authentic Hebrew Israeli casual voice (not translated English)
- VIP premium-letter quality templates
- Birthday greetings in 6 languages

#### i18n System (`src/i18n/index.ts`, `src/context/LanguageContext.tsx`)
- ~270+ translation keys (39 added iteration 12: urgency_*, go_back, action_*, holiday_*, about_*)
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

## 🚧 In Progress (Sprint 2)

_All Sprint 1 items complete. QA score: 56✅ / 0❌ / 1⚠️. Starting Sprint 2._

---

## 📋 Planned (not yet started)

### Sprint 2 — Next

- **RELIGION_LABELS i18n** — religion names in HolidayCard/CalendarScreen still EN-only; need `t(\`religion_${...}\`)` (BL-014)
- **GreetingEditorScreen tier desc i18n** — `'Warm & personal'`, `'Polished & clear'`, `'Elevated & bespoke'` hardcoded EN (BL-015)
- **ContactCard action label translation** — `score.suggestedAction.label` in card (line 80) still raw EN; needs `translatedActionLabel` pattern like ContactDetailScreen (BL-016)
- **Missing `aria-label`** on icon-only buttons: Edit in ContactDetailScreen; Regenerate/Copy/Advanced/Signature in GreetingEditorScreen (BL-017)
- **`aria-expanded`** on tone toggle and signature toggle in GreetingEditorScreen (BL-018)
- **React.lazy** for remaining ~15 eagerly-loaded screens; BirthdayCenter/BirthdayGreetingEditor/ImportContacts already lazy (BL-019)
- **scoringSystem.ts Map cache** — `calculateRelationshipScore` runs per render; add `Map<id, score>` cache keyed by `updatedAt` (BL-020)
- **Pull-to-refresh** on Dashboard (BL-021)
- **Dashboard refresh button** — no-op since useMemo; remove or repurpose (BL-022)

### Sprint 3 — Planned

- **Capacitor Local Notifications** — birthdays + holidays; smart reminder with days-since-contact logic (BL-023)
- **Haptic feedback** — Capacitor Haptics on save/send/coupon-success (BL-024)
- **Export contacts to CSV** — Premium feature (BL-025)
- **celebrationType field** on Contact + holiday suggestions filter (BL-026)
- **greetingService.ts refactor** — `HOLIDAY_SPECIFIC_BODIES` → `src/data/greetingTemplates.ts` (BL-027)
- **date-fns named imports** — audit all imports for tree-shaking (BL-028)
- **Tap target size** WCAG 2.5.5 — some icon buttons ~36px (BL-029)
- **Import from device contacts** — Capacitor Contacts plugin; Premium (BL-030)

### Sprint 4+ — Future

- **Supabase v2 integration** — cloud sync; stubs ready (BL-031)
- **PayMe payment** — real payment flow; stub ready (BL-032)
- **Claude AI greeting suggestions** — Claude API; stub ready (BL-033)
- **Backup / restore JSON** — export all app data (BL-034)
- **Duplicate contact detection** — merge or skip on import (BL-035)
- **Demo mode** with realistic sample data (BL-036)
- **Contact relationship map** — visual graph (BL-037)
- **Recurring greeting scheduler** (BL-038)

---

## 🤖 Current Agent Activity

| Agent | Role | Current Status |
|-------|------|---------------|
| **Agent 1** — Developer | Implements improvements from Agent 2+3 notes | _Iteration 12 complete. Next Sprint 2: RELIGION_LABELS i18n, GreetingEditorScreen tier desc_ |
| **Agent 2** — Researcher | Finds 3 new improvements per iteration | _Iteration 12 complete. Latest findings: RELIGION_LABELS, GreetingEditorScreen tier i18n, ContactCard action label EN_ |
| **Agent 3** — Code Reviewer | Reviews every Agent 1 change | _Iteration 12 complete. Reviewed: i18n completeness, accessibility fixes, layout fix_ |
| **Agent 4** — Changelog Manager / Documentation Owner / Backlog Curator | Updates changelog.xlsx, BUG_REPORT.md, FEATURES.md, AGENTS.md, BACKLOG.md, BACKLOG.csv after every change | _Iteration 12 complete. QA: 56✅/0❌/1⚠️. BACKLOG.md and BACKLOG.csv created._ |
| **Agent 5** — Bug Hunter | Runs build+lint every iteration, fixes ONLY errors | _Iteration 12 clean. Build: 2143 modules, ~370kB main chunk._ |
| **Foundation Agent** | Sets up types + storage + i18n; active as needed | _Active: Added 39 i18n keys iteration 12. Ongoing for new features._ |
| **Feature Agents** | Parallel isolated feature work | _Sprint F1 complete. Next: Sprint 3 features (notifications, haptics, export)_ |

---

## 📊 Metrics

| Metric | Value |
|--------|-------|
| Total screens | 18 (15 regular + 3 premium) |
| Total components | 15+ |
| i18n keys | ~270+ (39 added iteration 12) |
| changelog.xlsx entries | 77+ |
| Agent loop iterations completed | 12 |
| Lint errors fixed by Agent 5 | 20+ |
| Build time | ~415ms |
| Bundle size (main chunk) | 370 kB (gzip: 111 kB) |
| localStorage keys | 7 |
| Holiday database | 30+ holidays |
| Supported languages (greetings) | 6 (Hebrew, Arabic, English, French, Spanish, Russian) |
| UI languages | 2 (EN, HE with full RTL) |
| QA test score | 56 ✅ / 0 ❌ / 1 ⚠️ (57 total) |
