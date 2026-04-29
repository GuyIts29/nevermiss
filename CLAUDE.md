# NeverMiss — Claude Code Instructions

You are improving the NeverMiss app. Work using a 4-agent pipeline.

## Agents

### Developer
Implements all changes: features, foundational setup, i18n keys, type definitions, bug fixes.
Works to full DoD — no partial implementations. Both locales (EN + HE) required on every change that touches strings.

### Quality Gate
Validates every Developer change. Runs after Developer, before Documentation.

**Technical checks:**
- Build must pass (`npm run build`)
- Lint must pass (`npm run lint`)
- No TypeScript errors
- No regressions in existing features
- i18n keys present in both EN and HE locales

**Product checks:**
- DoD fully met — no partial implementation
- User can complete the action end-to-end
- UX flow is clear and unbroken
- Feature achieves its stated user goal (technically working is not enough)

Quality Gate may fix mechanical errors (build, lint, types) directly.
Quality Gate flags logic, architectural, and product issues to Developer for fix, then re-runs the full check.
Partial approval is not permitted. Either all checks pass or the sprint is blocked.

**Failure → sprint blocked. Developer fixes. Quality Gate re-runs.**

### Documentation
Runs after Quality Gate approves. Closes the sprint. All steps are required — none may be skipped.

- Append entries to `agent_state/changelog_queue.json` (append-only — NEVER overwrite or delete entries)
- Update `agent_state/qa_status.json` with new test statuses for the sprint
- Update `scripts/make-qa-checklist.js` TESTS array to match new test IDs
- Update `BUG_REPORT.md` immediately when a bug is found or fixed (real-time, not batched)
- Run `npm run changelog` → regenerates `changelog.xlsx`
- Run `npm run qa` → regenerates `NeverMiss_QA_Checklist.xlsx`

**Sprint is NOT complete until all Documentation steps are done.**

### Research & UX *(optional — post-sprint only)*
Runs after a sprint is complete, before the next sprint plan. Never runs during implementation.
Produces max 3 findings per sprint covering technical issues (memory leaks, logic gaps, architectural risks) and/or UX issues (user flows, audience fit, onboarding clarity).
Writes to `agent_state/research_notes.md`. No code changes, ever.
If more than 3 findings are submitted, only the top 3 by impact are kept.

---

## Execution Order (STRICT)

```
Developer → Quality Gate → Documentation
```

Research & UX runs only after Documentation closes the sprint — never during.

After sprint complete:
1. Research & UX produces findings (if applicable) → feeds next sprint plan
2. Present full sprint summary
3. Wait for user confirmation before starting next sprint

---

## Core Rules

- Each agent operates ONLY within its defined role
- All changes must be: incremental, isolated, reversible, build-safe
- NEVER break the build
- NEVER introduce partial features
- NEVER modify unrelated files
- NEVER duplicate logic
- If unsure → STOP and explain

---

## Anti-Chaos Rules (CRITICAL)

- Prefer editing existing files over creating new ones
- Do NOT cross sprint scope or start new work outside the approved plan
- Never start a new sprint if: build fails, lint errors exist, previous sprint incomplete
- Do NOT create parallel systems if one already exists

### Sprint Quality Gate (required before Documentation runs)
ALL of the following must pass:
1. Build passes (`npm run build`)
2. Lint passes (`npm run lint`)
3. No TypeScript errors
4. No regressions in existing features
5. i18n keys present in both EN and HE for every new string
6. DoD fully met — no partial implementation
7. User flow works end-to-end — user goal is achievable

**NeverMiss_QA_Checklist.xlsx rules:**
- If the file does not exist → run `npm run qa` to recreate it automatically
- ✅ = feature implemented and passing
- ❌ = bug found and not yet fixed
- ⚠️ = partial / needs attention
- ☐ = not yet tested
- Update `הערות` column with what was done, which sprint/bug number, and what remains
- NEVER skip this step — QA checklist is a required Documentation artifact

### Auto-recovery protocol
- If a Quality Gate check fails: Quality Gate attempts to fix mechanical errors (build/lint/types) directly
- If fixed within 2 attempts → continue automatically
- If NOT fixed after 2 attempts → STOP and wait for user confirmation

### Stop conditions (immediate halt)
- Build fails
- Lint fails
- Quality Gate flags a critical issue (technical or product)
- Unexpected file changes occur

---

## Pre-Implementation Requirements

Before making changes:
- Inspect existing implementation
- Identify impacted files
- Do NOT assume structure

After each feature provide manual QA checklist:
- Steps to test
- Expected results
- Edge cases

---

## Phase 1 — Critical Fixes

- Replace key={index} with stable IDs
- Add top-level ErrorBoundary in App.tsx
- Move isOnboardingDone() to useMemo
- Fix tap targets ≥ 48×48px
- Add pull-to-refresh on DashboardScreen
- Fix/remove Dashboard refresh button

---

## Phase 2 — Premium Features

### Greeting Media
- Image upload (Camera + Gallery via Capacitor)
- Voice recording max 60s
- File limits: Images 5MB, Audio 2MB
- Compress images before base64
- Preview media before sending
- Store base64 (MVP)
- If too large → block + Hebrew error message
- Premium gated with lock icon
- WhatsApp rule: NEVER promise auto attachment
- Show disclaimer: "יש לצרף את הקובץ ידנית ב-WhatsApp"

### Multi-Channel Sending
- Channel picker bottom sheet
- Channels: WhatsApp, SMS (sms:), Email (mailto:), Copy to clipboard, navigator.share()
- Remember last used channel per contact
- Fully localized in Hebrew

### Group Holiday Assignment
- Group.holidayIds field
- Holiday picker in group create/edit modal
- Dashboard alerts: "Holiday X in N days — Y contacts in [Group]"
- "Send to group" → sequential sending via channel picker

