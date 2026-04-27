import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { BottomNav } from '@/components/Navigation'
import { isOnboardingDone } from '@/services/storageService'
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

// Screens
import { OnboardingScreen } from '@/screens/OnboardingScreen'
import { DashboardScreen } from '@/screens/DashboardScreen'
import { CalendarScreen } from '@/screens/CalendarScreen'
import { HolidayDetailScreen } from '@/screens/HolidayDetailScreen'
import { ContactsScreen } from '@/screens/ContactsScreen'
import { ContactDetailScreen } from '@/screens/ContactDetailScreen'
import { ContactFormScreen } from '@/screens/ContactFormScreen'
import { GreetingEditorScreen } from '@/screens/GreetingEditorScreen'
import { GroupsScreen } from '@/screens/GroupsScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'
import { UpgradeScreen } from '@/screens/UpgradeScreen'
import { AboutScreen } from '@/screens/AboutScreen'
import { PrivacyScreen } from '@/screens/PrivacyScreen'
import { TermsScreen } from '@/screens/TermsScreen'
import { WhatsNewScreen } from '@/screens/WhatsNewScreen'
const ImportContactsScreen = lazy(() => import('@/screens/premium/ImportContactsScreen').then(m => ({ default: m.ImportContactsScreen })))
const BirthdayCenterScreen = lazy(() => import('@/screens/premium/BirthdayCenterScreen').then(m => ({ default: m.BirthdayCenterScreen })))
const BirthdayGreetingEditorScreen = lazy(() => import('@/screens/premium/BirthdayGreetingEditorScreen').then(m => ({ default: m.BirthdayGreetingEditorScreen })))
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { fireReminders } from '@/services/notificationService'

function WithNav({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <main className="app-main">
        {children}
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
      <Route path="/import" element={<WithNav>{isPremium ? <Suspense fallback={null}><ImportContactsScreen /></Suspense> : <UpgradeScreen />}</WithNav>} />
      <Route path="/birthdays" element={<WithNav>{isPremium ? <Suspense fallback={null}><BirthdayCenterScreen /></Suspense> : <UpgradeScreen />}</WithNav>} />
      <Route path="/birthdays/greeting/:id" element={<WithNav>{isPremium ? <Suspense fallback={null}><BirthdayGreetingEditorScreen /></Suspense> : <UpgradeScreen />}</WithNav>} />
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
