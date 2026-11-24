/**
 * Custom JWT + Local Database (Prisma/Drizzle) Adapter Template
 * Install: pnpm add jose @node-rs/argon2
 * Required env vars (.env): DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
 */
export const CUSTOM_JWT_ENV_VARS = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
] as const;

export const CUSTOM_JWT_GUIDE = `
// Backend-aware JWT architecture (for separate SPA + API or custom Node/Next APIs):
// 1. Access JWT: 5-15 min TTL, signed with HS256/EdDSA (explicit algorithms: ['HS256'], reject alg=none).
//    Keep in memory (or short-lived HttpOnly cookie) — NEVER store long-lived JWTs in localStorage.
// 2. Refresh Token: 7-30 day TTL in HttpOnly; Secure; SameSite=Lax; Path=/api/auth/refresh cookie.
//    Store SHA-256 hash in DB (RefreshToken table); rotate on every use and revoke token family on reuse.
// 3. Passwords: Hash with Argon2id (@node-rs/argon2); enforce min 8 (12 admin), max 128 chars.
// 4. SQLi & Mass Assignment: Use parameterized Prisma/Drizzle queries and explicit Zod field picklists.
// 5. Rate-limit /login, /register, /forgot-password, and /verify-otp (e.g., 5 attempts / 15 min).
`;
