# NeverMiss — Smart Relationship & Cultural Greetings Assistant

> *Never miss a meaningful moment.*

NeverMiss is a privacy-first, production-ready hybrid app combining lightweight CRM, cultural intelligence, relationship scoring, and personalized greeting generation.

---

## Overview

NeverMiss helps users maintain meaningful relationships by:

- Tracking important people and when you last contacted them
- Alerting you to upcoming cultural and religious holidays
- Generating personalized, template-based greetings in multiple languages
- Scoring your relationships and prioritizing who needs attention
- Sending messages via WhatsApp (user-triggered only — no automatic sending)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Mobile | Capacitor (Android + iOS) |
| Persistence | localStorage (MVP) |
| Icons | Lucide React |
| Animations | lottie-react |
| Date handling | date-fns |
| CSV Import | PapaParse |

---

## Relationship Intelligence Engine

The core differentiator. Located in `src/core/`.

### Scoring System (`scoringSystem.ts`)

```
relationshipScore = timePenalty + importanceWeight + upcomingEventsWeight
```

| Component | Max Points | Logic |
|---|---|---|
| `timePenalty` | 50 | Days overdue based on user-defined contact frequency |
| `importanceWeight` | 30 | VIP=30, High=20, Normal=10 |
| `upcomingEventsWeight` | 20 | Upcoming holidays (15) + birthday soon (20, capped at 20) |

**Urgency levels:** `critical` (>=80), `high` (>=60), `medium` (>=40), `low` (<40)

---

## Holiday Database

`src/data/holidays.ts` — 30+ holidays covering Judaism, Islam, Christianity, Druze, Hinduism, Buddhism, Sikhism, Bahai, East Asian, and Secular traditions. Each holiday includes name, description, greeting guidance, Hebrew/Arabic/English greetings, do/don't lists, and sensitivity notes.

---

## WhatsApp Integration

Uses the `wa.me` URL scheme. **This app never sends messages automatically.** The user must manually tap "Send" in WhatsApp. A warning dialog is shown before opening.

---

## Premium System

Gated via `isPremium` in localStorage.

| Feature | Free | Premium |
|---|---|---|
| Contacts | 20 | Unlimited |
| Groups | 2 | Unlimited |
| Birthday tracking | No | Yes |
| CSV Import | No | Yes |
| VIP templates | No | Yes |
| Internal org mode | Limited | Full |

Demo activation via Settings -> Upgrade -> "Unlock Premium (Demo)".

---

## Theme System

6 built-in themes (Ocean Blue, Forest Green, Sunset Orange, Purple Haze, Rose Gold, Midnight Dark). Uses CSS custom properties. Random theme on first entry; saved preference applied thereafter.

---

## Screens

Onboarding, Dashboard, Calendar, Holiday Detail, Contacts, Contact Detail, Contact Form, Greeting Editor, Groups, Settings, Upgrade, About, Privacy, Terms, What's New, Import (Premium), Birthday Center (Premium), Birthday Greeting (Premium).

---

## Deployment

```bash
# Web build
npm run build  # Output: /dist

# Vercel (vercel.json handles SPA routing)
vercel --prod

# Netlify (netlify.toml handles SPA routing)
netlify deploy --prod --dir=dist
```

## Mobile

```bash
npm run build
npx cap add android && npx cap add ios
npx cap sync
npx cap open android  # or ios
```

---

## Privacy

All data is stored locally on the device. No server, no API calls, no tracking, no analytics, no ads. Files imported are processed entirely locally and never uploaded.

---

## Development

```bash
npm run dev      # Dev server on port 5173
npm run build    # Production build
npm run preview  # Preview build
```

---

## Future Roadmap

- Backend + authentication
- Push notifications (Capacitor)
- AI-generated greetings (Claude API)
- Payment processing (Stripe / App Store IAP)
- Slack and Teams integrations
- Contact sync from phone
- Multi-language UI

---

*NeverMiss v1.0.0 — Privacy-first relationship intelligence*
