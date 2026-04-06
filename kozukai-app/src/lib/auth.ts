const PIN_KEY = 'kozukai_pin';
const SESSION_KEY = 'kozukai_session';

export function getStoredPin(): string {
  return localStorage.getItem(PIN_KEY) ?? '1234';
}

export function setStoredPin(pin: string): void {
  localStorage.setItem(PIN_KEY, pin);
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(SESSION_KEY) === 'authenticated';
}

export function login(): void {
  localStorage.setItem(SESSION_KEY, 'authenticated');
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}
