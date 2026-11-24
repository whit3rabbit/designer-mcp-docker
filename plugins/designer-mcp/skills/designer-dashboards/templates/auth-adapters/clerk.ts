/**
 * Clerk (@clerk/nextjs) Managed Auth + Organizations + MFA Adapter Template
 * Install: pnpm add @clerk/nextjs
 * Required env vars (.env):
 *   - Client-safe: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, NEXT_PUBLIC_CLERK_SIGN_IN_URL, NEXT_PUBLIC_CLERK_SIGN_UP_URL
 *   - Server-ONLY (NEVER prefix with NEXT_PUBLIC_ or VITE_): CLERK_SECRET_KEY
 */
export const CLERK_ENV_VARS = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
] as const;

export const CLERK_ROUTE_GUIDE = `
// src/middleware.ts (Next.js App Router + @clerk/nextjs)
// 1. Protect private routes via clerkMiddleware() + createRouteMatcher(['/dashboard(.*)', '/admin(.*)', '/api/(.*)']).
// 2. Enforce await auth.protect() inside every protected /api/* route handler and Server Action (never middleware-only).
// 3. Store RBAC roles in Clerk Organization roles or publicMetadata (server-written only; never unsafeMetadata!).
// 4. For /admin/* routes, verify orgRole === 'org:admin' (or sessionClaims.metadata.role) AND require MFA via Clerk session claims.
// 5. Keep CLERK_SECRET_KEY strictly server-only; never expose via NEXT_PUBLIC_ or commit .env.
`;
