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
