import { useNavigate } from 'react-router-dom'
import {
  Crown, Check, Unlock, X,
  Users, Group, Cake, FileUp,
  Sparkles, BarChart2, Building2,
  Layers, Palette, Headphones,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { PageHeader } from '@/components/Navigation'
import { Button } from '@/components/ui/Button'
import { APP_CONFIG } from '@/config/appConfig'

const FREE_FEATURES = [
  'Up to 20 contacts',
  'Up to 2 groups',
  'Basic greeting templates',
  'Holiday calendar',
  'Cultural holiday database',
  'WhatsApp integration',
]

interface PremiumFeatureItem {
  label: string
  icon: React.ReactNode
  color: string
}

const PREMIUM_FEATURES: PremiumFeatureItem[] = [
  { label: 'Unlimited contacts', icon: <Users size={13} />, color: '#3B82F6' },
  { label: 'Unlimited groups', icon: <Group size={13} />, color: '#8B5CF6' },
  { label: 'Birthday tracking & greetings', icon: <Cake size={13} />, color: '#EC4899' },
  { label: 'Contact import (CSV / Excel)', icon: <FileUp size={13} />, color: '#10B981' },
  { label: 'Advanced greeting templates (VIP, formal, business)', icon: <Sparkles size={13} />, color: '#F59E0B' },
  { label: 'Full relationship insights', icon: <BarChart2 size={13} />, color: '#0EA5E9' },
  { label: 'Internal organization mode', icon: <Building2 size={13} />, color: '#6366F1' },
  { label: 'Department & team filtering', icon: <Layers size={13} />, color: '#F97316' },
  { label: 'Custom theme designer', icon: <Palette size={13} />, color: '#A855F7' },
  { label: 'Priority support', icon: <Headphones size={13} />, color: '#14B8A6' },
]

export function UpgradeScreen() {
  const navigate = useNavigate()
  const { isPremium, activatePremium, deactivatePremium } = useApp()
  const t = useT()

  return (
    <div className="screen-container">
      <PageHeader title={t('upgrade_title')} back />

      <div className="page-content space-y-5 pb-20">
        {/* Hero */}
        <div
          className="relative rounded-[var(--border-radius-lg)] overflow-hidden text-center"
          style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 40%, #EF4444 70%, #9333EA 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />

          <div className="relative px-6 py-7">
            <div className="text-5xl mb-3 animate-float inline-block">👑</div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">{t('upgrade_unlockEverything')}</h2>
            <p className="text-white/80 text-sm mt-1.5 leading-snug">{t('upgrade_subtitle')}</p>
            <div className="mt-4 inline-flex flex-col items-center bg-white/15 rounded-[var(--border-radius)] px-6 py-3">
              <div className="text-white">
                <span className="text-4xl font-black">{APP_CONFIG.pricing.monthly}</span>
                <span className="text-white/70 text-sm ml-1">{t('upgrade_month')}</span>
              </div>
              <p className="text-white/60 text-xs mt-0.5">
                {t('upgrade_yearSave', { price: APP_CONFIG.pricing.annual })}
              </p>
            </div>
          </div>
        </div>

        {/* Free vs Premium comparison */}
        <div className="grid grid-cols-2 gap-3">
          {/* Free column */}
          <div className="card !p-3 border border-[var(--color-border)]">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="text-base">🆓</span>
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">{t('upgrade_free')}</p>
            </div>
            <ul className="space-y-1.5">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-[var(--color-text-secondary)]">
                  <Check size={11} className="text-green-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
              <li className="flex items-start gap-1.5 text-xs text-[var(--color-text-muted)] line-through">
                <X size={11} className="text-red-400 mt-0.5 shrink-0" />
                Birthdays
              </li>
              <li className="flex items-start gap-1.5 text-xs text-[var(--color-text-muted)] line-through">
                <X size={11} className="text-red-400 mt-0.5 shrink-0" />
                Import
              </li>
            </ul>
          </div>

          {/* Premium column */}
          <div
            className="card !p-3 border-2 relative overflow-hidden"
            style={{
              borderColor: '#F59E0B',
              boxShadow: '0 4px 20px rgba(245,158,11,0.2)',
            }}
          >
            {/* Most Popular badge */}
            <div
              className="absolute -top-0 -right-0 px-2 py-0.5 text-[9px] font-bold text-white rounded-bl-lg"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
            >
              MOST POPULAR
            </div>

            <div className="flex items-center gap-1.5 mb-2.5">
              <Crown size={13} className="text-amber-500" />
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                {t('premium')} ✨
              </p>
            </div>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-1.5 text-xs text-[var(--color-text-secondary)]">
                <Check size={11} className="text-green-500 mt-0.5 shrink-0" />
                {t('upgrade_everythingInFree')}
              </li>
              {PREMIUM_FEATURES.map(({ label, icon, color }) => (
                <li key={label} className="flex items-start gap-1.5 text-xs text-[var(--color-text-secondary)]">
                  <span className="mt-0.5 shrink-0" style={{ color }}>{icon}</span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Testimonials */}
        <div className="space-y-2">
          {[
            { name: 'David M.', role: 'Sales Manager', emoji: '💼', quote: '"I never miss Eid, Rosh Hashana, or Christmas for my clients. It transformed my relationships."' },
            { name: 'Sarah L.', role: 'HR Director', emoji: '🎂', quote: '"The birthday tracking feature means we never miss an employee birthday. Team morale improved noticeably."' },
          ].map(({ name, role, emoji, quote }) => (
            <div key={name} className="card !p-3 animate-slide-up">
              <p className="text-xs text-[var(--color-text-muted)] mb-1.5">{emoji}</p>
              <p className="text-sm text-[var(--color-text-secondary)] italic mb-2 leading-snug">{quote}</p>
              <p className="text-xs font-semibold text-[var(--color-text-primary)]">{name} <span className="font-normal text-[var(--color-text-muted)]">— {role}</span></p>
            </div>
          ))}
        </div>

        {/* Privacy */}
        <div className="p-3 bg-[var(--color-surface-2)] rounded-[var(--border-radius)] text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            🔒 Privacy-first · All data stored locally on your device · No tracking · No ads
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            ⚠️ This app <strong>never sends messages automatically</strong>
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-2">
          {!isPremium ? (
            <>
              <button
                onClick={activatePremium}
                className="w-full h-14 rounded-[var(--border-radius)] text-white font-bold text-lg flex items-center justify-center gap-2.5 shadow-lg hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B, #F97316, #EF4444)',
                  boxShadow: '0 6px 24px rgba(245,158,11,0.4)',
                }}
              >
                <Unlock size={18} />
                {t('upgrade_unlockDemo')}
              </button>
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => navigate(-1)}
              >
                {t('upgrade_continueFree')}
              </Button>
            </>
          ) : (
            <>
              <div
                className="p-4 rounded-[var(--border-radius-lg)] text-center border-2"
                style={{
                  background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
                  borderColor: '#34D399',
                }}
              >
                <Crown size={24} className="text-amber-500 mx-auto mb-1.5" />
                <p className="font-bold text-green-700">{t('upgrade_premiumActive')}</p>
                <p className="text-xs text-green-600 mt-0.5">{t('upgrade_premiumActiveDesc')}</p>
              </div>
              <Button variant="ghost" size="sm" fullWidth onClick={deactivatePremium}>
                {t('settings_restoreFree')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
