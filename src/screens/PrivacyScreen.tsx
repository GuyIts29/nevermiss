import { Shield, Lock, WifiOff, Eye, BarChart2, Smartphone, FileUp, MessageCircle, BookOpen, RefreshCw, Mail } from 'lucide-react'
import { PageHeader } from '@/components/Navigation'
import { useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { APP_CONFIG } from '@/config/appConfig'

const SECTIONS = [
  { icon: Lock,         title: '1. Data Storage',            color: '#8B5CF6', body: "All data — including your contacts, groups, settings, and drafts — is stored exclusively on your device using the browser's localStorage. This data never leaves your device unless you explicitly export it." },
  { icon: Shield,       title: '2. No Data Collection',      color: '#10B981', body: 'NeverMiss does not collect any personal information. We have no servers that receive your contact data, relationship notes, or any other information you enter into the app.' },
  { icon: BarChart2,    title: '3. No Analytics or Tracking',color: '#3B82F6', body: 'We do not use analytics tools, crash reporters, user session tracking, or any form of behavioral monitoring. Your usage of the app is entirely private.' },
  { icon: Eye,          title: '4. No Advertisements',       color: '#F59E0B', body: 'NeverMiss contains no advertisements and is not part of any advertising network. Your data is not sold or shared with advertisers.' },
  { icon: MessageCircle,title: '5. WhatsApp Integration',    color: '#25D366', body: 'When you use the WhatsApp feature, NeverMiss opens WhatsApp with a pre-filled message using the standard "wa.me" link. Your message and phone number go directly to WhatsApp (operated by Meta). NeverMiss does not see, store, or intercept these messages. You must manually press "Send" in WhatsApp.' },
  { icon: FileUp,       title: '6. Contact Import',          color: '#0EA5E9', body: "(Premium feature) When you import contacts from a CSV or Excel file, the file is processed entirely on your device. The file is never uploaded to any server. Imported data is saved to your device's localStorage." },
  { icon: WifiOff,      title: '7. Fonts and External Resources', color: '#6366F1', body: "The app uses Google Fonts (Inter) which may be loaded from Google's servers in the web version. On mobile, fonts may be bundled. No personal data is sent with these requests." },
  { icon: Smartphone,   title: '8. Your Rights',             color: '#F43F5E', body: 'Since we hold no data about you, there is nothing to request, delete, or correct on our end. You have full control of your data — you can clear all app data at any time from Settings → Clear All Data.' },
  { icon: RefreshCw,    title: '9. Changes to This Policy',  color: '#F97316', body: 'We will update this policy if our practices change. The date at the top of this policy reflects the most recent revision.' },
  { icon: Mail,         title: '10. Contact',                color: '#A855F7', body: "If you have privacy questions, you can reach us through the app's support channels." },
]

export function PrivacyScreen() {
  const t = useT()
  const { theme } = useTheme()

  return (
    <div className="screen-container">
      <PageHeader title={t('privacy_title')} back />
      <div className="page-content space-y-3 pb-10">

        {/* Hero */}
        <div
          className="rounded-[var(--border-radius-lg)] p-5 text-center animate-scale-in relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
        >
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative">
            <div className="text-4xl mb-2 animate-float inline-block">🔒</div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">{APP_CONFIG.appName} Privacy Policy</h2>
            <p className="text-white/75 text-xs mt-1">Last updated: {APP_CONFIG.releaseDate}</p>
            <div
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              <Shield size={10} />
              Privacy-first · No data collection · Fully local
            </div>
          </div>
        </div>

        {/* Intro */}
        <div className="card stagger-1">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {APP_CONFIG.appName} is designed with privacy as a core principle. We do not collect, store, or transmit your personal data.
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map(({ icon: Icon, title, color, body }, idx) => (
          <div key={title} className={`card stagger-${Math.min(idx + 1, 5) as 1|2|3|4|5}`}>
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${color}25, ${color}12)` }}
              >
                <Icon size={14} style={{ color }} />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-sm text-[var(--color-text-primary)] mb-1">{title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{body}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div
          className="p-3 rounded-[var(--border-radius)] text-center"
          style={{ background: 'var(--color-surface-2)' }}
        >
          <p className="text-xs text-[var(--color-text-muted)]">
            <BookOpen size={10} className="inline mr-1" />
            Questions? See Settings → About for contact details
          </p>
        </div>
      </div>
    </div>
  )
}
