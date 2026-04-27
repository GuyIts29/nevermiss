import { useRef, useState, useEffect } from 'react'
import { Crown, Camera, X, Mic } from 'lucide-react'
import { useT } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import type { MediaAttachment } from '@/types'

interface MediaAttachmentPickerProps {
  value: MediaAttachment | null
  onChange: (media: MediaAttachment | null) => void
  isPremium: boolean
}

export function MediaAttachmentPicker({ value, onChange, isPremium }: MediaAttachmentPickerProps) {
  const t = useT()
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<'image' | 'voice'>('image')
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  const handleStopRecording = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
  }

  // Auto-stop at 60 seconds is handled inside the setInterval in handleStartRecording

  if (!isPremium) {
    return (
      <div
        className="rounded-[var(--border-radius-lg)] p-4 flex flex-col items-center gap-2 text-center"
        style={{ border: '2px dashed #F59E0B', background: 'rgba(245,158,11,0.06)' }}
      >
        <Crown size={22} className="text-amber-500" />
        <p className="text-sm font-semibold text-amber-600">{t('media_premium_hint')}</p>
      </div>
    )
  }

  const compressImage = (dataUrl: string): Promise<string> =>
    new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        const MAX = 1200
        const ratio = Math.min(1, MAX / img.width, MAX / img.height)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = dataUrl
    })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setImageError(t('media_file_too_large'))
      e.target.value = ''
      return
    }
    setImageError(null)
    const reader = new FileReader()
    reader.onload = async () => {
      const raw = reader.result as string
      const dataUrl = file.size > 512 * 1024 ? await compressImage(raw) : raw
      onChange({
        type: 'image',
        dataUrl,
        mimeType: 'image/jpeg',
        fileName: file.name,
        sizeBytes: file.size,
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleStartRecording = async () => {
    setError(null)
    chunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        if (blob.size > 2 * 1024 * 1024) {
          setError(t('media_audio_too_large'))
          streamRef.current?.getTracks().forEach(tr => tr.stop())
          streamRef.current = null
          return
        }
        const reader = new FileReader()
        reader.onload = () => {
          onChange({
            type: 'audio',
            dataUrl: reader.result as string,
            mimeType: 'audio/webm',
            durationSeconds: elapsed,
          })
        }
        reader.readAsDataURL(blob)
        streamRef.current?.getTracks().forEach(tr => tr.stop())
        streamRef.current = null
      }

      recorder.start()
      setRecording(true)
      setElapsed(0)
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1
          if (next >= 60) {
            // Auto-stop: clear interval and stop recorder without going through setState in effect
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
              mediaRecorderRef.current.stop()
            }
            setRecording(false)
          }
          return next
        })
      }, 1000)
    } catch {
      setError(t('media_mic_error'))
    }
  }

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

  const tabBase =
    'flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold transition-all rounded-t-[var(--border-radius)] relative'

  return (
    <div
      className="rounded-[var(--border-radius-lg)] overflow-hidden"
      style={{ border: '1px solid var(--color-border)' }}
    >
      {/* Tab bar */}
      <div className="flex border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
        <button
          className={tabBase}
          style={{ color: activeTab === 'image' ? theme.primary : 'var(--color-text-muted)' }}
          onClick={() => setActiveTab('image')}
        >
          📷 {t('media_attach_image')}
          {activeTab === 'image' && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` }}
            />
          )}
        </button>
        <button
          className={tabBase}
          style={{ color: activeTab === 'voice' ? theme.primary : 'var(--color-text-muted)' }}
          onClick={() => setActiveTab('voice')}
        >
          🎙️ {t('media_attach_voice')}
          {activeTab === 'voice' && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` }}
            />
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="p-3 bg-[var(--color-surface)]">

        {/* ── Image tab ── */}
        {activeTab === 'image' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {value?.type === 'image' ? (
                <div className="relative shrink-0">
                  <img
                    src={value.dataUrl}
                    alt={value.fileName ?? 'attachment'}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <button
                    onClick={() => { onChange(null); setImageError(null) }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center bg-red-500 text-white shadow"
                    aria-label={t('media_remove')}
                  >
                    <X size={11} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-lg flex flex-col items-center justify-center gap-1 text-[var(--color-text-muted)] shrink-0 transition-colors hover:bg-[var(--color-surface-2)]"
                  style={{ border: '2px dashed var(--color-border)' }}
                >
                  <Camera size={22} />
                  <span className="text-[10px] font-medium">{t('media_attach_image')}</span>
                </button>
              )}

              {!value?.type && (
                <div className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {t('media_preview')}
                </div>
              )}

              {value?.type === 'image' && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold"
                  style={{ color: theme.primary }}
                >
                  {t('media_attach_image')}
                </button>
              )}
            </div>
            {imageError && (
              <p className="text-xs text-red-500">{imageError}</p>
            )}
          </div>
        )}

        {/* ── Voice tab ── */}
        {activeTab === 'voice' && (
          <div className="space-y-2">
            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}

            {value?.type === 'audio' ? (
              <div className="space-y-2">
                <audio controls src={value.dataUrl} className="w-full" />
                <button
                  onClick={() => onChange(null)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-500"
                >
                  <X size={12} />
                  {t('media_remove')}
                </button>
              </div>
            ) : recording ? (
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0" />
                <span className="text-sm font-bold tabular-nums text-[var(--color-text-primary)]">
                  {formatTime(elapsed)}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {t('media_record_limit')} 1:00
                </span>
                <button
                  onClick={handleStopRecording}
                  className="ml-auto flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
                >
                  {t('media_record_stop')}
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartRecording}
                className="flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-bold text-white w-full justify-center"
                style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
              >
                <Mic size={15} />
                {t('media_record_start')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
