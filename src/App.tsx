import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { BottomNav } from '@/components/Navigation'
import { isOnboardingDone } from '@/services/storageService'
import { type ReactNode } from 'react'

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
import { ImportContactsScreen } from '@/screens/premium/ImportContactsScreen'
import { BirthdayCenterScreen } from '@/screens/premium/BirthdayCenterScreen'
import { BirthdayGreetingEditorScreen } from '@/screens/premium/BirthdayGreetingEditorScreen'
import { useApp } from '@/context/AppContext'

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
  const { isPremium } = useApp()

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
      <Route path="/birthdays" element={<WithNav>{isPremium ? <BirthdayCenterScreen /> : <UpgradeScreen />}</WithNav>} />
      <Route path="/birthdays/greeting/:id" element={<WithNav>{isPremium ? <BirthdayGreetingEditorScreen /> : <UpgradeScreen />}</WithNav>} />
      <Route path="/" element={<Navigate to={isOnboardingDone() ? '/dashboard' : '/onboarding'} replace />} />
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
            <AppShell />
          </AppProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
