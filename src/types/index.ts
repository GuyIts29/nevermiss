// ─── Religion & Holiday Types ────────────────────────────────────────────────

export type Religion =
  | 'Judaism'
  | 'Islam'
  | 'Christianity'
  | 'Druze'
  | 'Buddhism'
  | 'Hinduism'
  | 'Sikhism'
  | 'Bahai'
  | 'EastAsian'
  | 'Secular'

export type HolidayType =
  | 'major'
  | 'moderate'
  | 'minor'
  | 'fast'
  | 'festival'
  | 'cultural'
  | 'national'

export type DateType =
  | 'gregorian'
  | 'hebrew'
  | 'hijri'
  | 'lunar'
  | 'calculated'

export interface HolidayGreetings {
  hebrew?: string[]
  arabic?: string[]
  english: string[]
  transliteration?: string[]
}

export interface Holiday {
  id: string
  name: string
  alternativeNames: string[]
  religion: Religion
  type: HolidayType
  date: string        // YYYY-MM-DD (Gregorian approximation)
  endDate?: string
  year: number
  dateType: DateType
  description: string
  greetingGuidance: string
  greetings: HolidayGreetings
  sensitivityNotes?: string
  doList?: string[]
  dontList?: string[]
  color: string       // hex color for UI
  emoji: string
}

// ─── Contact & CRM Types ─────────────────────────────────────────────────────

export type RelationshipType =
  | 'friend'
  | 'family'
  | 'colleague'
  | 'client'
  | 'business_partner'
  | 'acquaintance'
  | 'mentor'
  | 'employee'
  | 'manager'
  | 'other'

export type ImportanceLevel = 'normal' | 'high' | 'vip'

export type InteractionFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'biannually'
  | 'annually'

export type ContactType = 'internal' | 'external'

export type CelebrationType = 'Jewish' | 'Christian' | 'Muslim' | 'Druze' | 'Secular'

export type Language =
  | 'hebrew'
  | 'arabic'
  | 'english'
  | 'russian'
  | 'amharic'
  | 'french'
  | 'spanish'
  | 'other'

export interface Contact {
  id: string
  name: string
  phone: string
  language: Language
  relationshipType: RelationshipType
  religion?: Religion
  notes?: string
  lastContactDate?: string  // ISO date string
  importanceLevel: ImportanceLevel
  interactionFrequency: InteractionFrequency
  contactType: ContactType
  createdAt: string
  updatedAt: string
  // Premium fields
  birthday?: string         // YYYY-MM-DD
  hebrewBirthday?: string   // "DD-MM" e.g. "03-01" = 3 Nisan (Hebrew day-month, no year)
  email?: string
  department?: string
  role?: string
  manager?: string
  team?: string
  tags?: string[]
  avatarColor?: string
  celebrationType?: CelebrationType
}

// ─── Group Types ──────────────────────────────────────────────────────────────

export type GroupPurpose = 'family' | 'friends' | 'work' | 'clients' | 'hr' | 'community' | 'custom'

export interface Group {
  id: string
  name: string
  description?: string
  contactIds: string[]
  holidayIds: string[]
  color: string
  emoji: string
  purpose?: GroupPurpose
  createdAt: string
  updatedAt: string
}

// ─── Greeting Types ───────────────────────────────────────────────────────────

export interface MediaAttachment {
  type: 'image' | 'audio'
  dataUrl: string        // base64 data URL (e.g. "data:image/jpeg;base64,...")
  mimeType: string       // e.g. "image/jpeg", "audio/webm"
  fileName?: string
  durationSeconds?: number  // for audio only
  sizeBytes?: number
}

export type GreetingTone = 'business' | 'friendly' | 'formal' | 'internal' | 'vip'

export interface GreetingTemplate {
  id: string
  holidayId: string
  contactId?: string
  message: string
  language: Language
  tone: GreetingTone
  isPremium: boolean
  createdAt: string
}

export interface GreetingDraft {
  id: string
  contactId: string
  holidayId?: string
  message: string
  language: Language
  tone: GreetingTone
  status: 'draft' | 'sent'
  createdAt: string
  sentAt?: string
  media?: MediaAttachment
}

// ─── Relationship Intelligence ────────────────────────────────────────────────

export interface RelationshipScore {
  contactId: string
  total: number
  timePenalty: number
  importanceWeight: number
  upcomingEventsWeight: number
  isOverdue: boolean
  daysSinceContact: number
  suggestedAction: SuggestedAction
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
}

export type SuggestedActionType =
  | 'send_greeting'
  | 'send_checkin'
  | 'wish_holiday'
  | 'wish_birthday'
  | 'reconnect'
  | 'follow_up'

export interface SuggestedAction {
  type: SuggestedActionType
  label: string
  description: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  relatedHolidayId?: string
}

export interface RelationshipInsight {
  contactId: string
  contact: Contact
  score: RelationshipScore
  upcomingHolidays: Holiday[]
  birthdayDaysUntil?: number
}

// ─── App & Settings Types ─────────────────────────────────────────────────────

export type ThemeId =
  | 'ocean'
  | 'forest'
  | 'sunset'
  | 'purple'
  | 'rose'
  | 'midnight'
  | 'custom'

export interface Theme {
  id: ThemeId
  name: string
  primary: string
  primaryDark: string
  secondary: string
  background: string
  surface: string
  surface2: string
  accent: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  border: string
  shadowColor: string
  borderRadius: string
  borderRadiusLg: string
  isDark: boolean
}

export interface AppSettings {
  themeId: ThemeId
  customTheme?: Partial<Theme>
  language: Language
  uiLanguage?: 'en' | 'he'
  defaultTone: GreetingTone
  showWelcomeOnStartup: boolean
  notificationsEnabled: boolean
  lastSeenVersion: string
}

export interface PremiumState {
  isPremium: boolean
  activatedAt?: string
  plan?: 'monthly' | 'annual' | 'coupon'
  expiresAt?: string | null   // ISO date string; null = never expires
  couponCode?: string | null  // which coupon was used
}

// ─── Import Types ─────────────────────────────────────────────────────────────

export interface ImportColumn {
  sourceColumn: string
  targetField: keyof Contact | null
}

export interface ImportPreview {
  headers: string[]
  rows: Record<string, string>[]
  totalRows: number
  validRows: number
  errors: string[]
}

export interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
  contacts: Contact[]
}

// ─── Communication Types ──────────────────────────────────────────────────────

export type CommunicationChannel =
  | 'whatsapp'
  | 'sms'
  | 'email'
  | 'copy'
  | 'share'
  | 'slack'
  | 'teams'

export interface CommunicationAction {
  channel: CommunicationChannel
  contactId: string
  message: string
  available: boolean
}

// ─── Changelog & Versioning ───────────────────────────────────────────────────

export type ChangeType = 'feature' | 'bugfix' | 'improvement' | 'security'

export interface ChangelogEntry {
  version: string
  date: string
  title: string
  changes: { type: ChangeType; description: string }[]
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardData {
  priorityContacts: RelationshipInsight[]
  reconnectSuggestions: RelationshipInsight[]
  upcomingHolidays: Holiday[]
  todayBirthdays: Contact[]
  upcomingBirthdays: { contact: Contact; daysUntil: number }[]
  teamBirthdays: Contact[]
  overdueFollowUps: Contact[]
}
