# NeverMiss — Claude Code Instructions

You are improving the NeverMiss app. Work using a coordinated multi-agent system.

## Agents

**Agent 1 — Developer:** Implements features. ONLY implements, does NOT review.
**Agent 2 — Researcher:** Suggests max 3 improvements per iteration. Does NOT change code.
**Agent 3 — Code Reviewer:** Validates every Agent 1 change. Does NOT implement.
**Agent 4 — Changelog Manager:** Updates changelog.xlsx and BUG_REPORT.md after every change.
**Agent 5 — Bug Hunter:** Runs build+lint after every change. Fixes ONLY errors, not features.
**QA Agent:** Validates completed features manually. Creates QA checklist, tests Hebrew RTL, mobile UX, edge cases, and premium/free gating. Does NOT change code. Reports bugs to Bug Hunter. Runs AFTER each Feature Agent completes and AFTER Agent 3 Code Reviewer.
**Product/UX Agent:** Reviews user flows, onboarding, upgrade screen, and audience fit (HR managers + team event organizers). Suggests max 3 high-impact UX improvements per phase. Does NOT change code. Reports findings to Agent 1 via research_notes.md. Runs AFTER each phase is complete and BEFORE user confirmation step.
**Foundation Agent:** Sets up types, storage, i18n keys, shared state — MUST complete before Feature Agents start.
**Feature Agents:** Work in parallel but fully isolated. Do NOT modify shared core logic unless required. Do NOT conflict with each other.

---

## Core Rules

- Each agent operates ONLY within its role
- All changes must be: incremental, isolated, reversible, build-safe
- NEVER break the build
- NEVER introduce partial features
- NEVER modify unrelated files
- NEVER duplicate logic
- If unsure → STOP and explain

---

## Anti-Chaos Rules (CRITICAL)

- Maximum 3–5 iterations per execution
- Run all 9 phases continuously within a single cycle. DO NOT stop for user confirmation between phases.
- Do NOT cross phase scope or start new work outside the current phase.
- Never start a new phase if: build fails, lint errors exist, previous phase incomplete
- Prefer editing existing files over creating new ones
- Do NOT create parallel systems if one already exists

### Quality Gate (required between every phase)
After each phase, ALL of the following must pass before advancing:
1. Build must pass (`npm run build`)
2. Lint must pass (`npm run lint`)
3. Agent 3 (Code Reviewer) must approve
4. Agent 5 (Bug Hunter) must verify no issues
5. No regressions allowed

### Auto-recovery protocol
- If a check fails: Agent 5 and Agent 3 attempt to fix automatically first
- If fixed within 2 attempts → continue automatically
- If NOT fixed after 2 attempts → STOP and wait for user confirmation

### Stop conditions (immediate halt)
- Build fails
- Lint fails
- Reviewer flags a critical issue
- Bug Hunter finds blocking issues
- Unexpected file changes occur

### After all 9 phases complete
- Present a full sprint summary
- Re-evaluate backlog with Agent 2 and Product/UX Agent
- Wait for user confirmation before starting the next cycle
- After user confirmation, start next cycle with updated backlog priorities

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

## Strict Execution Order (per iteration)

1. Foundation Agent (if needed)
2. Feature Agents (parallel & isolated)
3. Agent 1 + Agent 2 + Agent 5 (parallel)
4. Agent 3 — Code Reviewer
5. QA Agent — validates features, tests RTL/mobile/edge cases
6. Product/UX Agent — reviews user flows, reports to Agent 1
7. Agent 4 — Changelog Manager
8. After all 9 phases complete: present full sprint summary → wait for user confirmation before next cycle

---

## Phase 1 — Critical Fixes (Bug Hunter priority)

- Replace key={index} with stable IDs
- Add top-level ErrorBoundary in App.tsx
- Move isOnboardingDone() to useMemo
- Fix tap targets ≥ 48×48px
- Add pull-to-refresh on DashboardScreen
- Fix/remove Dashboard refresh button

---

## Phase 2 — Premium Features (Feature Agents)

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

## Changelog Rules (Agent 4)

Update `changelog.xlsx` after every change with columns:
`Date` · `Time` · `Screen/File` · `Change Description` · `Type` (feature/bugfix/improvement/security) · `Change Category` (code_change/configuration) · `Agent` · `Status`

Update `BUG_REPORT.md` with:
`Date` · `Time` · `File` · `Bug Description` · `Status` (found/fixed) · `How it was fixed`

---

## Success Criteria

- Build always clean
- No regressions
- Premium features complete and usable
- Notifications working
- UX stable on mobile
- No agent conflicts
- changelog.xlsx and BUG_REPORT.md always up to date

---

## Output Format (Mandatory)

After each iteration:
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

## Coordination Files (shared state, all in `agent_state/`)

- `research_notes.md` — Agent 2 writes, Agent 1 reads
- `review_notes.md` — Agent 3 writes, Agent 1 reads
- `changelog_queue.json` — append-only JSON array; all agents write, Agent 4 processes + clears
- `iteration_log.md` — one row per iteration: number, date, what each agent did
