import { useState } from 'react'
import { Crown, Shield, AlertCircle, Check } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { PageHeader } from '@/components/Navigation'
import { Input } from '@/components/ui/Input'
import { createPaymentLink } from '@/integrations/payment/payme'
import { APP_CONFIG } from '@/config/appConfig'

type Plan = 'monthly' | 'annual'

export function PaymeScreen() {
  const { isPremium } = useApp()
  const t = useT()
  const { theme } = useTheme()

  const [plan, setPlan] = useState<Plan>('monthly')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePay = async () => {
    if (!name.trim() || !email.trim() || processing) return
    setProcessing(true)
    setError(null)
    try {
      await createPaymentLink({
        amount: plan === 'monthly' ? 29 : 249,
        currency: 'ILS',
        description: plan === 'monthly' ? t('payme_monthly') : t('payme_annual'),
        buyerName: name.trim(),
        buyerEmail: email.trim(),
      })
    } catch {
      setError(t('payme_error'))
    } finally {
      setProcessing(false)
    }
  }

  if (isPremium) {
    return (
      <div className="screen-container">
        <PageHeader title={t('payme_title')} back />
        <div className="page-content flex flex-col items-center justify-center gap-4 pt-16">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}
          >
            <Crown size={36} color="white" />
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-[var(--color-text-primary)]">{t('payme_alreadyActive')}</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{t('payme_alreadyActiveDesc')}</p>
          </div>
          <div
            className="w-full p-4 rounded-[var(--border-radius-lg)] flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', border: '1px solid #34D399' }}
          >
            <Check size={20} className="text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-green-700">{t('upgrade_premiumActiveDesc')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-container">
      <PageHeader title={t('payme_title')} back />

      <div className="page-content space-y-5 pb-8">
        {/* Hero */}
        <div
          className="rounded-[var(--border-radius-lg)] p-5 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 50%, #EF4444 100%)' }}
        >
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative">
            <div className="text-4xl mb-2 animate-float inline-block">👑</div>
            <p className="text-white font-extrabold text-lg">{t('payme_title')}</p>
            <p className="text-white/75 text-xs mt-0.5">{t('payme_subtitle')}</p>
          </div>
        </div>

        {/* Plan selector */}
        <div>
          <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">{t('upgrade_month')}</p>
          <div className="grid grid-cols-2 gap-3">
            {(['monthly', 'annual'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className="p-3 rounded-[var(--border-radius-lg)] text-left transition-all"
                style={{
                  border: `2px solid ${plan === p ? theme.primary : 'var(--color-border)'}`,
                  background: plan === p ? `${theme.primary}10` : 'var(--color-surface)',
                  boxShadow: plan === p ? `0 0 0 1px ${theme.primary}30` : undefined,
                }}
              >
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  {p === 'monthly' ? t('payme_monthly') : t('payme_annual')}
                </p>
                <p className="text-base font-extrabold text-[var(--color-text-primary)]">
                  {p === 'monthly' ? t('payme_monthlyPrice') : t('payme_annualPrice')}
                </p>
                {p === 'annual' && (
                  <span
                    className="mt-1 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                  >
                    {t('payme_annualSaving')}
                  </span>
                )}
                {plan === p && (
                  <div className="flex items-center gap-1 mt-1">
                    <Check size={11} style={{ color: theme.primary }} />
                    <span className="text-xs font-semibold" style={{ color: theme.primary }}>{t('done')}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="card space-y-3">
          <Input
            label={t('payme_name')}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('payme_namePlaceholder')}
            autoComplete="name"
          />
          <Input
            label={t('payme_email')}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('payme_emailPlaceholder')}
            autoComplete="email"
          />
        </div>

        {/* Error */}
        {error && (
          <div
            className="p-3 rounded-[var(--border-radius)] flex gap-2 items-start animate-slide-up"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 leading-relaxed">{error}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handlePay}
          disabled={!name.trim() || !email.trim() || processing}
          className="w-full h-14 rounded-[var(--border-radius)] text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100"
          style={{
            background: 'linear-gradient(135deg, #F59E0B, #F97316)',
            boxShadow: '0 6px 24px rgba(245,158,11,0.35)',
          }}
        >
          {processing ? t('payme_processing') : <><span className="text-lg">💳</span>{t('payme_goPayMe')}</>}
        </button>

        {/* Trust + disclaimer */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <Shield size={11} />
            {t('payme_securedBy')}
          </div>
          <p className="text-center text-xs text-[var(--color-text-muted)] px-4 leading-relaxed">
            ⚠️ {t('payme_disclaimer')}
          </p>
        </div>

        {/* Pricing reference */}
        <div className="text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            {APP_CONFIG.pricing.monthly}/mo · {APP_CONFIG.pricing.annual}/yr
          </p>
        </div>
      </div>
    </div>
  )
}
