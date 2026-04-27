import { type ReactNode } from 'react'
import { Button } from './ui/Button'
import { useTheme } from '@/context/ThemeContext'

interface EmptyStateProps {
  emoji?: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
}

export function EmptyState({ emoji = '🌟', title, description, action }: EmptyStateProps) {
  const { theme } = useTheme()
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 animate-float shadow-lg"
        style={{ background: `linear-gradient(135deg, ${theme.primary}33, ${theme.secondary}55)` }}
      >
        {emoji}
      </div>
      <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--color-text-muted)] max-w-xs mb-4">{description}</p>
      )}
      {action && (
        <Button
          variant="primary"
          size="sm"
          icon={action.icon}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
