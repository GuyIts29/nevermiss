import { CheckCircle, MessageCircle, Calendar, CreditCard, HardDrive, AlertTriangle, Scale, RefreshCw, FileText, Gavel } from 'lucide-react'
import { PageHeader } from '@/components/Navigation'
import { useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { APP_CONFIG } from '@/config/appConfig'

const SECTIONS = [
  { icon: FileText,      title: '1. Acceptance',              color: '#3B82F6', body: 'By downloading, installing, or using NeverMiss, you accept these Terms of Service in full. If you do not agree, do not use the app.' },
  { icon: CheckCircle,   title: '2. Use of the App',          color: '#10B981', body: 'NeverMiss is a personal relationship management tool. You agree to use it only for lawful purposes and in a way that respects other people. You are responsible for all content you enter into the app.' },
  { icon: AlertTriangle, title: '3. No Automatic Messaging',  color: '#F97316', body: 'NeverMiss DOES NOT send any messages automatically. All communications require your explicit review and manual sending action. The app prepares suggested messages for your review — the decision to send any message is entirely yours.' },
  { icon: MessageCircle, title: '4. WhatsApp Usage',          color: '#25D366', body: "When using the WhatsApp feature, you are subject to WhatsApp's Terms of Service. NeverMiss opens a pre-filled link; you must manually send the message in WhatsApp. Misuse of messaging features (spam, harassment, etc.) is prohibited." },
  { icon: Calendar,      title: '5. Accuracy of Holiday Information', color: '#8B5CF6', body: 'Holiday dates and cultural information are provided for guidance purposes. Dates may vary by region, denomination, or year. We strive for accuracy but cannot guarantee that all information is correct or complete. Always verify with the relevant community.' },
  { icon: CreditCard,    title: '6. Premium Features',        color: '#F59E0B', body: 'Premium features are unlocked via in-app purchase. All purchases are subject to the payment terms of the relevant app store. Refund policies are governed by Apple App Store or Google Play policies.' },
  { icon: HardDrive,     title: '7. Data Responsibility',     color: '#0EA5E9', body: 'All data is stored locally on your device. You are responsible for backing up your data. If you clear the app data or uninstall the app, your data may be lost. NeverMiss is not liable for any data loss.' },
  { icon: Scale,         title: '8. Disclaimer',              color: '#6366F1', body: 'NeverMiss is provided "as is" without warranty of any kind. We do not guarantee that the app will be error-free or uninterrupted.' },
  { icon: Gavel,         title: '9. Limitation of Liability', color: '#F43F5E', body: 'To the maximum extent permitted by law, NeverMiss and its developers shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.' },
  { icon: RefreshCw,     title: '10. Changes',                color: '#A855F7', body: 'We reserve the right to update these Terms at any time. Continued use of the app after changes constitutes acceptance.' },
]

export function TermsScreen() {
  const t = useT()
  const { theme } = useTheme()

  return (
    <div className="screen-container">
      <PageHeader title={t('terms_title')} back />
      <div className="page-content space-y-3 pb-10">

        {/* Hero */}
        <div
          className="rounded-[var(--border-radius-lg)] p-5 text-center animate-scale-in relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
        >
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative">
            <div className="text-4xl mb-2 animate-float inline-block">📋</div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">{APP_CONFIG.appName} Terms of Service</h2>
            <p className="text-white/75 text-xs mt-1">Last updated: {APP_CONFIG.releaseDate}</p>
          </div>
        </div>

        {/* Intro */}
        <div className="card stagger-1">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            By using {APP_CONFIG.appName}, you agree to these terms. Please read them carefully.
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
      </div>
    </div>
  )
}
