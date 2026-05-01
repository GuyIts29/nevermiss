import { type HTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'
import { useLang } from '@/context/LanguageContext'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  elevated?: boolean
  interactive?: boolean
  noPadding?: boolean
  accent?: string
}

export function Card({ children, elevated, interactive, noPadding, accent, className, ...props }: CardProps) {
  const { lang } = useLang()
  return (
    <div
      className={clsx(
        'card',
        elevated && 'card-elevated',
        interactive && 'card-interactive',
        noPadding && '!p-0',
        className
      )}
      style={accent ? { [lang === 'he' ? 'borderRight' : 'borderLeft']: `4px solid ${accent}` } : undefined}
      {...props}
    >
      {children}
    </div>
  )
}