### Coupon System
- Coupon input on Upgrade screen
- Valid codes: NEVERMISS1, WELCOME2025, ISRAEL30 → 1 month free
- Prevent reuse via localStorage
- Expiration logic + auto-expire premium
- Display "Premium active until [date]" in Settings

---

## Phase 3 — Audience Focus

- Free tier: team event organizers — max 20 contacts
- Premium tier: HR managers — unlimited, reports, import
- Update onboarding, upgrade screen, all copy
- All UI in Hebrew (RTL)

---

## Phase 4 — Notifications

- Capacitor Local Notifications for birthdays and holidays
- Smart reminder: "לא דיברת עם [name] 45 יום, יום ההולדת שלו בעוד 3 ימים"
- Keep simple

---

## Phase 5 — Additional Premium

- Haptic feedback via Capacitor on key actions
- Success animation after sending greeting
- Export contacts to CSV
- celebrationType field on Contact (Jewish/Christian/Muslim/Druze/Secular)
- Filter holiday suggestions by celebrationType
- Import from device contacts via Capacitor Contacts (Premium)

---

## Phase 6 — Performance

- React.lazy for all premium screens (Suspense inside WithNav)
- React.memo on ContactCard
- Memoize calculateRelationshipScore with Map cache keyed by contact id + updatedAt
- Fix getBirthdayDaysUntil using date-fns differenceInCalendarDays
- Named imports for date-fns tree-shaking

---

## Phase 7 — i18n

- Remove all hardcoded strings from UpgradeScreen and GreetingEditorScreen
- RELIGION_LABELS via i18n lookup
- Fix all mixed Hebrew/English strings
- Localize all channel names in channel picker

---

## Phase 8 — Accessibility

- aria-label on all icon-only buttons
- aria-expanded on all toggle buttons
- Focus trap in Modal component

---

## Phase 9 — Architecture

- Move HOLIDAY_SPECIFIC_BODIES to src/data/greetingTemplates.ts
- Optimize date-fns imports
- Add ErrorBoundary
- Prepare Supabase folder structure (no integration yet)
- Prepare PayMe payment page UI (no real integration yet)
- Prepare Claude API placeholder (no real integration yet)
- NOTE: Keep localStorage for MVP — IndexedDB migration planned for v2

---

## Data Safety + MVP Limitations

- Validate localStorage size before saving media
- Block oversized data with Hebrew error message
- Avoid data corruption

---

## Additional Product Features

- Demo mode with sample data
- Local analytics (stored locally only): greetings sent, coupons used, imports completed
- Backup/restore JSON
- Duplicate contact detection (merge or skip)

---

## Trust & Credibility

- Hebrew privacy policy with simple clear language
- About screen with contact info placeholders
- "האפליקציה לא שולחת הודעות אוטומטית" disclaimer on sending screen

---

## Changelog Rules (Documentation)

### changelog_queue.json — APPEND ONLY
`agent_state/changelog_queue.json` is an **append-only log**. No entry may ever be removed or overwritten.

Documentation appends **after every single change** — not just at the end of a sprint. Every entry must include:
```json
{
  "timestamp": "YYYY-MM-DDTHH:MM:SS",
  "agent": "Developer | QualityGate | Documentation | ResearchUX",
  "action": "added | modified | deleted | fixed",
  "file": "relative/path/to/file",
  "description": "תיאור בעברית של מה שנעשה"
}
```

Required for every type of change:
- `added` — new file, component, feature, i18n key
- `modified` — code change, config change, style change
- `deleted` — removed code, component, style, or config value
- `fixed` — bug fix (reference BUG-XXX or FINDING-XX)

After appending, run `npm run changelog` → updates `changelog.xlsx`
After appending, run `npm run qa` → updates `NeverMiss_QA_Checklist.xlsx`

### changelog.xlsx
Run `npm run changelog` to regenerate. Columns:
`Date` · `Time` · `Screen/File` · `Change Description` · `Type` (feature/bugfix/improvement/security) · `Change Category` (code_change/configuration) · `Agent` · `Status`

### BUG_REPORT.md — REAL TIME
Update immediately when a bug is found or fixed. Do not batch. Format:
`Date` · `Time` · `File` · `Bug Description` · `Status` (found/fixed) · `How it was fixed`

### NeverMiss_QA_Checklist.xlsx
Run `npm run qa` to regenerate. Update `agent_state/qa_status.json` first with new statuses. If the file is missing, `npm run qa` recreates it automatically.

---

## Success Criteria

- Build always clean
- No regressions
- Premium features complete and usable
- Notifications working
- UX stable on mobile
- changelog.xlsx, BUG_REPORT.md, and NeverMiss_QA_Checklist.xlsx always up to date
- changelog_queue.json is append-only — never overwritten

---

## Output Format (Mandatory)

After each sprint:
- What was done
- Files changed
- What remains
- QA checklist

---

## Project Overview

**NeverMiss** — Smart Relationship & Cultural Greetings CRM.
Stack: React 19 + TypeScript + Vite 8 + Tailwind v4 (`@tailwindcss/vite` plugin, NOT PostCSS), React Router v7, Capacitor 8, date-fns, lucide-react, lottie-react, localStorage persistence. Bilingual EN/HE with full RTL support.

Build: `npm run build` (uses rolldown via Vite 8).
Changelog: `node scripts/make-changelog.js` → writes `changelog.xlsx`.

## Coordination Files (all in `agent_state/`)

- `research_notes.md` — Research & UX writes; Developer reads before sprint planning
- `review_notes.md` — Quality Gate writes findings; Developer reads and fixes
- `changelog_queue.json` — append-only JSON array; Documentation writes after every sprint
- `iteration_log.md` — one row per sprint: number, date, what each agent did
