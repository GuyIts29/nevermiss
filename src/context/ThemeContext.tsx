import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Theme, ThemeId } from '@/types'
import { THEMES, getRandomTheme, applyTheme } from '@/data/themes'
import { getSettings, setTheme as storeTheme } from '@/services/storageService'

interface ThemeContextValue {
  theme: Theme
  themeId: ThemeId
  setTheme: (id: ThemeId) => void
  availableThemes: Theme[]
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = getSettings().themeId
    if (saved && saved !== 'custom' && THEMES[saved]) {
      return THEMES[saved]
    }
    return getRandomTheme()
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = useCallback((id: ThemeId) => {
    const t = THEMES[id] ?? THEMES.ocean
    setThemeState(t)
    storeTheme(id)
    applyTheme(t)
  }, [])

  return (
    <ThemeContext.Provider value={{
      theme,
      themeId: theme.id,
      setTheme,
      availableThemes: Object.values(THEMES).filter(t => t.id !== 'custom'),
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
