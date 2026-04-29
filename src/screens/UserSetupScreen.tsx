import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '@/context/LanguageContext'
import { saveUserName } from '@/services/userProfileService'
import { APP_CONFIG } from '@/config/appConfig'

export function UserSetupScreen() {
  const [name, setName] = useState('')
  const navigate = useNavigate()
  const t = useT()

  const proceed = (skip = false) => {
    if (!skip && name.trim()) saveUserName(name.trim())
    navigate('/dashboard', { replace: true })
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-8 text-center"
      style={{ background: 'var(--color-background)' }}
    >
      <div className="text-5xl mb-5">👋</div>

      <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] mb-2 tracking-tight">
        {t('setup_title')}
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8 max-w-xs">
        {t('setup_subtitle')}
      </p>

      <input
        type="text"
        autoFocus
        className="input w-full max-w-xs text-center text-lg mb-5"
        placeholder={t('setup_placeholder')}
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && proceed()}
        maxLength={40}
        aria-label={t('setup_placeholder')}
      />

      <button
        onClick={() => proceed()}
        className="btn btn-primary w-full max-w-xs py-3 text-base font-extrabold"
        style={{ minHeight: '48px' }}
      >
        {t('setup_cta')}
      </button>

      <button
        onClick={() => proceed(true)}
        className="mt-4 text-sm text-[var(--color-text-muted)] underline underline-offset-2"
      >
        {t('skip')}
      </button>

      <p className="mt-8 text-xs text-[var(--color-text-muted)] opacity-60">
        {APP_CONFIG.appName}
      </p>
    </div>
  )
}
