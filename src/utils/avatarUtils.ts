/**
 * Canonical avatar utility — single source of truth for gradient colours and initials.
 * Uses a module-level Map cache so the hash computation runs only once per unique name.
 */

export const AVATAR_GRADIENTS: [string, string][] = [
  ['#FF6B6B', '#FF8E53'],
  ['#4ECDC4', '#2196F3'],
  ['#A855F7', '#6366F1'],
  ['#F59E0B', '#EF4444'],
  ['#10B981', '#059669'],
  ['#3B82F6', '#0EA5E9'],
  ['#EC4899', '#8B5CF6'],
  ['#F97316', '#FBBF24'],
  ['#06B6D4', '#3B82F6'],
  ['#84CC16', '#10B981'],
]

const gradientCache = new Map<string, string>()

export function getInitials(name: string): string {
  if (!name.trim()) return '?'
  return name
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function getAvatarGradient(name: string): string {
  const cached = gradientCache.get(name)
  if (cached) return cached

  if (!name.trim()) {
    const fallback = 'linear-gradient(135deg, #94A3B8, #64748B)'
    gradientCache.set(name, fallback)
    return fallback
  }

  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const [a, b] = AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length]
  const gradient = `linear-gradient(135deg, ${a}, ${b})`
  gradientCache.set(name, gradient)
  return gradient
}
