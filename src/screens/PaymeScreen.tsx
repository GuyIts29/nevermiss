import { useNavigate, Navigate } from 'react-router-dom'
import { Crown, Check, Unlock, Info } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useT } from '@/context/LanguageContext'
import { PageHeader } from '@/components/Navigation'
import { Button } from '@/components/ui/Button'
import { hapticSuccess } from '@/services/hapticService'

export function PaymeScreen() {
  const navigate = useNavigate()
  const { isPremium, activatePremium, showPremiumUI } = useApp()
  const t = useT()

  const handleActivate = async () => {
    activatePremium()
    await hapticSuccess()
    navigate('/dashboard', { replace: true })
  }

  // TEMP: Premium disabled for MVP phase — /payment redirects to dashboard
  if (!showPremiumUI) return <Navigate to="/dashboard" replace />

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
            <p className="text-white font-extrabold text-lg">{t('upgrade_unlockEverything')}</p>
            <p className="text-white/75 text-xs mt-0.5">{t('upgrade_subtitle')}</p>
          </div>
        </div>

        {/* Demo notice */}
        <div
          className="rounded-[var(--border-radius-lg)] p-4 flex items-start gap-3"
          style={{ background: '#FEF3C7', border: '1.5px solid #F59E0B' }}
        >
          <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-amber-800 leading-snug">
            {t('payme_demoNotice')}
          </p>
        </div>

        {/* Activate button */}
        <button
          onClick={handleActivate}
          className="w-full h-14 rounded-[var(--border-radius)] text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all"
          style={{
            background: 'linear-gradient(135deg, #F59E0B, #F97316)',
            boxShadow: '0 6px 24px rgba(245,158,11,0.35)',
          }}
        >
          <Unlock size={18} />
          {t('payme_activateDemo')}
        </button>

        <Button variant="ghost" size="md" fullWidth onClick={() => navigate(-1)}>
          {t('cancel')}
        </Button>
      </div>
    </div>
  )
}
