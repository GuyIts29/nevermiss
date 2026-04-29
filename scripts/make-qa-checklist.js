// Run with: node scripts/make-qa-checklist.js
// Generates NeverMiss_QA_Checklist.xlsx — recreates if missing, updates statuses from qa_status.json
// Agent 4 runs this after every phase: update agent_state/qa_status.json first, then run this script.

import XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '..')

// ── Category definitions ─────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'lang',    emoji: '🌐', name: 'עברית ו-RTL' },
  { id: 'cal',     emoji: '📅', name: 'לוח שנה עברי' },
  { id: 'fields',  emoji: '📋', name: 'שדות דינמיים לפי קרבה' },
  { id: 'wa',      emoji: '📱', name: 'WhatsApp + תמונה' },
  { id: 'bugs',    emoji: '🐛', name: 'BUG_REPORT ו-Agents' },
  { id: 'ui',      emoji: '🎨', name: 'UI/UX כללי' },
  { id: 'premium', emoji: '💎', name: 'פרמיום / Free Gating' },
  { id: 'integr',  emoji: '🔗', name: 'אינטגרציות' },
  { id: 'sprint4', emoji: '🚀', name: 'Sprint 4 — ייצוא / גיבוי / נגישות / ספרינט' },
  { id: 'sprint5', emoji: '🗂️', name: 'Sprint 5 — ייבוא / קבוצות / ניווט' },
  { id: 'sprint6', emoji: '🔧', name: 'Sprint 6 — תיקוני איכות / Findings 31/49/75/76/84/85/86' },
  { id: 'sprint7', emoji: '🎮', name: 'Sprint 7 — Demo Mode (BL-036) + i18n BirthdayCenterScreen + מחרוזות נגישות' },
  { id: 'sprint8', emoji: '🔧', name: 'Sprint 8 — Stability · Accessibility · RTL/Hebrew Correctness (FINDING 28D, 29A/B/C)' },
]

