export const APP_CONFIG = {
  appName: 'NeverMiss',
  appTagline: 'Never miss a meaningful moment',
  appVersion: '1.0.0',
  buildNumber: 1,
  releaseDate: '2026-04-26',
  environment: (import.meta.env.MODE as 'development' | 'staging' | 'production') || 'development',

  // Mobile store versions
  android: {
    versionName: '1.0.0',
    versionCode: 1,
  },
  ios: {
    bundleVersion: '1.0.0',
    bundleShortVersionString: '1.0',
  },

  // Feature flags
  features: {
    rive: false,        // enable @rive-app/react-canvas animations
    lottie: true,       // enable lottie animations
    pwa: true,
    darkMode: true,
  },

  // Limits
  limits: {
    free: {
      contacts: 20,
      groups: 2,
    },
    premium: {
      contacts: Infinity,
      groups: Infinity,
    },
  },

  // Premium pricing
  pricing: {
    monthly: '₪29',
    annual: '₪249',
    currency: 'ILS',
  },

  // Storage keys
  storageKeys: {
    contacts: 'nm_contacts',
    groups: 'nm_groups',
    greetingDrafts: 'nm_drafts',
    settings: 'nm_settings',
    premium: 'nm_premium',
    onboarding: 'nm_onboarding_done',
    lastSeenVersion: 'nm_last_version',
    usedCoupons: 'nm_used_coupons',
    lastChannels: 'nm_last_channels',
    landing: 'nm_dont_show_landing',
  },

  // Domain suggestions
  domains: [
    'nevermiss.app',
    'bondly.app',
    'greetly.app',
    'relationly.app',
    'cultureconnect.app',
  ],
} as const
