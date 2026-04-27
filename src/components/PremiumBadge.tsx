import { Crown, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from './ui/Badge'
import { useApp } from '@/context/AppContext'

interface PremiumBadgeProps {
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function PremiumBadge({ size = 'sm', showLabel = true }: PremiumBadgeProps) {
  const { isPremium } = useApp()
  const navigate = useNavigate()

  if (!isPremium) {
    return (
      <button
        onClick={() => navigate('/upgrade')}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm hover:opacity-90 hover:scale-105 active:scale-95 transition-all"
        style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
      >
        <Crown size={size === 'sm' ? 10 : 12} />
        {showLabel && 'Upgrade'}
      </button>
    )
  }

  return (
    <Badge variant="premium" size={size}>
      <Crown size={10} />
      {showLabel && 'Premium'}
    </Badge>
  )
}

interface PremiumGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PremiumGate({ children, fallback }: PremiumGateProps) {
  const { isPremium } = useApp()
  if (isPremium) return <>{children}</>
  return fallback ? <>{fallback}</> : null
}

export function PremiumFeaturePrompt({ feature }: { feature: string }) {
  const navigate = useNavigate()
  return (
    <div
      className="rounded-[var(--border-radius-lg)] overflow-hidden cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform"
      onClick={() => navigate('/upgrade')}
      style={{ boxShadow: '0 4px 20px rgba(245,158,11,0.25)' }}
    >
      {/* Gradient header strip */}
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Crown size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white leading-tight">Premium Feature</p>
          <p className="text-xs text-white/80 leading-tight">{feature}</p>
        </div>
        <Lock size={14} className="text-white/70 shrink-0" />
      </div>
      {/* CTA body */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #FEF3C7, #FFEDD5)' }}
      >
        <p className="text-xs text-amber-700 font-medium">Unlock this and many more features</p>
        <span
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
        >
          <Crown size={10} />
          Upgrade
        </span>
      </div>
    </div>
  )
}
