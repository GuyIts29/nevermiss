import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'
import { useT } from '@/context/LanguageContext'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  hideClose?: boolean
  footer?: ReactNode
  danger?: boolean
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-full m-4',
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function Modal({ isOpen, onClose, title, children, size = 'md', hideClose, footer, danger }: ModalProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<Element | null>(null)
  const t = useT()

  useEffect(() => {
    if (!isOpen) return

    previousFocus.current = document.activeElement

    const frame = requestAnimationFrame(() => {
      const first = sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE)
      first?.focus()
    })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const focusable = Array.from(sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKey)
      ;(previousFocus.current as HTMLElement | null)?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={clsx(
          'relative bg-[var(--color-surface)] w-full sm:rounded-[var(--border-radius-lg)]',
          'rounded-t-[var(--border-radius-lg)]',
          'animate-slide-up max-h-[92vh] flex flex-col',
          sizeMap[size]
        )}
        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.2), 0 0 0 1px var(--color-border)' }}
      >
        {/* Drag handle — mobile UX best practice */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
        </div>

        {/* Header */}
        {title && (
          <div
            className={clsx(
              'flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]',
              danger && 'border-b-red-200'
            )}
          >
            <h2
              id="modal-title"
              className={clsx(
                'text-base font-extrabold tracking-tight',
                danger ? 'text-red-600' : 'text-[var(--color-text-primary)]'
              )}
            >
              {title}
            </h2>
            {!hideClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-[var(--color-surface-2)] transition-all active:scale-90"
                aria-label={t('close')}
              >
                <X size={18} className="text-[var(--color-text-muted)]" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
