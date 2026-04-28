import { useState } from 'react'
import { X } from 'lucide-react'
import { useT } from '@/context/LanguageContext'
import {
  getAvailableChannels,
  openWhatsApp,
  openSms,
  openEmail,
  shareMessage,
  copyToClipboard,
  CHANNEL_COLORS,
  CHANNEL_ICONS,
} from '@/services/communicationService'
import { getLastUsedChannel, saveLastUsedChannel } from '@/services/storageService'
import { trackEvent } from '@/services/analyticsService'
import { hapticMedium } from '@/services/hapticService'
import type { Contact, CommunicationChannel, MediaAttachment } from '@/types'

interface ChannelPickerProps {
  contact: Contact
  message: string
  media?: MediaAttachment | null
  onClose: () => void
}

export function ChannelPicker({ contact, message, media, onClose }: ChannelPickerProps) {
  const t = useT()
  const [copied, setCopied] = useState(false)

  const lastUsed = getLastUsedChannel(contact.id)
  const channels = getAvailableChannels(contact)

  const channelLabel: Record<CommunicationChannel, string> = {
    whatsapp: t('channel_whatsapp'),
    sms: t('channel_sms'),
    email: t('channel_email'),
    copy: copied ? t('copied') : t('channel_copy'),
    share: t('channel_share'),
    slack: 'Slack',
    teams: 'Teams',
  }

  const handleSend = async (channel: CommunicationChannel) => {
    saveLastUsedChannel(contact.id, channel)
    trackEvent('greeting_sent', { channel })
    await hapticMedium()

    switch (channel) {
      case 'whatsapp':
        openWhatsApp(contact.phone!, message)
        onClose()
        break
      case 'sms':
        openSms(contact.phone!, message)
        onClose()
        break
      case 'email':
        openEmail(contact.email!, 'Greeting', message)
        onClose()
        break
      case 'copy':
        await copyToClipboard(message)
        setCopied(true)
        setTimeout(() => { setCopied(false); onClose() }, 1200)
        break
      case 'share':
        await shareMessage(message, contact.name)
        onClose()
        break
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl animate-slide-up"
        style={{ background: 'var(--color-surface)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-border)' }} />
        </div>

        <div className="px-5 pb-10 pt-2 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-[var(--color-text-primary)]">
              {t('channel_picker_title')}
            </h2>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-[var(--color-surface-2)] transition-colors"
              aria-label={t('close')}
            >
              <X size={18} className="text-[var(--color-text-muted)]" />
            </button>
          </div>

          {/* Channel list */}
          <div className="space-y-2">
            {channels.map(({ channel }) => {
              const color = CHANNEL_COLORS[channel]
              const icon = channel === 'copy' && copied ? '✅' : CHANNEL_ICONS[channel]
              const label = channelLabel[channel]
              const isLast = channel === lastUsed

              return (
                <button
                  key={channel}
                  onClick={() => handleSend(channel)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-[0.98]"
                  style={{
                    background: isLast
                      ? `linear-gradient(135deg, ${color}18, ${color}08)`
                      : 'var(--color-surface-2)',
                    border: isLast
                      ? `1.5px solid ${color}50`
                      : '1.5px solid transparent',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: `${color}22` }}
                  >
                    {icon}
                  </div>
                  <span className="flex-1 text-left font-semibold text-[var(--color-text-primary)] text-sm">
                    {label}
                  </span>
                  {isLast && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: color, color: '#fff' }}
                    >
                      {t('channel_last_used')}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* WhatsApp + media disclaimer */}
          {media && (
            <div
              className="flex items-start gap-2.5 p-3 rounded-xl"
              style={{ background: '#FEF3C7', border: '1px solid #FCD34D' }}
            >
              <span className="text-sm shrink-0">⚠️</span>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                {t('channel_whatsapp_attach')}
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-center text-[10px] text-[var(--color-text-muted)]">
            {t('channel_disclaimer')}
          </p>
        </div>
      </div>
    </div>
  )
}
