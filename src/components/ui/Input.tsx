import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'
import { useLang } from '@/context/LanguageContext'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  iconRight?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  icon,
  iconRight,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const { lang } = useLang()
  const isRTL = lang === 'he'

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none`}>
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'form-input',
            icon && (isRTL ? 'pr-10' : 'pl-10'),
            iconRight && (isRTL ? 'pl-10' : 'pr-10'),
            error && 'border-red-400 focus:ring-red-400',
            className
          )}
          {...props}
        />
        {iconRight && (
          <div className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]`}>
            {iconRight}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>}
    </div>
  )
})

Input.displayName = 'Input'