// ── Test definitions (57 total) ──────────────────────────────────────────────
const TESTS = [
  // 🌐 עברית ו-RTL
  { id: 'T01', cat: 'lang',    name: 'מחוון השפה (toggle) מציג עברית נבחרת' },
  { id: 'T02', cat: 'lang',    name: 'כל הטקסטים עוברים לעברית בלחיצה' },
  { id: 'T03', cat: 'lang',    name: 'פריסת RTL — ניווט, כרטיסים, טפסים מיושרים ימינה' },
  { id: 'T04', cat: 'lang',    name: 'שמות ערכות הנושא מתורגמים' },
  { id: 'T05', cat: 'lang',    name: 'כפתור חזרה — aria-label בעברית' },
  { id: 'T06', cat: 'lang',    name: 'מסך About — כל התוכן בעברית' },
  { id: 'T07', cat: 'lang',    name: 'urgencyLevel — תרגום (קריטי/גבוה/בינוני/נמוך)' },
  { id: 'T08', cat: 'lang',    name: 'interactionFrequency — תרגום (יומי/שבועי/חודשי/רבעוני)' },
  { id: 'T09', cat: 'lang',    name: 'תוויות SuggestedAction בעברית (מסך פרטי קשר)' },
  { id: 'T10', cat: 'lang',    name: 'badge "★ ראשי" בפרטי חג' },

  // 📅 לוח שנה עברי
  { id: 'T11', cat: 'cal',     name: 'תאריך עברי (גמטריה) מוצג מתחת לכל תאריך לועזי' },
  { id: 'T12', cat: 'cal',     name: 'ראש חודש — מציג "א׳ [שם חודש]"' },
  { id: 'T13', cat: 'cal',     name: 'שמות חודשים עבריים מוצגים ב-pill הכותרת' },
  { id: 'T14', cat: 'cal',     name: 'ניווט בין חודשים — נקודות חגים לא מדממות' },
  { id: 'T15', cat: 'cal',     name: 'סינון לפי דת עובד' },
  { id: 'T16', cat: 'cal',     name: 'לחיצה על יום מציגה את חגיו' },
  { id: 'T17', cat: 'cal',     name: 'empty state מוצג כשאין חגים בחודש/יום' },

  // 📋 שדות דינמיים לפי קרבה
  { id: 'T18', cat: 'fields',  name: 'גרדיאנט avatar עקבי בכל המסכים (Dashboard/Contacts/Detail)' },
  { id: 'T19', cat: 'fields',  name: 'badge urgencyLevel מוצג בכרטיס איש קשר' },
  { id: 'T20', cat: 'fields',  name: 'SuggestedAction label נראה ב-ContactDetail' },
  { id: 'T21', cat: 'fields',  name: 'חגים קשורים (relatedHolidays) מוצגים ב-ContactDetail' },
  { id: 'T22', cat: 'fields',  name: 'contact score bar מוצג עם ערך נכון' },
  { id: 'T23', cat: 'fields',  name: 'interactionFrequency מוצג בפרטי קשר' },
  { id: 'T24', cat: 'fields',  name: 'relatedContacts מוצגים בפרטי חג' },

  // 📱 WhatsApp + תמונה
  { id: 'T25', cat: 'wa',      name: 'מספר ישראלי 052-xxx — קישור WhatsApp נפתח נכון' },
  { id: 'T26', cat: 'wa',      name: 'מספר בפורמט 00972xxx — נפתח נכון' },
  { id: 'T27', cat: 'wa',      name: 'מספר טלפון ריק — לא מייצר URL שבור' },
  { id: 'T28', cat: 'wa',      name: 'תמונה מועתקת ל-clipboard אוטומטית בלחיצה על WhatsApp' },
  { id: 'T29', cat: 'wa',      name: 'popup עברי "התמונה הועתקה ללוח" מופיע' },
  { id: 'T30', cat: 'wa',      name: 'popup נשאר עד ללחיצת "סיום"' },
  { id: 'T31', cat: 'wa',      name: 'ערוצים נוספים — SMS / Email / Copy / Share' },
  { id: 'T32', cat: 'wa',      name: 'שמירת טיוטה שומרת הודעה (ללא צרופה — known)' },
  { id: 'T33', cat: 'wa',      name: 'MediaAttachmentPicker — תמונה/קול (Premium)' },

  // 🐛 BUG_REPORT ו-Agents
  { id: 'T34', cat: 'bugs',    name: 'BUG_REPORT.md מתעדכן אחרי כל שינוי' },
  { id: 'T35', cat: 'bugs',    name: 'npm run build עובר ללא שגיאות' },
  { id: 'T36', cat: 'bugs',    name: 'npm run lint עובר ללא שגיאות' },
  { id: 'T37', cat: 'bugs',    name: 'changelog.xlsx מכיל רשומות עדכניות' },
  { id: 'T38', cat: 'bugs',    name: 'iteration_log.md מעודכן' },
  { id: 'T39', cat: 'bugs',    name: 'DST birthday bug — getBirthdayDaysUntil' },
  { id: 'T40', cat: 'bugs',    name: 'key={i} ב-ImportContactsScreen rows' },
  { id: 'T41', cat: 'bugs',    name: 'setImporting(false) לא ב-finally' },

  // 🎨 UI/UX כללי
  { id: 'T42', cat: 'ui',      name: 'ErrorBoundary מונע מסך לבן על crash' },
  { id: 'T43', cat: 'ui',      name: 'ContactCard ניגש למקלדת + Enter פותח פרטים' },
  { id: 'T44', cat: 'ui',      name: 'טבעת focus-visible על כרטיסי קשר' },
  { id: 'T45', cat: 'ui',      name: 'כרטיסי Dashboard/Groups — ניגשים למקלדת (div→button)' },
  { id: 'T46', cat: 'ui',      name: '.btn — טבעת focus-visible' },
  { id: 'T47', cat: 'ui',      name: 'Modal — focus trap (Tab כלוא בתוך המודל)' },
  { id: 'T48', cat: 'ui',      name: 'כפתור סגירת Modal — aria-label בעברית' },

  // 💎 פרמיום / Free Gating
  { id: 'T49', cat: 'premium', name: 'Free tier — מוגבל ל-20 אנשי קשר' },
  { id: 'T50', cat: 'premium', name: 'Premium banner מופיע בחריגה מ-20' },
  { id: 'T51', cat: 'premium', name: 'קופון NEVERMISS1 — מפעיל Premium חודש' },
  { id: 'T52', cat: 'premium', name: 'קופון לא ניתן לשימוש חוזר' },
  { id: 'T53', cat: 'premium', name: 'Premium expiry date מוצג ב-Settings' },
  { id: 'T54', cat: 'premium', name: 'MediaAttachmentPicker — נעול ל-free (lock icon)' },
  { id: 'T55', cat: 'premium', name: 'Import contacts — נעול ל-free' },

  // 🔗 אינטגרציות
  { id: 'T56', cat: 'integr',  name: 'Supabase placeholder stub מוכן ל-v2' },
  { id: 'T57', cat: 'integr',  name: 'PayMe + Claude AI placeholders מוכנים ל-v2' },
  { id: 'T60', cat: 'integr',  name: 'DeviceContactsScreen — ייבוא מאנשי קשר של המכשיר (Capacitor)' },

  // 🚀 Sprint 4
  { id: 'T58', cat: 'sprint4', name: 'celebrationType שדה בקשר — סינון חגים לפי סוג חגיגה' },
  { id: 'T59', cat: 'sprint4', name: 'התראה לאיש קשר שלא דיברו עמו 45 יום + יום הולדת קרוב' },
  { id: 'T61', cat: 'sprint4', name: 'BUG-043: נקודות חגים מרובי-ימים (סוכות/חנוכה) בלוח שנה' },
  { id: 'T62', cat: 'sprint4', name: 'BUG-044: סוכות 2026 נוסף ל-holidays.ts' },
  { id: 'T63', cat: 'sprint4', name: 'BL-025: ייצוא אנשי קשר ל-CSV (Premium)' },
  { id: 'T64', cat: 'sprint4', name: 'BL-029: כל כפתורי icon-only ≥ 48×48px (WCAG 2.5.5)' },
  { id: 'T65', cat: 'sprint4', name: 'BL-024: haptic feedback — שמירת קשר / שליחת ברכה / קופון' },
  { id: 'T66', cat: 'sprint4', name: 'BL-034: גיבוי ושחזור JSON (ייצוא/ייבוא כל הנתונים)' },
  { id: 'T67', cat: 'sprint4', name: 'BL-035: זיהוי קשר כפול — שם זהה או מספר טלפון זהה' },

  // 🗂️ Sprint 5
  { id: 'T68', cat: 'sprint5', name: 'BL-046: כפתור ייבוא ב-ContactsScreen (Premium) + empty-state shortcut' },
  { id: 'T69', cat: 'sprint5', name: 'BL-047: תוויות CSV בלבד ב-ImportContactsScreen' },
  { id: 'T70', cat: 'sprint5', name: 'BL-048: כפתור import מהמכשיר כ-Blue gradient card' },
  { id: 'T71', cat: 'sprint5', name: 'BL-049: מחוון tab פעיל — נקודה / אייקון גדול / טקסט עבה' },
  { id: 'T72', cat: 'sprint5', name: 'BL-052: purpose selector בקבוצה + הצעות חגים אוטומטיות' },
  { id: 'T73', cat: 'sprint5', name: 'BL-050: שיוך אנשי קשר מיובאים לקבוצה בשלב done' },
  { id: 'T74', cat: 'sprint5', name: 'BL-051: הורדת תבנית CSV עם כותרות עבריות' },

  // 🔧 Sprint 6
  { id: 'T75', cat: 'sprint6', name: 'FINDING 86: SUGGESTED_BASES חולץ ל-src/data/groupSuggestions.ts' },
  { id: 'T76', cat: 'sprint6', name: 'FINDING 75/87: applyPurpose מנקה holidays של קטגוריה קודמת' },
  { id: 'T77', cat: 'sprint6', name: 'FINDING 31: MediaAttachmentPicker — "1:00" מיותר הוסר' },
  { id: 'T78', cat: 'sprint6', name: 'FINDING 49: Send to Group מנווט ל-/greeting עם contactId+holidayId' },
  { id: 'T79', cat: 'sprint6', name: 'FINDING 76/81: findDuplicate בודקת עריכה + self-exclusion' },
  { id: 'T80', cat: 'sprint6', name: 'FINDING 84/85: group assign try/catch + hidden when 0 imported' },

  // 🎮 Sprint 7
  { id: 'T81', cat: 'sprint7', name: 'BL-036: src/data/demoData.ts — 6 אנשי קשר + 2 קבוצות דוגמה' },
  { id: 'T82', cat: 'sprint7', name: 'BL-036: isDemoMode/enableDemoMode/clearDemoMode — ניתוב ל-nm_demo_* keys' },
  { id: 'T83', cat: 'sprint7', name: 'BL-036: כפתור Try Demo ב-Onboarding + DemoBanner + Exit בהגדרות' },
  { id: 'T84', cat: 'sprint7', name: 'BL-036: נתוני משתמש אמיתיים לא נפגעים במצב הדגמה' },
  { id: 'T85', cat: 'sprint7', name: 'i18n: 7 מחרוזות BirthdayCenterScreen ב-t() — hero, subtitle, count, noneTracked, badge, itsTheirBirthday, day/days' },
  { id: 'T86', cat: 'sprint7', name: 'i18n: contacts_addContact / calendar_prevMonth+nextMonth / groups_searchHolidays / dashboard_isTomorrow+prepareGreetings / greeting_copy' },
  { id: 'T87', cat: 'sprint7', name: 'i18n: מפתחות demo_banner/loadData/clear/clearConfirm/cleared ב-EN+HE' },
  { id: 'T88', cat: 'sprint7', name: 'QA end-to-end: Onboarding → Try Demo → DemoBanner → Settings exit; RTL; בידוד נתונים' },

  // 🔧 Sprint 8
  { id: 'T89', cat: 'sprint8', name: 'FINDING 28D: dir(langCode) ב-i18n; GreetingRow dir attribute מחושב לפי langCode' },
  { id: 'T90', cat: 'sprint8', name: 'FINDING 29A: תווית Avatar Color מוחלפת ב-t(contactForm_avatarColor) — EN/HE' },
  { id: 'T91', cat: 'sprint8', name: 'FINDING 29B: aria-label על כפתור Auto gradient — WCAG 4.1.2 תוקן' },
  { id: 'T92', cat: 'sprint8', name: 'FINDING 29C: PremiumFeaturePrompt feature — t(premium_feat_birthday_fields) כבר קיים' },
  { id: 'T93', cat: 'sprint8', name: 'Sprint 8 QA: build נקי + lint נקי אחרי כל תיקוני Sprint 8' },
]

