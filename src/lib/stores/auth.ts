/**
 * Authentication state management using localStorage
 */

const AUTH_KEY = 'bookwaves_auth_user';

export function getAuthUser(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(AUTH_KEY);
}

export function setAuthUser(username: string): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(AUTH_KEY, username);
}

export function clearAuthUser(): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
	return getAuthUser() !== null;
}
