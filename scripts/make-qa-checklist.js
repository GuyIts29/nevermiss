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
  { id: 'sprint9', emoji: '💳', name: 'Sprint 9 — Holiday Reminders (BL-059) + PayMe Payment UI (BL-032)' },
  { id: 'sprint10', emoji: '🤖', name: 'Sprint 10 — AI Suggestions MVP (BL-033) + Secular/National Dates (BL-060)' },
  { id: 'sprint11', emoji: '✉️', name: 'Sprint 11 — Quick Send (BL-064) + Auto-Regenerate on Tone (BL-063) + UpgradeScreen CTA Fix (BL-062)' },
  { id: 'sprint12', emoji: '🪪', name: 'Sprint 12 — Personal User Layer (BL-067) + AI Personalization MVP (BL-065)' },
  { id: 'bugfix',  emoji: '🐞', name: 'Bug Fixes & Improvements — Sprint Suspension Mode' },
  { id: 'sprint14', emoji: '⚡', name: 'Sprint 14 — חגים דינמיים BL-077 (Hebcal)' },
  { id: 'sprint15', emoji: '📥', name: 'Sprint 15 — ייבוא אנשי קשר UX: BL-046, BL-047, BL-048' },
  { id: 'sprint16', emoji: '👤', name: 'Sprint 16 — שכבת משתמש אישית BL-067: UserSetupScreen, dashboard_hello, pendingItems' },
  { id: 'sprint17', emoji: '🔧', name: 'Sprint 17 — BL-075: תיקוני BugHunter' },
  { id: 'sprint18', emoji: '📱', name: 'Sprint 18 — RTL icons, contact card overflow, BottomNav active indicator' },
  { id: 'sprint19', emoji: '🌐', name: 'Sprint 19 — BL-079: Language-Religion drilldown + CSV localization' },
  { id: 'sprint20', emoji: '📅', name: 'Sprint 20 — BL-076: Hebrew Birthday import/export round-trip' },
  { id: 'sprint21', emoji: '👥', name: 'Sprint 21 — BL-084/082/068/069: Import fix, Score tooltip, Group members, Assign group' },
  { id: 'sprint22', emoji: '📦', name: 'Sprint 22 — BL-092/090/091: Import celebrationType + hebrewBirthday + export warning' },
  { id: 'sprint23', emoji: '🧹', name: 'Sprint 23 — BL-086/088/087: Group delete cleanup, subtitle fix, group filter chip' },
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

  // 💳 Sprint 9
  { id: 'T94', cat: 'sprint9', name: 'BL-059: reminderService — getReminderSettings/saveReminderSettings/hasBeenReminded/markReminded' },
  { id: 'T95', cat: 'sprint9', name: 'BL-059: HolidayRemindersScreen — toggle, days ahead, 4 channels, upcoming list, save' },
  { id: 'T96', cat: 'sprint9', name: 'BL-059: free users see PremiumFeaturePrompt; premium users see full config' },
  { id: 'T97', cat: 'sprint9', name: 'BL-059: dedup — אותו contactId:holidayId לא יקבל תזכורת פעמיים באותו יום' },
  { id: 'T98', cat: 'sprint9', name: 'BL-032: PaymeScreen — plan picker, form, CTA, error handling, already-premium state' },
  { id: 'T99', cat: 'sprint9', name: 'BL-032: UpgradeScreen → /payment; SettingsScreen → Holiday Reminders entry' },
  { id: 'T100', cat: 'sprint9', name: 'Sprint 9 QA: build נקי + lint נקי; שני מסכים נטענים כ-lazy chunks' },

  // 🤖 Sprint 10
  { id: 'T101', cat: 'sprint10', name: 'BL-033: aiSuggestionsService — 3 options per tone×holiday×lang (casual/professional/vip, EN/HE/AR)' },
  { id: 'T102', cat: 'sprint10', name: 'BL-033: AI Suggestions button in GreetingEditorScreen — premium gate (PRO badge → /upgrade for free users)' },
  { id: 'T103', cat: 'sprint10', name: 'BL-033: selecting a suggestion populates message field; panel closes; Use this button per option' },
  { id: 'T104', cat: 'sprint10', name: 'BL-033: premium user sees purple AI button; generates 3 distinct options with 400ms delay' },
  { id: 'T105', cat: 'sprint10', name: 'BL-060: 5 secular/national dates added — Holocaust Intl (Jan 27), Yom HaShoah, Yom HaZikaron, US Memorial Day, US Independence Day' },
  { id: 'T106', cat: 'sprint10', name: 'BL-060: all new dates under religion: Secular; greetings EN+HE; sensitivity notes on memorial days; build+lint pass' },

  // ✉️ Sprint 11
  { id: 'T107', cat: 'sprint11', name: 'BL-063 / BUG-047: useEffect([tone]) — שינוי tier מחולל generate() מחדש אוטומטית ב-GreetingEditorScreen' },
  { id: 'T108', cat: 'sprint11', name: 'BL-063 / BUG-048: תבניות עברית friendly תוקנו — "לברר"→"לדעת", "שכל טוב"→"שיהיה הכל טוב"' },
  { id: 'T109', cat: 'sprint11', name: 'BL-062 / BUG-045: UpgradeScreen CTA — t("upgrade_cta") במקום t("payme_goPayMe"); גנרי ולא תלוי ספק' },
  { id: 'T110', cat: 'sprint11', name: 'BL-062 / BUG-046: upgrade_unlockEverything HE = "שדרג לפרמיום"; upgrade_cta EN/HE נוסף ל-i18n' },
  { id: 'T111', cat: 'sprint11', name: 'BL-064: כפתור "שלח ברכה" על כרטיסי ימי הולדת + קבוצה; premium → Quick Send; free → /greeting' },
  { id: 'T112', cat: 'sprint11', name: 'BL-064: Quick Send overlay — 3 options AI; WhatsApp/Copy/Open Editor לכל option; backdrop סגירה; copied feedback 2s' },
  { id: 'T113', cat: 'sprint11', name: 'Sprint 11 QA: build נקי + lint נקי; BL-062, BL-063, BL-064 מאומתים' },

  // 🪪 Sprint 12
  { id: 'T114', cat: 'sprint12', name: 'BL-067: userProfileService — getUserName/saveUserName/isProfileSetup; nm_user_name ב-localStorage' },
  { id: 'T115', cat: 'sprint12', name: 'BL-067: UserSetupScreen — שאלת שם + CTA "יאללה נתחיל" + קישור דלג; מנווט ל-/dashboard' },
  { id: 'T116', cat: 'sprint12', name: 'BL-067: App.tsx route /setup + redirect: onboarding→setup→dashboard לפי localStorage' },
  { id: 'T117', cat: 'sprint12', name: 'BL-067: Dashboard hero — "היי {name}" כשיש שם; pending count; כפתור "שלח ברכה עכשיו"' },
  { id: 'T118', cat: 'sprint12', name: 'BL-067 UX: pending greetings panel — כל item קליקבילי → Quick Send (BL-064)' },
  { id: 'T119', cat: 'sprint12', name: 'BL-065 MVP: PROFESSIONAL_RELATIONSHIPS → resolveTone מחזיר professional מינימום; VIP נשמר' },
  { id: 'T120', cat: 'sprint12', name: 'Sprint 12 QA: build נקי + lint נקי; BL-067 + BL-065 מאומתים' },
  { id: 'T121', cat: 'bugfix',  name: 'RTL לוח שנה: חצים מוחלפים בעברית (prev=ימין, next=שמאל); LTR ללא שינוי' },
  { id: 'T122', cat: 'bugfix',  name: 'יום הולדת עברי: dropdown גמטריה; תצוגה כ״א בטבת; Hebrew+Gregorian — 2 אירועים עצמאיים' },
  { id: 'T123', cat: 'bugfix',  name: 'BUG-049: PaymeScreen demo mode — באנר הדגמה + כפתור הפעל פרימיום; לא נדרש תשלום אמיתי' },
  { id: 'T124', cat: 'bugfix',  name: 'BUG-059: Google Translate — translate=no + notranslate על html ו-root מונעים תרגום אוטומטי' },
  { id: 'T125', cat: 'bugfix',  name: 'BUG-060: תיאורי חגים בעברית — heDescription ב-46 חגים; HolidayDetailScreen מציג עברית כשheLang' },
  { id: 'T126', cat: 'bugfix',  name: 'BUG-061: קבוצות — רשימת חגים ללא כפילויות; שמות עבריים; דת מתורגמת' },
  { id: 'T127', cat: 'bugfix',  name: 'BUG-074: Input — מיקום אייקון RTL-aware (ימין בעברית, שמאל באנגלית); ריפוד מותאם' },
  { id: 'T128', cat: 'bugfix',  name: 'BUG-075: PrivacyScreen — 10 סעיפים + hero/badge/intro/footer מתורגמים לעברית (25 מפתחות i18n)' },
  { id: 'T129', cat: 'bugfix',  name: 'BUG-076: מחלקות CSS פיזיות (ml-*/mr-*/text-right) הוחלפו במחלקות לוגיות (ms-*/me-*/text-end) ב-6 קבצים' },
  { id: 'T130', cat: 'bugfix',  name: 'BUG-077: WhatsApp emoji encoding — אומת: encodeURIComponent קיים ב-buildWhatsAppUrl; כל נתיבי השליחה מוסדרים דרכו' },
  { id: 'T131', cat: 'bugfix',  name: 'BUG-078: Voice message — Modal "צירוף ידני" מוצג לאחר פתיחת WhatsApp כשיש הקלטה; RTL; נשאר עד סגירה ידנית' },
  { id: 'T132', cat: 'bugfix',  name: "BUG-079: 14 חגים יהודיים חסרים נוספו — ל\"ג בעומר, שמחת תורה, תשעה באב, י\"ז בתמוז, י' בטבת, תענית אסתר, צום גדליה (2025+2026); hebcalDate(); type fast/minor/major" },
  { id: 'T133', cat: 'bugfix',  name: 'BUG-080: כפילויות חגים ב-Event Type dropdown — useMemo dedup by name (upcoming-first) ב-GreetingEditorScreen' },
  { id: 'T134', cat: 'feature', name: "BL-064: שליחה מהירה — ChannelPicker ב-Quick Send Panel; כפתור 'שלח ברכה' על כרטיסי חג היום/מחר; 2 מפתחות i18n EN+HE" },
  { id: 'T135', cat: 'sprint14', name: 'BL-077: חגים יהודיים דינמיים — 17 תבניות Hebcal; YEAR_RANGE=[שנה-1..שנה+2]; IDs ו-Holiday interface זהים; build+lint ✅' },
  { id: 'T136', cat: 'sprint15', name: 'BL-046: כפתור ייבוא אנשי קשר מוצג בכרטיסיית אנשי קשר לכל המשתמשים; גייט Premium נשמר בנתיב /import' },
  { id: 'T137', cat: 'sprint15', name: 'BL-047: תווית "כרגע ניתן לייבא קובץ CSV בלבד" מוצגת ליד אזור ההעלאה ב-ImportContactsScreen; תרגום עברי קיים' },
  { id: 'T138', cat: 'sprint15', name: 'BL-048: כרטיסיית ייבוא ממכשיר (גרדיאנט כחול, סמארטפון) מוצגת בראש ImportContactsScreen; נגישות ויזואלית מלאה' },
  { id: 'T139', cat: 'sprint16', name: 'BL-067: UserSetupScreen first-launch, nm_user_name persist, dashboard_hello/pending/first_greeting EN+HE, pendingItems clickable, empty states graceful; DoD מלא ✅' },
  { id: 'T140', cat: 'bugfix',  name: 'BUG-081: showPremiumUI=!TEMP_PREMIUM_UNLOCK — Crown + "פרמיום" מוסתרים ב-ContactForm ו-Settings כשגייט MVP פתוח; הפיכה ל-false משחזרת הכל' },
  { id: 'T141', cat: 'bugfix',  name: 'BL-080/BUG-082: parseDateLocal() מחליף new Date(string) — מונע הסטת UTC ב-Asia/Jerusalem; safeguards לתאריך חסר/לא תקין; Hebcal Israel mode אומת כנכון' },
  { id: 'T142', cat: 'sprint18', name: 'BL-081: ImportContactsScreen — 3 ArrowRight הוחלפו ב-lang==="he" ? ArrowLeft : ArrowRight; כפתור מכשיר, הורד תבנית, עמודת מיפוי כולם RTL-נכון' },
  { id: 'T143', cat: 'sprint18', name: 'BL-075: ContactCard — 3-dot MoreVertical menu; Edit מנווט לטופס; Delete פותח confirm modal; סגירה על-ידי outside click + Escape; aria-label; dropdown RTL-aware' },
  { id: 'T144', cat: 'sprint18', name: 'BL-049: BottomNav active tab — box-shadow inset 0 2px 0 var(--color-primary) + opacity-20 icon glow; active tab ברור ומובחן; ללא רגרסיה' },
  { id: 'T145', cat: 'sprint19', name: 'BL-079: contactConfig.ts single source of truth; normalizeLanguage/normalizeReligion מקבלים raw key / EN label / HE label; CSV template מלוקלי לפי app lang; Religion dropdown ב-ContactForm מסודר לפי שפת הקשר; build+lint ✅' },
  { id: 'T146', cat: 'sprint20', name: 'BL-076: Hebrew Birthday column בתבנית CSV (EN+HE); DETECTABLE_FIELDS: hebrewBirthday לפני birthday; processImport כותב hebrewBirthday; round-trip export↔import תקין; build+lint ✅' },
  { id: 'T147', cat: 'sprint21', name: 'BL-084: normalizeBirthday() ב-importService.ts; isNaN guard ב-ContactDetailScreen.tsx; קשר מיובא עם תאריך לא-ISO נפתח ללא קריסה; build+lint ✅' },
  { id: 'T148', cat: 'sprint21', name: 'BL-082: תג ציון ב-ContactCard הפך ל-button; לחיצה מציגה tooltip עם הסבר ציון; click-outside/Escape סוגרים; EN+HE; build+lint ✅' },
  { id: 'T149', cat: 'sprint21', name: 'BL-068: contact picker ב-GroupsScreen modal (Premium); selectedContactIds נשמרים ב-handleSave; חיפוש אנשי קשר; EN+HE; build+lint ✅' },
  { id: 'T150', cat: 'sprint21', name: 'BL-069: group selector ב-ContactFormScreen לאנשי קשר חדשים; לאחר addContact מעדכן group.contactIds; EN+HE; build+lint ✅' },
  { id: 'T151', cat: 'sprint22', name: 'BL-092: celebrationType ב-DETECTABLE_FIELDS; normalizeCelebrationType(); processImport כותב celebrationType; round-trip export-import תקין; build+lint ✅' },
  { id: 'T152', cat: 'sprint22', name: 'BL-090: normalizeHebrewBirthday() מאמת DD-MM בייבוא; regex guard ב-ContactDetailScreen; ערכים לא תקינים לא מוצגים; build+lint ✅' },
  { id: 'T153', cat: 'sprint22', name: 'BL-091: settings_exportGroupWarning EN+HE; אזהרה מתחת לכפתור ייצוא CSV ב-SettingsScreen; build+lint ✅' },
  { id: 'T154', cat: 'sprint23', name: 'BL-086: deleteContact מנקה contactIds בקבוצות; שלמות נתונים נשמרת; build+lint ✅' },
  { id: 'T155', cat: 'sprint23', name: 'BL-088: כותרת משנה ב-ContactsScreen — contacts_contact/contacts_contacts EN+HE; תיקון מפתחות i18n; build+lint ✅' },
  { id: 'T156', cat: 'sprint23', name: 'BL-087: chip סינון קבוצה ב-ContactsScreen; ?group=X מסנן + מציג chip; כפתור ניקוי; build+lint ✅' },
  { id: 'T157', cat: 'sprint24', name: 'BL-089: chip קבוצה ב-ContactCard (עד 2 + overflow); מקטע קבוצות ב-ContactDetailScreen; reverse-lookup Group.contactIds; EN+HE; build+lint ✅' },
  { id: 'T158', cat: 'sprint24', name: 'BL-093 Phase 1: עדכון טקסט מטרת קבוצה; chips סינון לפי דת בהוספת חגים; multi-select; אינו בוחר אוטומטית; build+lint ✅' },
  { id: 'T159', cat: 'sprint25', name: 'BL-094: שמות חגים מוצגים בשפת הממשק בכל נקודות ה-UI דרך getHolidayDisplayName(); EN+HE; build+lint ✅' },
  { id: 'T160', cat: 'sprint25', name: 'BL-085: חגים קשורים בפרטי איש קשר ממוינים לפי קרבה לתאריך הנוכחי; build+lint ✅' },
  { id: 'T161', cat: 'sprint25', name: 'BL-096: שיוך/הסרה מקבוצות בעריכת איש קשר קיים — chips toggle + סנכרון בשמירה; build+lint ✅' },
  { id: 'T162', cat: 'sprint26', name: 'BL-098: empty state ב-Dashboard ו-Contacts עם ניסוח רגשי/ערכי; CTA מוביל ל-QuickAddModal; build+lint ✅' },
  { id: 'T163', cat: 'sprint26', name: 'BL-099: QuickAddModal — שם + טלפון בלבד; שמירה יוצרת איש קשר עם ברירות מחדל; קישור לטופס מלא; build+lint ✅' },
  { id: 'T164', cat: 'sprint27', name: 'BL-100: placeholder ב-dropdown בחירת איש קשר disabled+hidden; לא ניתן לשמור טופס עם placeholder; build+lint ✅' },
  { id: 'T165', cat: 'sprint27', name: 'BL-083: FeatureGuide 3 שקפים — מוצג בכניסה ראשונה; ניתן לדלג; dots + ניווט RTL; View Guide ב-Settings; build+lint ✅' },
  { id: 'T166', cat: 'sprint28', name: 'BL-097: דף נחיתה — 4 תמונות קשרים, tagline, CTA (התחל/התחבר בקרוב/הדגמה), dontShowLanding flag, דילוג אוטומטי למשתמש חוזר; RTL; build+lint ✅' },
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
