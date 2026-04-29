const KEY = 'nm_user_name'

export function getUserName(): string | null {
  return localStorage.getItem(KEY)
}

export function saveUserName(name: string): void {
  localStorage.setItem(KEY, name.trim())
}

export function isProfileSetup(): boolean {
  return !!getUserName()
}