// ── Load statuses ─────────────────────────────────────────────────────────────
const statusPath = path.join(ROOT, 'agent_state', 'qa_status.json')
let statusMap = {}
if (fs.existsSync(statusPath)) {
  statusMap = JSON.parse(fs.readFileSync(statusPath, 'utf-8'))
}

const getStatus  = id => statusMap[id]?.status  ?? '☐'
const getNotes   = id => statusMap[id]?.notes   ?? ''

// ── Build rows (array-of-arrays) ──────────────────────────────────────────────
// Columns: A=emoji, B=test name, C=status, D=notes
const aoa = [
  // Header
  ['', 'בדיקה', 'סטטוס', 'הערות'],
]

for (const cat of CATEGORIES) {
  // Category separator row
  aoa.push([cat.emoji, cat.name, '', ''])
  // Test rows for this category
  for (const test of TESTS.filter(t => t.cat === cat.id)) {
    aoa.push([cat.emoji, test.name, getStatus(test.id), getNotes(test.id)])
  }
}

// ── Build worksheet ───────────────────────────────────────────────────────────
const ws = XLSX.utils.aoa_to_sheet(aoa)

// Column widths
ws['!cols'] = [
  { wch: 4  },  // A — emoji bar
  { wch: 52 },  // B — test name
  { wch: 8  },  // C — status
  { wch: 80 },  // D — notes
]

// Freeze header row
ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft' }

// Auto-filter on header row
const lastRow = aoa.length
ws['!autofilter'] = { ref: `A1:D${lastRow}` }

// ── Finalize and write ─────────────────────────────────────────────────────────
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'QA Checklist')

const outPath = path.join(ROOT, 'NeverMiss_QA_Checklist.xlsx')
XLSX.writeFile(wb, outPath)

// ── Summary ────────────────────────────────────────────────────────────────────
const passed  = TESTS.filter(t => getStatus(t.id) === '✅').length
const failed  = TESTS.filter(t => getStatus(t.id) === '❌').length
const partial = TESTS.filter(t => getStatus(t.id) === '⚠️').length
const pending = TESTS.filter(t => getStatus(t.id) === '☐').length

console.log(`✅ NeverMiss_QA_Checklist.xlsx written — ${TESTS.length} tests`)
console.log(`   ✅ ${passed} passed  |  ❌ ${failed} failed  |  ⚠️  ${partial} partial  |  ☐ ${pending} pending`)
