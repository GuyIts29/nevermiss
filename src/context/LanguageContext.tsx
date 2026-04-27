import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type Lang, type TranslationKey, t as translate } from '@/i18n'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
})

const STORAGE_KEY = 'nm_lang'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'he' ? 'he' : 'en'
  })

  useEffect(() => {
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (next: Lang) => {
    localStorage.setItem(STORAGE_KEY, next)
    setLangState(next)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}

export function useT() {
  const { lang } = useLang()
  return (key: TranslationKey, vars?: Record<string, string | number>) =>
    translate(lang, key, vars)
}
