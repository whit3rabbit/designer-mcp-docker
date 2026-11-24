---
name: login
description: >-
  Authentication, login-area design, RBAC guards, and backend-aware security builder
  (designer-dashboards:login). Generates the 7-page core auth suite (login, register, forgot,
  reset, 2FA/OTP, verify-email, 401/403) across reusable shells (split/cover, basic, boxed),
  single-source RBAC authority guards, JWT/OAuth/session adapters (Auth.js + Prisma,
  Supabase, Better Auth, Custom JWT + Local DB), and XSS/SQLi/cookie/password hardening.
  Use when building or hardening login, register, OTP, RBAC guards, auth adapters, or
  auth security.
---

# `designer-dashboards:login` — Auth Flows, Login Shells & Backend-Aware Security

Use this skill when building or hardening authentication pages, JWT/OAuth/session flows, RBAC guards, and frontend/backend security boundaries. For full architecture tables, 17-template pitfalls, and token lifetimes, read [05-auth-and-security.md](../references/05-auth-and-security.md).

## Step 1: Clarify Auth Architecture & Requirements

If not already decided, ask the user (via `ask_question`):
1. **Auth Strategy & Storage (Outside Service vs Local Database):**
   - `(Recommended) Auth.js / NextAuth + Prisma` (Next.js + local SQLite/Postgres, encrypted JWE or DB sessions + OAuth)
   - `Better Auth` (Full-stack TS + local DB with built-in 2FA, Organizations & rate limiting)
   - `Supabase Auth` (Managed outside service + Postgres + OAuth + RLS; store roles in `app_metadata`/RLS, never `user_metadata`)
   - `Custom JWT + Local DB` (Separate SPA + API: 5–15m Access JWT + rotating 7–30d `HttpOnly` Refresh cookie + `Argon2id`)
   - `Demo / Mock Mode` (UI prototyping only — emits explicit non-production banner)
2. **Login Shell Style:**
   - `(Recommended) split` (Cover/split-screen: brand/metrics panel + form)
   - `basic` (Centered clean card on tinted canvas)
   - `boxed` (Compact framed card with inline brand header)
3. **Portal Architecture (User Login vs Admin Login):**
   - `(Recommended) Dual Portal (/login + /admin/login)` — Standard user sign-in with OAuth & self-registration at `/login`, PLUS a hardened administrator portal at `/admin/login` (no self-registration, `min 12` char password, explicit `admin`/`superadmin` role check, mandatory 2FA/OTP step, guarded by `<AdminGuard>`).
   - `Single Unified Portal (/login)` — One login screen routing by role after authentication.
4. **Auth Features:**
   - Core 7-page set (`login`, `register`, `forgot-password`, `reset-password`, `two-factor`, `verify-email`, `401`/`403`) + `/admin/login` + `/auth/callback` + `/logout` + `privacy-policy` & `terms-of-service` + optional `create-password`, `lock-screen`, and `/settings/roles`.
   - Generate all routes & adapter templates on demand via:
     ```bash
     node <designer-dashboards-root>/scripts/generate.mjs auth-suite --out <project-dir> --adapter <authjs-prisma|supabase|better-auth|custom-jwt>
     ```

## Step 2: Build the Dedicated Guest Shell & Core 7 Pages

1. **Mount inside `(auth)/(guest-only)` blank layout** (zero dashboard sidebar/topbar chrome, full light/dark mode + RTL support). Keep `/401` and `/403` outside protected guards to avoid redirect loops.
2. **Create one reusable `<AuthShell variant="split|basic|boxed">`** so switching visual style never duplicates form code.
3. **Generate the 7 core pages + legal**, each with colocated `zod` schema + `react-hook-form` (and mirrored server-side validation):
   - `login`: email (`autoComplete="email"`), password (`type={show ? 'text' : 'password'}`, `autoComplete="current-password"`), wired remember-me, forgot-password link, submit, OAuth (PKCE + `email_verified`), sign-up link.
   - `register`: name (`autoComplete="name"`), email, password (`min(8).max(128)`, `autoComplete="new-password"`) + strength feedback, bound terms/privacy checkbox, OAuth.
   - `forgot-password`: email input -> anti-enumeration confirmation ("If an account exists...").
   - `reset-password`: single-use hashed token (15–60m TTL) + new password (`min(8).max(128)`) + confirm password.
   - `two-factor`: real 6-digit OTP (`input-otp`, allows digits `0-9`, `inputMode="numeric"`, `autoComplete="one-time-code"`, paste support, resend cooldown, max 5 attempts).
   - `verify-email`: signed/hashed token check + resend CTA.
   - `401` / `403`: clear "Not Authorized" / "Forbidden" recovery pages.

