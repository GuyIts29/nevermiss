import { type ReactNode } from 'react'
import { clsx } from 'clsx'

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'premium'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'text-[var(--color-primary)]',
  success: 'text-green-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
  info: 'text-blue-700',
  neutral: 'text-[var(--color-text-secondary)]',
  premium: 'text-white',
}

const variantGradients: Record<BadgeVariant, string> = {
  primary: 'linear-gradient(135deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 60%, var(--color-primary)) 100%)',
  success: 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
  warning: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  danger: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
  info: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
  neutral: 'linear-gradient(135deg, var(--color-surface-2) 0%, color-mix(in srgb, var(--color-surface-2) 70%, var(--color-border)) 100%)',
  premium: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
}

export function Badge({ children, variant = 'neutral', size = 'sm', dot }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 font-medium rounded-full',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
        variantStyles[variant]
      )}
      style={{ background: variantGradients[variant] }}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', 'bg-current opacity-70')} />}
      {children}
    </span>
  )
}
