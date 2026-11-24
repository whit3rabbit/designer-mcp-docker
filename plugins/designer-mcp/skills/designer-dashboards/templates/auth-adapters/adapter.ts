import type { AuthUser } from './AuthSuite';

export interface AuthAdapter {
  signInWithPassword(email: string, password: string, portal: 'user' | 'admin'): Promise<AuthUser>;
  verifyTotp(userId: string, code: string): Promise<boolean>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthUser | null>;
}

/**
 * Recommended cookie & token lifetimes (seconds).
 * Always pair with HttpOnly, Secure (in prod), SameSite=Lax|Strict, Path=/.
 */
export const SECURITY_COOKIE_DEFAULTS = {
  accessTokenTtlSec: 15 * 60, // 15 minutes
  refreshTokenTtlSec: 7 * 24 * 60 * 60, // 7 days (30d with remember-me)
  sessionIdleTtlSec: 2 * 60 * 60, // 2 hours idle
  adminSessionIdleTtlSec: 30 * 60, // 30 minutes for privileged admin sessions
  resetTokenTtlSec: 30 * 60, // 30 minutes, single-use hashed in DB
  cookieFlags: {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  },
} as const;

export const PASSWORD_POLICY = {
  userMinLength: 8,
  adminMinLength: 12,
  maxLength: 128, // prevents bcrypt 72-byte truncation & hashing DoS
} as const;

/**
 * Role-aware post-login redirect resolver.
 * Never trust open external callbackUrl values; enforce relative paths only.
 * Guards against //evil.com, /\evil.com, and URL-encoded bypasses.
 */
export function resolvePostLoginRedirect(user: AuthUser, callbackUrl?: string | null): string {
  if (callbackUrl) {
    let decoded = callbackUrl;
    try {
      decoded = decodeURIComponent(callbackUrl);
    } catch {
      decoded = '';
    }
    const isSafeRelative =
      decoded.startsWith('/') &&
      !decoded.startsWith('//') &&
      !decoded.startsWith('/\\') &&
      !decoded.includes('://');
    if (isSafeRelative) {
      return decoded;
    }
  }
  const isAdmin = user.roles.includes('admin') || user.roles.includes('superadmin');
  return isAdmin ? '/settings' : '/dashboard/analytics';
}
