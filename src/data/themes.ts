import type { Theme, ThemeId } from '@/types'

export const THEMES: Record<ThemeId, Theme> = {
  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    primary: '#1D6FEB',
    primaryDark: '#1558C8',
    secondary: '#06B6D4',
    background: '#EFF8FF',
    surface: '#FFFFFF',
    surface2: '#DBEAFE',
    accent: '#BFDBFE',
    textPrimary: '#0F172A',
    textSecondary: '#1E3A5F',
    textMuted: '#4B7BA5',
    border: '#BFDBFE',
    shadowColor: 'rgba(29, 111, 235, 0.16)',
    borderRadius: '12px',
    borderRadiusLg: '20px',
    isDark: false,
  },
  forest: {
    id: 'forest',
    name: 'Forest Green',
    primary: '#16A34A',
    primaryDark: '#15803D',
    secondary: '#4ADE80',
    background: '#F0FDF4',
    surface: '#FFFFFF',
    surface2: '#DCFCE7',
    accent: '#BBF7D0',
    textPrimary: '#052E16',
    textSecondary: '#14532D',
    textMuted: '#3D7A52',
    border: '#BBF7D0',
    shadowColor: 'rgba(22, 163, 74, 0.16)',
    borderRadius: '14px',
    borderRadiusLg: '22px',
    isDark: false,
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Orange',
    primary: '#F97316',
    primaryDark: '#EA580C',
    secondary: '#FBBF24',
    background: '#FFF7ED',
    surface: '#FFFFFF',
    surface2: '#FFEDD5',
    accent: '#FED7AA',
    textPrimary: '#431407',
    textSecondary: '#7C2D12',
    textMuted: '#9A3412',
    border: '#FED7AA',
    shadowColor: 'rgba(249, 115, 22, 0.16)',
    borderRadius: '10px',
    borderRadiusLg: '18px',
    isDark: false,
  },
  purple: {
    id: 'purple',
    name: 'Purple Haze',
    primary: '#8B5CF6',
    primaryDark: '#7C3AED',
    secondary: '#C084FC',
    background: '#F5F3FF',
    surface: '#FFFFFF',
    surface2: '#EDE9FE',
    accent: '#DDD6FE',
    textPrimary: '#1E1B4B',
    textSecondary: '#2E1065',
    textMuted: '#5B21B6',
    border: '#DDD6FE',
    shadowColor: 'rgba(139, 92, 246, 0.18)',
    borderRadius: '16px',
    borderRadiusLg: '24px',
    isDark: false,
  },
  rose: {
    id: 'rose',
    name: 'Rose Gold',
    primary: '#F43F5E',
    primaryDark: '#E11D48',
    secondary: '#FB7185',
    background: '#FFF1F2',
    surface: '#FFFFFF',
    surface2: '#FFE4E6',
    accent: '#FECDD3',
    textPrimary: '#4C0519',
    textSecondary: '#881337',
    textMuted: '#9F1239',
    border: '#FECDD3',
    shadowColor: 'rgba(244, 63, 94, 0.16)',
    borderRadius: '14px',
    borderRadiusLg: '22px',
    isDark: false,
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Dark',
    primary: '#818CF8',
    primaryDark: '#6366F1',
    secondary: '#A5B4FC',
    background: '#080818',
    surface: '#12123A',
    surface2: '#1A1A4A',
    accent: '#2D2B7A',
    textPrimary: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    border: '#2D2D60',
    shadowColor: 'rgba(129, 140, 248, 0.22)',
    borderRadius: '12px',
    borderRadiusLg: '20px',
    isDark: true,
  },
  custom: {
    id: 'custom',
    name: 'Custom Theme',
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    secondary: '#0EA5E9',
    background: '#F0F9FF',
    surface: '#FFFFFF',
    surface2: '#E0F2FE',
    accent: '#BAE6FD',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    border: '#CBD5E1',
    shadowColor: 'rgba(37, 99, 235, 0.12)',
    borderRadius: '12px',
    borderRadiusLg: '20px',
    isDark: false,
  },
}

export const THEME_LIST = Object.values(THEMES).filter(t => t.id !== 'custom')

export function getRandomTheme(): Theme {
  const themes = THEME_LIST
  return themes[Math.floor(Math.random() * themes.length)]
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.style.setProperty('--color-primary', theme.primary)
  root.style.setProperty('--color-primary-dark', theme.primaryDark)
  root.style.setProperty('--color-secondary', theme.secondary)
  root.style.setProperty('--color-background', theme.background)
  root.style.setProperty('--color-surface', theme.surface)
  root.style.setProperty('--color-surface-2', theme.surface2)
  root.style.setProperty('--color-accent', theme.accent)
  root.style.setProperty('--color-text-primary', theme.textPrimary)
  root.style.setProperty('--color-text-secondary', theme.textSecondary)
  root.style.setProperty('--color-text-muted', theme.textMuted)
  root.style.setProperty('--color-border', theme.border)
  root.style.setProperty('--shadow-color', theme.shadowColor)
  root.style.setProperty('--border-radius', theme.borderRadius)
  root.style.setProperty('--border-radius-lg', theme.borderRadiusLg)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.primary)
}
