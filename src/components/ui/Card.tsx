import { type HTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  elevated?: boolean
  interactive?: boolean
  noPadding?: boolean
  accent?: string
}

export function Card({ children, elevated, interactive, noPadding, accent, className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'card',
        elevated && 'card-elevated',
        interactive && 'card-interactive',
        noPadding && '!p-0',
        className
      )}
      style={accent ? { borderLeft: `4px solid ${accent}` } : undefined}
      {...props}
    >
      {children}
    </div>
  )
}
