/**
 * Auth.js / NextAuth + Prisma (Local DB) Backend Adapter Template
 * Install: pnpm add next-auth @auth/prisma-adapter @prisma/client @node-rs/argon2
 * Required env vars (.env): DATABASE_URL, AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 */
export const AUTHJS_ENV_VARS = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
] as const;

export const NEXTAUTH_ROUTE_GUIDE = `
// src/auth.ts (Next.js App Router + Auth.js + Prisma)
// 1. Use a globalThis Prisma singleton in dev; never commit prisma/dev.db with tokens/users.
// 2. Store role ('user' | 'manager' | 'admin' | 'superadmin') and mfaEnabled on Prisma User model.
// 3. Hash passwords with Argon2id (@node-rs/argon2) or bcrypt (cost >= 12); enforce min 8 (12 admin), max 128.
// 4. Query Prisma directly in authorize() — NEVER self-fetch /api/login or compare plaintext ===.
// 5. Configure explicit session maxAge (e.g. 7d/30d) + HttpOnly, SameSite=Lax, Secure cookies.
// 6. Expose token.id, token.roles, and token.mfaVerified in jwt() and session() callbacks.
// 7. Always pass authOptions to getServerSession(authOptions) in layouts, /api/* routes, and Server Actions.
// 8. Enforce admin role + mfaVerified in middleware.ts AND server actions for /admin/*; rate-limit login/OTP.
`;
