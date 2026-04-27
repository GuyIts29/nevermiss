import { X } from 'lucide-react'

interface TagProps {
  label: string
  color?: string
  onRemove?: () => void
}

export function Tag({ label, color, onRemove }: TagProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: color ? `${color}22` : 'var(--color-surface-2)',
        color: color ?? 'var(--color-text-secondary)',
        border: `1px solid ${color ? `${color}44` : 'var(--color-border)'}`,
      }}
    >
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-70 transition-opacity">
          <X size={10} />
        </button>
      )}
    </span>
  )
}
