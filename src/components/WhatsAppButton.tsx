import { useState } from 'react'
import { MessageCircle, AlertTriangle, X, ExternalLink } from 'lucide-react'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { openWhatsApp } from '@/services/communicationService'
import { useT } from '@/context/LanguageContext'
import type { MediaAttachment } from '@/types'

interface WhatsAppButtonProps {
  phone: string
  message: string
  contactName: string
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  media?: MediaAttachment | null
}

export function WhatsAppButton({ phone, message, contactName, size = 'md', fullWidth, media }: WhatsAppButtonProps) {
  const [showWarning, setShowWarning] = useState(false)
  const t = useT()

  const handleSend = () => {
    openWhatsApp(phone, message)
    setShowWarning(false)
  }

  if (!phone) return null

  return (
    <>
      <button
        onClick={() => setShowWarning(true)}
        className={`flex items-center justify-center gap-2 font-bold rounded-[var(--border-radius)] transition-all active:scale-[0.97] text-white ${fullWidth ? 'w-full' : ''} ${
          size === 'sm' ? 'h-8 px-3 text-xs' :
          size === 'lg' ? 'h-12 px-6 text-base' :
          'h-10 px-4 text-sm'
        }`}
        style={{
          background: 'linear-gradient(135deg, #25D366, #128C7E)',
          boxShadow: '0 3px 12px rgba(37, 211, 102, 0.35)',
        }}
      >
        <MessageCircle size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
        {t('whatsapp_btn')}
      </button>

      <Modal
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        title={t('whatsapp_title')}
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" fullWidth onClick={() => setShowWarning(false)}
              icon={<X size={14} />}>
              {t('cancel')}
            </Button>
            <button
              className="flex-1 flex items-center justify-center gap-2 h-9 px-4 text-sm font-bold rounded-[var(--border-radius)] text-white transition-all active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
              }}
              onClick={handleSend}
            >
              <ExternalLink size={14} />
              {t('whatsapp_open')}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-[var(--border-radius)] border"
            style={{ background: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {t('whatsapp_warning', { name: contactName })}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {t('whatsapp_notice')}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-1.5">
              {t('whatsapp_preview')}
            </p>
            <div className="p-3 rounded-[var(--border-radius)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              {media && (
                <div className="mb-3 space-y-2">
                  {media.type === 'image' ? (
                    <img src={media.dataUrl} alt="attachment" className="w-full max-h-40 object-cover rounded-lg" />
                  ) : (
                    <audio controls src={media.dataUrl} className="w-full" />
                  )}
                  <a
                    href={media.dataUrl}
                    download={media.fileName ?? (media.type === 'image' ? 'greeting.jpg' : 'greeting.webm')}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium"
                    style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}
                  >
                    ⬇️ {t('media_save_device')}
                  </a>
                  <p className="text-xs text-center px-2" style={{ color: 'var(--color-text-muted)' }}>
                    {t('media_whatsapp_hint')}
                  </p>
                </div>
              )}
              <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap line-clamp-4 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
