const USER_ID_KEY = 'nm_user_id'
const EVENTS_KEY = 'nm_events'
const MAX_EVENTS = 100

interface AnalyticsEvent {
  id: string
  event_name: string
  user_id: string
  created_at: string
  metadata?: Record<string, unknown>
}

function newId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }
}

export function getAnonymousUserId(): string {
  try {
    const existing = localStorage.getItem(USER_ID_KEY)
    if (existing) return existing
    const id = newId()
    localStorage.setItem(USER_ID_KEY, id)
    return id
  } catch {
    return 'unknown'
  }
}

export function trackEvent(eventName: string, metadata?: Record<string, unknown>): void {
  try {
    const event: AnalyticsEvent = {
      id: newId(),
      event_name: eventName,
      user_id: getAnonymousUserId(),
      created_at: new Date().toISOString(),
      metadata,
    }

    const raw = localStorage.getItem(EVENTS_KEY)
    const events: AnalyticsEvent[] = raw ? (JSON.parse(raw) as AnalyticsEvent[]) : []

    events.push(event)

    if (events.length > MAX_EVENTS) {
      events.splice(0, events.length - MAX_EVENTS)
    }

    localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
  } catch {
    // Silent — analytics must never interrupt the app
  }
}
