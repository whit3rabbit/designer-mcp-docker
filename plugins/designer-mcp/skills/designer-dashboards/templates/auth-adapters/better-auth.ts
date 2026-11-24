/**
 * Better Auth (Full-Stack TypeScript + Local DB + Built-In 2FA, Admin & Rate Limit) Adapter Template
 * Install: pnpm add better-auth
 * Required env vars (.env): DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
 */
export const BETTER_AUTH_ENV_VARS = [
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
] as const;

export const BETTER_AUTH_GUIDE = `
// Enable twoFactor(), admin(), and rateLimit in betterAuth({ ... }):
// - User portal (/login, /register) uses emailAndPassword (minPasswordLength: 8, maxPasswordLength: 128) + OAuth.
// - Admin portal (/admin/login) checks session.user.role === 'admin' AND enforces twoFactor TOTP.
// - Configure session.expiresIn (e.g. 60 * 60 * 24 * 7), session.updateAge, and advanced.useSecureCookies in prod.
// - Enable rateLimit: { window: 60, max: 10 } (stricter on /sign-in and /two-factor).
`;
