const GUIDE_KEY = 'nm_guide_seen'
export const isGuideSeen = (): boolean => !!localStorage.getItem(GUIDE_KEY)
export const markGuideSeen = (): void => { localStorage.setItem(GUIDE_KEY, '1') }
export const resetGuide = (): void => { localStorage.removeItem(GUIDE_KEY) }