## Step 3: Wire Single-Source RBAC & Server-Aware Guard Chain

- **Server-side first (Next.js / SSR):** Protect `(dashboard)/(private)/layout` on the server AND enforce `getServerSession(authOptions)` + role checks inside **every** `/api/*` route handler and `'use server'` action. Never rely on layout-only guards.
- **SPA guard chain:** `GuestOnlyRoute` and `ProtectedRoute` -> `AuthorityGuard` (`useAuthority(item.authority)`) -> `<AdminGuard>` -> `PageContainer` (or Vue `beforeEach` returning route locations — never `useRouter()` inside `beforeEach`, never fail-open `else { next(); }`).
- **Fail-closed RBAC:** `useAuthority` must return `false` when a route requires roles and `user.roles` is empty. Read `authority?: string[]` from `src/configs/navigation.config.ts` as the single source of truth.

## Step 4: Security & Auth Checklist (Advisory Pre-Handoff Gate)

> All choices remain with the user (framework, outside service vs. local DB, Docker, hashing algorithm). Treat this checklist as recommended defaults to review before handoff:

- [ ] **No Fake Prod Auth / Hardcoded Secrets:** Zero hardcoded API keys, OAuth secrets, `dev.db`, or demo credentials in prod; `.env.example` documents all vars; `.env*` is gitignored; no `NEXT_PUBLIC_`/`VITE_` on server secrets (`SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, `GEMINI_API_KEY`).
- [ ] **Docker & Env Hygiene (if containerized):** `.dockerignore` excludes `.env*` and `*.db`; secrets injected at runtime (never `COPY .env` or `ARG`/`ENV` secrets in `Dockerfile`); non-root container user.
- [ ] **Password Salting & Policy:** Min `8–12` chars (`12+` for admin), max `128` chars enforced client + server; `Argon2id`, `scrypt`, or `bcrypt >= 12` (auto per-user random salt, optional env pepper; never plaintext `===` or static salt); zero `console.log` of form values.
- [ ] **API Keys (if dashboard issues keys):** CSPRNG-generated with prefix, shown once on creation, stored hashed (SHA-256) in DB with scopes/expiry/revocation.
- [ ] **Cookies & Token Lifetimes:** `HttpOnly`, `Secure` (prod), `SameSite=Lax|Strict` set; access JWT `5–15m`, rotating refresh/session `7–30d`, reset/verify tokens `15–60m` hashed; no JWTs in `localStorage` for SSR apps; `JSON.parse` on cookies wrapped in `try/catch`.
- [ ] **XSS & Injection Defense:** `DOMPurify.sanitize()` wraps any `dangerouslySetInnerHTML`/`v-html`/`[innerHTML]`/Markdown sink; zero `eval()`/`new Function()`; parameterized ORM only (no raw SQL); explicit field allowlists on updates (no mass assignment); Supabase RLS + `app_metadata` (never `user_metadata` for roles).
- [ ] **CSRF, Redirects, Rate Limits & Headers:** CSRF protection on state-changing routes; `resolvePostLoginRedirect()` blocks `//`, `/\\`, and external URLs; rate limiting (e.g., 5/15m) on login/OTP/reset; CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` configured.
- [ ] **Form & Link Accessibility:** `<label htmlFor>`, `aria-invalid`, `aria-describedby`, `rel="noopener noreferrer"` on `target="_blank"`.
- [ ] **Frontend Logs & Source Maps:** Zero `console.log` of passwords/OTPs/tokens/PII; scrub sensitive fields from Sentry/telemetry; disable public production source maps.
- [ ] **Supply Chain & Dependencies:** Lockfile committed (`--frozen-lockfile` in CI); `pnpm audit`/Dependabot enabled; external CDN scripts pinned with SRI (`integrity="sha384-..."`); unused/legacy libs removed.
- [ ] **Frontend DOM, URLs & Storage:** Validate `href`/`src` protocols (block `javascript:`); verify `event.origin` on `postMessage` + `sandbox` on iframes; wrap `JSON.parse` on storage/cookies in `try/catch`; validate uploaded file size/MIME client-side.
