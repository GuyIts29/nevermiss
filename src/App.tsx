import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { BottomNav } from '@/components/Navigation'
import { isOnboardingDone } from '@/services/storageService'
import { trackEvent } from '@/services/analyticsService'
import { Component, lazy, Suspense, useMemo, useEffect, type ErrorInfo, type ReactNode } from 'react'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('NeverMiss crash:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif', direction: 'rtl' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>😔</div>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>משהו השתבש</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Something went wrong. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '0.625rem 1.5rem', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            Refresh
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// Eager screens — kept synchronous so the first frame always renders
import { OnboardingScreen } from '@/screens/OnboardingScreen'
import { DashboardScreen } from '@/screens/DashboardScreen'

// Lazy screens — split into separate chunks; loaded on first navigation
const CalendarScreen = lazy(() => import('@/screens/CalendarScreen').then(m => ({ default: m.CalendarScreen })))
const HolidayDetailScreen = lazy(() => import('@/screens/HolidayDetailScreen').then(m => ({ default: m.HolidayDetailScreen })))
const ContactsScreen = lazy(() => import('@/screens/ContactsScreen').then(m => ({ default: m.ContactsScreen })))
const ContactDetailScreen = lazy(() => import('@/screens/ContactDetailScreen').then(m => ({ default: m.ContactDetailScreen })))
const ContactFormScreen = lazy(() => import('@/screens/ContactFormScreen').then(m => ({ default: m.ContactFormScreen })))
const GreetingEditorScreen = lazy(() => import('@/screens/GreetingEditorScreen').then(m => ({ default: m.GreetingEditorScreen })))
const GroupsScreen = lazy(() => import('@/screens/GroupsScreen').then(m => ({ default: m.GroupsScreen })))
const SettingsScreen = lazy(() => import('@/screens/SettingsScreen').then(m => ({ default: m.SettingsScreen })))
const UpgradeScreen = lazy(() => import('@/screens/UpgradeScreen').then(m => ({ default: m.UpgradeScreen })))
const AboutScreen = lazy(() => import('@/screens/AboutScreen').then(m => ({ default: m.AboutScreen })))
const PrivacyScreen = lazy(() => import('@/screens/PrivacyScreen').then(m => ({ default: m.PrivacyScreen })))
const TermsScreen = lazy(() => import('@/screens/TermsScreen').then(m => ({ default: m.TermsScreen })))
const WhatsNewScreen = lazy(() => import('@/screens/WhatsNewScreen').then(m => ({ default: m.WhatsNewScreen })))
const ImportContactsScreen = lazy(() => import('@/screens/premium/ImportContactsScreen').then(m => ({ default: m.ImportContactsScreen })))
const BirthdayCenterScreen = lazy(() => import('@/screens/premium/BirthdayCenterScreen').then(m => ({ default: m.BirthdayCenterScreen })))
const BirthdayGreetingEditorScreen = lazy(() => import('@/screens/premium/BirthdayGreetingEditorScreen').then(m => ({ default: m.BirthdayGreetingEditorScreen })))
const DeviceContactsScreen = lazy(() => import('@/screens/DeviceContactsScreen').then(m => ({ default: m.DeviceContactsScreen })))
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { fireReminders } from '@/services/notificationService'

function DemoBanner() {
  const { isDemoMode, clearDemo } = useApp()
  const t = useT()
  if (!isDemoMode) return null
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-white"
      style={{ background: 'linear-gradient(90deg, #7C3AED, #DB2777)' }}
    >
      <span>{t('demo_banner')}</span>
      <button
        onClick={clearDemo}
        className="ml-2 underline underline-offset-2 hover:opacity-80 active:opacity-60 transition-opacity"
      >
        {t('demo_clear')}
      </button>
    </div>
  )
}

function WithNav({ children }: { children: ReactNode }) {
  const { isDemoMode } = useApp()
  return (
    <div className="app-layout" style={isDemoMode ? { paddingTop: '32px' } : undefined}>
      <DemoBanner />
      <main className="app-main">
        <Suspense fallback={<div className="screen-container" />}>
          {children}
        </Suspense>
      </main>
      <BottomNav />
    </div>
  )
}

function AppShell() {
  const { isPremium, contacts, holidays, settings } = useApp()
  const onboardingDone = useMemo(() => isOnboardingDone(), [])
  const t = useT()

  useEffect(() => {
    trackEvent('app_open')
    if (settings.notificationsEnabled) {
      fireReminders(contacts, holidays, t)
    }
  // Run once on mount; contacts/holidays/t are stable references on first load
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/dashboard" element={<WithNav><DashboardScreen /></WithNav>} />
      <Route path="/calendar" element={<WithNav><CalendarScreen /></WithNav>} />
      <Route path="/calendar/:id" element={<WithNav><HolidayDetailScreen /></WithNav>} />
      <Route path="/contacts" element={<WithNav><ContactsScreen /></WithNav>} />
      <Route path="/contacts/new" element={<WithNav><ContactFormScreen /></WithNav>} />
      <Route path="/contacts/:id" element={<WithNav><ContactDetailScreen /></WithNav>} />
      <Route path="/contacts/:id/edit" element={<WithNav><ContactFormScreen /></WithNav>} />
      <Route path="/greeting" element={<WithNav><GreetingEditorScreen /></WithNav>} />
      <Route path="/groups" element={<WithNav><GroupsScreen /></WithNav>} />
      <Route path="/settings" element={<WithNav><SettingsScreen /></WithNav>} />
      <Route path="/upgrade" element={<WithNav><UpgradeScreen /></WithNav>} />
      <Route path="/about" element={<WithNav><AboutScreen /></WithNav>} />
      <Route path="/privacy" element={<WithNav><PrivacyScreen /></WithNav>} />
      <Route path="/terms" element={<WithNav><TermsScreen /></WithNav>} />
      <Route path="/whats-new" element={<WithNav><WhatsNewScreen /></WithNav>} />
      <Route path="/import" element={<WithNav>{isPremium ? <ImportContactsScreen /> : <UpgradeScreen />}</WithNav>} />
      <Route path="/device-contacts" element={<WithNav>{isPremium ? <DeviceContactsScreen /> : <UpgradeScreen />}</WithNav>} />
      <Route path="/birthdays" element={<WithNav>{isPremium ? <BirthdayCenterScreen /> : <UpgradeScreen />}</WithNav>} />
      <Route path="/birthdays/greeting/:id" element={<WithNav>{isPremium ? <BirthdayGreetingEditorScreen /> : <UpgradeScreen />}</WithNav>} />
      <Route path="/" element={<Navigate to={onboardingDone ? '/dashboard' : '/onboarding'} replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <AppProvider>
            <ErrorBoundary>
              <AppShell />
            </ErrorBoundary>
          </AppProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
