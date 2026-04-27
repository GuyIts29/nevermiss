// Run with: node scripts/make-changelog.js
// Generates changelog.xlsx in the project root

import XLSX from 'xlsx'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATE = '2026-04-27'

const rows = [
  // ── Initial UI/UX pass (Main session) ────────────────────────────────────────
  {
    Date: DATE,
    'Screen / File': 'src/index.css',
    'Change Description': 'Complete CSS overhaul: gradient .btn-primary, card default box-shadow, page fade-in animation on screen mount, drag-handle-aware .bottom-nav with gradient active pill, new keyframes (pageFadeIn, shimmer, celebrate, confettiBurst, staggerIn, float), .skeleton shimmer loading class, .score-bar-track/.score-bar-fill for contact score bars, .tier-card and .message-preview for greeting editor, stagger-1–5 entrance delay classes, desktop background gradient, backdrop blur for modals',
    Type: 'improvement',
    Agent: 'Main',
  },
  {
    Date: DATE,
    'Screen / File': 'src/data/themes.ts',
    'Change Description': 'Made all 6 themes more vibrant: ocean secondary #06B6D4, forest secondary #4ADE80, sunset primary #F97316 + secondary #FBBF24, purple primary #8B5CF6 + secondary #C084FC, rose primary #F43F5E + secondary #FB7185, midnight primary #818CF8 + secondary #A5B4FC + darker background #080818. Stronger shadow opacities (0.16–0.22).',
    Type: 'improvement',
    Agent: 'Main',
  },
  {
    Date: DATE,
    'Screen / File': 'src/components/ContactCard.tsx',
    'Change Description': 'Replaced solid avatar background with 10-option gradient palette (name-hashed). Added urgency-tinted card background glow. Added horizontal score progress bar (.score-bar-track/.score-bar-fill) below contact info. Added staggerIndex prop for staggered list entrance animations. Urgency badge now uses colored pill instead of Badge component.',
    Type: 'improvement',
    Agent: 'Main',
  },
  {
    Date: DATE,
    'Screen / File': 'src/components/HolidayCard.tsx',
    'Change Description': 'Compact view: gradient-tinted background + left color border using holiday.color. Badge turns solid holiday-color on "Today". Full view: gradient color header strip with white text, emoji gets animate-float class, body text moved below header. Added hexToRgb helper for rgba tinting. Added staggerIndex prop.',
    Type: 'improvement',
    Agent: 'Main',
  },
  {
    Date: DATE,
    'Screen / File': 'src/components/Navigation.tsx',
    'Change Description': 'BottomNav: active item gets gradient mini-pill background div + drop-shadow on icon, uses useTheme() for gradient colors, active label gets font-bold. PageHeader: font upgraded to font-extrabold tracking-tight. Back button has active:scale-90 press effect.',
    Type: 'improvement',
    Agent: 'Main',
  },
  {
    Date: DATE,
    'Screen / File': 'src/screens/DashboardScreen.tsx',
    'Change Description': 'Added "Today\'s Highlights" section showing today\'s holiday and birthday cards with color-tinted gradient backgrounds. Enhanced welcome hero with decorative circles and font-extrabold heading. Gradient FAB button with theme colors. Stats cards now have gradient icon circles. Tomorrow holiday preview card at bottom. All contact/holiday lists receive staggerIndex for entrance animations.',
    Type: 'feature',
    Agent: 'Main',
  },
  {
    Date: DATE,
    'Screen / File': 'src/screens/GreetingEditorScreen.tsx',
    'Change Description': 'Full screen redesign. Added 3-tier visual selector (Casual 😊 / Professional 💼 / VIP 👑) as side-by-side .tier-card buttons with tier-color borders and glow. Added live message preview in chat-bubble style (.message-preview) with RTL support for Hebrew. Added character count display (color changes at 75%/90% of 500). Added signature line toggle (pen icon) with input and preview text. Added collapsible advanced tone/dropdown. Celebration confetti on copy. Editor header shows active tier emoji and contact first name.',
    Type: 'feature',
    Agent: 'Main',
  },
  {
    Date: DATE,
    'Screen / File': 'src/services/greetingService.ts',
    'Change Description': 'Enriched all tone templates with emoji. Hebrew templates rewritten for authentic Israeli casual voice (not translated English). VIP templates now premium-letter quality with 🌹. Friendly Hebrew: expressions like "עלית לי בראש", "סתם חשבתי עליך". Birthday greetings expanded with emoji for all languages including French and Spanish.',
    Type: 'improvement',
    Agent: 'Main',
  },

  // ── Proactive improvements (Main session) ─────────────────────────────────────
  {
    Date: DATE,
    'Screen / File': 'src/components/ui/Modal.tsx',
    'Change Description': 'Added visible drag handle bar at top (mobile UX best practice). Backdrop now uses blur(6px) + rgba(0,0,0,0.55). Added danger prop for red title text. Added aria-labelledby for accessibility. Fixed missing shadow class (was shadow-theme-xl which doesn\'t exist). Backdrop click still closes. ESC key support retained.',
    Type: 'improvement',
    Agent: 'Main',
  },
  {
    Date: DATE,
    'Screen / File': 'src/components/WhatsAppButton.tsx',
    'Change Description': 'Bug fix: was using hardcoded English strings instead of i18n t() keys (whatsapp_btn, whatsapp_title, whatsapp_warning, whatsapp_notice, whatsapp_preview, whatsapp_open). Replaced Button component with native button using authentic WhatsApp green gradient (#25D366→#128C7E) with green glow shadow. Modal preview improved with amber-tinted warning box.',
    Type: 'bugfix',
    Agent: 'Main',
  },
  {
    Date: DATE,
    'Screen / File': 'src/screens/ContactFormScreen.tsx',
    'Change Description': 'Avatar section redesigned: live gradient preview circle updates as name is typed (name-hashed gradient). Added "auto gradient" option (✦ button) alongside solid color swatches. Section headers now have colored gradient icon squares (User/Globe/BarChart2/Crown icons). Premium section gets amber left border. Save bar uses gradient fade instead of solid background. Added autoFocus on name field for new contacts. Modal uses new danger prop.',
    Type: 'improvement',
    Agent: 'Main',
  },
  {
    Date: DATE,
    'Screen / File': 'src/screens/WhatsNewScreen.tsx',
    'Change Description': 'Redesigned as vertical timeline with animated gradient connector line. Version dots styled as gradient circles (latest = primary gradient, older = muted). Hero banner at top with latest version and animate-float emoji. Change type badges now use gradient backgrounds (feature=blue-purple, improvement=green, bugfix=orange, security=purple). "Latest" pill uses theme gradient.',
    Type: 'improvement',
    Agent: 'Main',
  },
  {
    Date: DATE,
    'Screen / File': 'src/screens/AboutScreen.tsx',
    'Change Description': 'Hero section replaced with full gradient banner (primary→secondary) with floating 💌 emoji. Core values section: each value now has a gradient icon circle (Shield=purple, Globe=teal, Heart=rose, Zap=amber). Technical details table replaced with icon+pill layout for each privacy fact. Important notice uses amber-tinted box.',
    Type: 'improvement',
    Agent: 'Main',
  },

  // ── UI Agent (parallel subagent) ─────────────────────────────────────────────
  {
    Date: DATE,
    'Screen / File': 'src/components/EmptyState.tsx',
    'Change Description': 'Icon container upgraded to large gradient circle (theme.primary→theme.secondary at 33–55% alpha) using useTheme(). Added animate-float on the icon. Title font upgraded from font-semibold to font-bold text-lg.',
    Type: 'improvement',
    Agent: 'UI Agent',
  },
  {
    Date: DATE,
    'Screen / File': 'src/components/ui/Badge.tsx',
    'Change Description': 'All badge variants now have gradient backgrounds via inline style. premium=gold gradient (#F59E0B→#F97316), success=green gradient, warning=amber gradient, danger=red gradient, info=blue gradient, neutral=surface gradient. All existing props/variants preserved.',
    Type: 'improvement',
    Agent: 'UI Agent',
  },
  {
    Date: DATE,
    'Screen / File': 'src/screens/OnboardingScreen.tsx',
    'Change Description': 'Slide icon area replaced with large w-32 h-32 gradient circle (per-slide colors, animate-float). Title and description get animate-slide-up stagger-2/3 classes. Progress dots: active dot uses theme gradient background, wider pill shape, scaleY animation. Next/Get Started button uses inline gradient matching theme.',
    Type: 'improvement',
    Agent: 'UI Agent',
  },
  {
    Date: DATE,
    'Screen / File': 'src/screens/ContactsScreen.tsx',
    'Change Description': 'Search bar gets shadow-md ring elevation. Filter chips (All/External/Internal/VIP) use theme gradient when active with shadow-sm. ContactCard receives staggerIndex={i % 5} for entrance animations. FAB uses theme gradient + hover:scale-105 / active:scale-95. Add button in header uses gradient when contacts can be added.',
    Type: 'improvement',
    Agent: 'UI Agent',
  },
  {
    Date: DATE,
    'Screen / File': 'src/screens/ContactDetailScreen.tsx',
    'Change Description': 'Profile area replaced with full-width gradient banner (theme.primary→theme.secondary). Avatar upgraded to w-20 h-20 gradient circle with ring-4 ring-white/20. Relationship score shows SVG ring arc (circumference trick) in urgency color with score number centered. Contact info rows get divide-y separation with icon badge backgrounds. Greeting action button uses native gradient button.',
    Type: 'improvement',
    Agent: 'UI Agent',
  },
  {
    Date: DATE,
    'Screen / File': 'src/screens/CalendarScreen.tsx',
    'Change Description': 'Month name shown in gradient-tinted pill. Active/today day cells use theme gradient background. Religion filter chips use religion-specific colors when active (not generic primary). "All" chip uses theme gradient when active.',
    Type: 'improvement',
    Agent: 'UI Agent',
  },
  {
    Date: DATE,
    'Screen / File': 'src/screens/GroupsScreen.tsx',
    'Change Description': 'Group cards: left border in group.color + gradient background tint using group.color. Emoji circle upgraded to w-12 h-12 with gradient. Contact/holiday counts shown as colored pill badges using group.color. Header "New" button uses theme gradient.',
    Type: 'improvement',
    Agent: 'UI Agent',
  },
  {
    Date: DATE,
    'Screen / File': 'src/screens/SettingsScreen.tsx',
    'Change Description': 'Section headers: gradient icon squares with lucide icons. Language toggle: sliding pill indicator animates between EN/HE with gradient active state. Theme picker: swatches enlarged to h-14, active theme gets checkmark overlay + glow ring shadow. Premium section: gold/amber gradient banner when active. Danger zone: red-tinted background.',
    Type: 'improvement',
    Agent: 'UI Agent',
  },

  // ── Greeting Template Agent (parallel subagent) ────────────────────────────────
  {
    Date: DATE,
    'Screen / File': 'src/services/greetingService.ts',
    'Change Description': 'Expanded all tone/language templates to 4–7 variants each. Added HOLIDAY_SPECIFIC_BODIES lookup table with custom templates for: rosh-hashana, yom-kippur, hanukkah, passover, eid-al-fitr, eid-al-adha, christmas — each with friendly/business/formal/vip and hebrew/arabic/english variants. buildHolidayBody() now checks specific overrides first before falling back to generic logic. Added holidayBaseKey() helper to strip year suffix from holiday IDs.',
    Type: 'improvement',
    Agent: 'Greeting Agent',
  },
  {
    Date: DATE,
    'Screen / File': 'src/services/greetingService.ts (type fix)',
    'Change Description': 'Fixed TypeScript syntax error introduced by Greeting Agent: extra trailing > in HOLIDAY_SPECIFIC_BODIES type annotation (Partial<Record<...>>>>>> > should be >>>>>>). Caused 80+ cascading TS1005/TS1109 errors.',
    Type: 'bugfix',
    Agent: 'Main',
  },

  // ── Session 2 continuations ───────────────────────────────────────────────────
  {
    Date: DATE,
    'Screen / File': 'scripts/make-changelog.js',
    'Change Description': 'Fixed ES module incompatibility: converted require() calls to import statements and added __dirname shim via fileURLToPath(import.meta.url). Package.json has "type":"module" which broke CommonJS require syntax.',
    Type: 'bugfix',
    Agent: 'Main',
  },
  {
    Date: DATE,
    'Screen / File': 'src/screens/HolidayDetailScreen.tsx',
    'Change Description': 'Full redesign. Hero: full-width gradient banner using holiday.color with animate-float emoji, white text pills for date/religion/major. Cards get holiday-colored icon headers (BookOpen, MessageCircle, Lightbulb, AlertTriangle, Users). GreetingRow: tinted lang label in holiday.color instead of plain muted. Do/Don\'t: green-tinted / red-tinted card backgrounds with borders. Sensitivity: amber left-border card. Related contacts: gradient avatar circles with holiday-tinted row backgrounds. Action button: full gradient in holiday.color with matching glow shadow. Added hexToRgb helper.',
    Type: 'improvement',
    Agent: 'Main',
  },
  {
    Date: DATE,
    'Screen / File': 'src/screens/PrivacyScreen.tsx',
    'Change Description': 'Complete redesign. Added gradient hero banner (theme.primary→secondary) with animate-float 🔒 emoji and privacy tagline pill. Each of the 10 sections now has a unique icon (Lock, Shield, BarChart2, Eye, MessageCircle, FileUp, WifiOff, Smartphone, RefreshCw, Mail) with a color-tinted rounded square badge. Replaced plain Card component with icon+text layout. Added footer note.',
    Type: 'improvement',
    Agent: 'Main',
  },
  {
    Date: DATE,
    'Screen / File': 'src/screens/TermsScreen.tsx',
    'Change Description': 'Complete redesign matching PrivacyScreen style. Added gradient hero with animate-float 📋 emoji. Each of the 10 sections has a unique icon (FileText, CheckCircle, AlertTriangle, MessageCircle, Calendar, CreditCard, HardDrive, Scale, Gavel, RefreshCw) with color-tinted badge. Section titles now font-extrabold.',
    Type: 'improvement',
    Agent: 'Main',
  },
]

const wb = XLSX.utils.book_new()
const ws = XLSX.utils.json_to_sheet(rows, {
  header: ['Date', 'Screen / File', 'Change Description', 'Type', 'Agent'],
})

// Column widths
ws['!cols'] = [
  { wch: 12 },   // Date
  { wch: 45 },   // Screen/File
  { wch: 120 },  // Change Description
  { wch: 14 },   // Type
  { wch: 18 },   // Agent
]

XLSX.utils.book_append_sheet(wb, ws, 'Changelog')
const outPath = path.join(__dirname, '..', 'changelog.xlsx')
XLSX.writeFile(wb, outPath)
console.log('✅ changelog.xlsx written to', outPath, `(${rows.length} entries)`)
