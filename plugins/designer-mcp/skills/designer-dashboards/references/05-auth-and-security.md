# Reference 05: Auth, Login Flows, RBAC & Backend-Aware Security

Distilled from a deep security audit of 17 commercial dashboard templates.

## Contents

- [1. Core 7-Page Auth Suite (+ Essential Add-Ons)](#1-core-7-page-auth-suite--essential-add-ons)
- [2. Reusable Auth Shell Variants](#2-reusable-auth-shell-variants)
- [3. Auth Architecture: JWT vs Session vs OAuth & Outside Services vs Local DB](#3-auth-architecture-jwt-vs-session-vs-oauth--outside-services-vs-local-db)
- [4. Cookie Lifetimes, Flags & Session Hardening](#4-cookie-lifetimes-flags--session-hardening)
- [5. Password Policy, Hashing & Form Hygiene](#5-password-policy-hashing--form-hygiene)
- [6. Backend-Aware Vulnerability Prevention (XSS, SQLi, CSRF, Open Redirect, Headers)](#6-backend-aware-vulnerability-prevention-xss-sqli-csrf-open-redirect-headers)
- [7. Unified Guard Chain & Admin vs User Separation](#7-unified-guard-chain--admin-vs-user-separation)
- [8. Advisory Recommendations: `.env`, Docker, API Keys & Salting (User Choice)](#8-advisory-recommendations-env-docker-api-keys--salting-user-choice)
- [9. Security & Auth Checklist (Advisory Pre-Handoff Gate)](#9-security--auth-checklist-advisory-pre-handoff-gate)

---

## 1. Core 7-Page Auth Suite (+ Essential Add-Ons)

Generate this complete baseline set, reusing **one** form-body component per flow across selectable layout shells:
1. `login` — email, password with accessible show/hide toggle (`autoComplete="current-password"`), remember-me (wired to session TTL), forgot-password link, OAuth divider + social buttons, register footer.
2. `register` — name (`autoComplete="name"`), email (`autoComplete="email"`), password (`autoComplete="new-password"`) with live strength meter, terms/privacy checkbox (bound + validated), OAuth.
3. `forgot-password` — email entry -> generic confirmation state ("If an account exists for X, a reset link has been sent" — prevents account enumeration).
4. `reset-password` — token-backed new password + confirmation (always a separate route from forgot; single-use hashed token with 15–60 min expiry).
5. `two-factor` / `otp` — real `input-otp` 6-digit component (`inputMode="numeric"`, `autoComplete="one-time-code"`, digits `0-9` allowed, paste support, resend cooldown).
6. `verify-email` — signed/hashed token verification + status + rate-limited resend action.
7. `401-unauthorized` (and `403-forbidden`) — clear recovery CTA to sign-in or dashboard; never trap unauthenticated users in a redirect loop.

Optional add-ons & callbacks: `/admin/login` (hardened admin portal), `/auth/callback` (OAuth/magic-link handler), `/logout` (POST/server session invalidation + full client state reset), `create-password` (invite onboarding), `lock-screen` (must re-authenticate server-side, never client-only), `account-restricted` / `under-maintenance` / `coming-soon`, in-app 2FA enrollment/step-up modal, and generated `privacy-policy` & `terms-of-service` pages (no dead `#` or `javascript:void(0)` links).

---

## 2. Reusable Auth Shell Variants

Multiply visual variety by shell, never by duplicating form logic:
- **`split` / `cover`** (default SaaS premium): 50/50 or 60/40 split with brand illustration/gradient/media/metrics panel on one side (with `prefers-reduced-motion` fallback) and form card on the other.
- **`basic`**: Centered clean card on subtle tinted canvas with logo above.
- **`boxed`**: Framed card combining compact brand header + form.
- **`wide` / `modern`**: Full-width asymmetric or modern glassmorphic card shell.

All auth routes mount inside a dedicated `(guest-only)` blank layout (zero sidebar/topbar chrome) and fully support light/dark mode, i18n-translated copy/Zod errors, and RTL.

---

## 3. Auth Architecture: JWT vs Session vs OAuth & Outside Services vs Local DB

Choose the right auth architecture for the user's stack — **never** ship cosmetic `localStorage` fake auth in production:

| Approach | Best For | Token / Session Storage | Key Security Controls |
|---|---|---|---|
| **Auth.js / NextAuth + Prisma** (Local DB) | Next.js + SQL (Postgres/SQLite) | Encrypted JWE cookie (`HttpOnly`, `SameSite=Lax`, `Secure`) or DB session | Pass `authOptions` to `getServerSession(authOptions)`; `Argon2id`/`bcrypt` for credentials; never self-fetch `/api/login` |
| **Better Auth** (Local DB) | Modern TS full-stack (Next/Vite/Bun) | `HttpOnly`, `SameSite=Lax`, `Secure` session cookie | Built-in `twoFactor()` + `admin()` plugins, rate limiting, Drizzle/Prisma adapter |
| **Custom JWT + Local DB** (Prisma/Drizzle) | Separate SPA (React/Vue/Angular) + API | Short-lived Access JWT (**5–15 min**, in-memory or `HttpOnly` cookie) + Rotating Refresh Token (**7–30 days**, `HttpOnly; Secure; SameSite=Lax`, hashed in DB) | Refresh token rotation with reuse detection; `alg` pinned (`HS256`/`EdDSA`/`RS256`, reject `alg: none`); never store JWTs in `localStorage` |
| **Supabase Auth** (Outside Service) | Rapid Postgres + OAuth + RLS | `@supabase/ssr` `HttpOnly` cookies (avoid `localStorage` for SSR apps) | Store roles in `app_metadata` or RLS-protected `profiles` table — **never** `user_metadata` (user-editable!); `security_invoker = true` on views; keep `SUPABASE_SERVICE_ROLE_KEY` server-only |
| **Managed IdP (Auth0 / Clerk / Firebase Modular v11)** | Zero-auth-ops SaaS + enterprise SSO | Provider `HttpOnly` session cookie or short-lived ID token verified server-side | Verify tokens on the backend with Admin SDK; use modular Firebase v11 (`firebase/auth`), never compat SDK; never commit `serviceAccountKey` |
| **OAuth 2.0 / OIDC (Google, GitHub, etc.)** | Social & enterprise login | Authorization Code Flow + **PKCE** + `state` + `nonce` | Require `email_verified === true` before linking accounts by email; sanitize `callbackUrl` |
| **Demo / Mock Mode** | Rapid UI prototyping only | Explicit `AUTH_MODE=demo` gate | Emit unmistakable non-production banner; never default in production |

---

## 4. Cookie Lifetimes, Flags & Session Hardening

Always configure explicit cookie attributes and lifetimes (never leave defaults undocumented):

- **Required Cookie Flags:**
  - `HttpOnly: true` — blocks `document.cookie` access (mitigates XSS token theft).
  - `Secure: true` (in production HTTPS; use `__Host-` prefix when possible to bind path `/` and prevent subdomain cookie tossing).
  - `SameSite: 'lax'` (default for top-level OAuth/link navigation) or `'strict'` (for high-sensitivity admin portals).
  - `Path: '/'` (explicit).
- **Recommended Lifetimes (TTLs):**
  - **Access JWT:** `5–15 minutes` (short-lived so revocation lag is minimal).
  - **Refresh Token (rotating):** `7–30 days` (invalidate entire family on reuse detection).
  - **Server Session Cookie:** `2–24 hours` idle timeout (standard) or `7–30 days` when "Remember me" is explicitly checked; `15–60 minutes` idle for privileged admin sessions.
  - **Password Reset / Email Verification Token:** `15–60 minutes`, single-use, stored **hashed** (`SHA-256`) in DB.
  - **2FA / OTP Code:** `5–10 minutes`, max `5` attempts before lock/invalidation.
- **Session Lifecycle:**
  - Regenerate session ID on login and privilege elevation (prevents session fixation).
  - Invalidate session server-side on `/logout` AND clear all client auth stores (`set({ user: null })` — never spread `{ ...state.user, ...{} }`).
  - Wrap any `JSON.parse(cookieValue)` in `try/catch` so malformed cookies never crash SSR.

---

## 5. Password Policy, Hashing & Form Hygiene

- **Length & Complexity (Frontend + Backend Mirrored):**
  - **Standard Users:** Minimum **8–12 characters**, maximum **128 characters** (prevents bcrypt 72-byte silent truncation and hashing DoS). Encourage passphrases; check against common/breached passwords where possible.
  - **Administrators:** Minimum **12 characters** + **mandatory 2FA/TOTP**.
- **Password Hashing (Backend):**
  - Prefer **`Argon2id`** (`argon2` / `@node-rs/argon2`) with memory >= 19 MiB, iterations >= 2, parallelism = 1.
  - Fallback: **`bcrypt`** with cost factor `>= 12` (never plaintext `===`, never MD5/SHA1/unsalted SHA256).
- **Form Input Hygiene:**
  - Always use `type={showPassword ? 'text' : 'password'}` (never leave register/reset/change-password inputs as `type="text"`!).
  - Always set semantic `autoComplete`: `"username"` / `"email"`, `"current-password"`, `"new-password"`, `"one-time-code"`.
  - **Never** `console.log` form values on auth/security forms (leaks plaintext passwords to browser/server logs).
  - **Never** pre-fill `defaultValues` with demo passwords in production templates.

---

## 6. Backend-Aware Vulnerability Prevention (XSS, SQLi, CSRF, Open Redirect, Headers)

Even when building a frontend dashboard, generated code must be backend-aware:

1. **XSS (Cross-Site Scripting) Prevention:**
   - Never use `dangerouslySetInnerHTML`, `v-html`, `[innerHTML]`, `{@html}`, `insertAdjacentHTML`, or `{!! !!}` with user/API/rich-text/markdown content unless sanitized with **`DOMPurify.sanitize()`** (e.g., `DOMPurify.sanitize(marked.parse(text))`).
   - Never call `eval()` or `new Function()` (e.g., for chart IDs or dynamic templates).
   - Add `rel="noopener noreferrer"` to every external `target="_blank"` link.
   - Validate theme/locale keys from `localStorage` or URL params against an explicit allowlist before applying them to `<link href>` or DOM attributes.
2. **SQL Injection, Mass Assignment & IDOR Prevention:**
   - Use parameterized queries via ORM (**Prisma**, **Drizzle**, **Eloquent**, **Django ORM**) — zero string-concatenated SQL (`$queryRawUnsafe`, `whereRaw` with interpolation).
   - Use explicit field allowlists on profile/user updates (never spread `req.body` or `$request->all()` into `.update()` — prevents mass-assignment of `role`, `is_admin`, `verified`).
   - Enable **Row-Level Security (RLS)** on Supabase/Postgres tables and `security_invoker = true` on views; scope single-record queries to `session.user.id` (prevents IDOR).
3. **CSRF & CORS:**
   - Use `SameSite=Lax|Strict` cookies + framework CSRF protection (Auth.js built-in CSRF, Laravel `XSRF-TOKEN`, Django `CsrfViewMiddleware`) or `Origin`/`Referer` verification on state-changing `POST`/`PUT`/`PATCH`/`DELETE` routes.
   - Never use `Access-Control-Allow-Origin: *` together with `Access-Control-Allow-Credentials: true`.
4. **Open Redirect Prevention:**
   - Always validate `callbackUrl` / `redirectTo` / `next` via `resolvePostLoginRedirect()` (`templates/auth-adapters/adapter.ts`): `decodeURIComponent`, require `startsWith('/') && !startsWith('//') && !startsWith('/\\')`. Never use `url.startsWith(baseUrl)` (bypassable via `https://app.com.evil.com`).
5. **Rate Limiting & Bot Protection:**
   - Rate-limit `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-otp`, and `/resend` (e.g., **5 attempts per 15 minutes** per IP + account identifier).
   - Add Turnstile / reCAPTCHA v2/v3 verification on public signup and password-reset endpoints.
6. **Security Headers (`next.config.*` / Express `helmet` / Nginx):**
   - `Content-Security-Policy` (restrict `script-src`, `object-src 'none'`, `frame-ancestors 'none'`)
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
   - `X-Frame-Options: DENY` (or `SAMEORIGIN`)
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
7. **Secrets, File Uploads & Path Traversal:**
   - **Never** prefix server secrets (`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `AUTH_SECRET`, `DATABASE_URL`) with `NEXT_PUBLIC_` or `VITE_`.
   - **Never** commit `.env`, `.env.staging`, or SQLite `dev.db` containing tokens/users.
   - **Never** expose file-reading endpoints (`?file=...`) without strict allowlists and `path.resolve` containment checks.
   - Validate file uploads by MIME type, extension allowlist, and size limit; store privately or strip executable types (avoid blind `ACL: 'public-read'`).

---

## 7. Unified Guard Chain & Admin vs User Separation

- **Dual Portal Separation:**
  - **User Login (`/login`):** `split` or `basic` shell, email/password + show/hide toggle, remember-me, OAuth social providers, forgot-password, and self-registration (`/register`).
  - **Admin Login (`/admin/login`):** `boxed` hardened shell (`AdminLoginFlow`), **no self-registration link**, minimum 12-char password policy, strict server + client `admin`/`superadmin` role check, and **mandatory 2FA/OTP step** (`OtpInput`).
- **Route Groups & Guards:**
  - **Next.js / SSR:** `(auth)/(guest-only)` redirects signed-in users to `/` via server layout guard; `(dashboard)/(private)` redirects unauthenticated users to `/login?callbackUrl=...` *before* sending protected HTML. Enforce `getServerSession(authOptions)` inside **every** `/api/*` route and `'use server'` action too (never layout-only!).
  - **SPA Guard Chain:** `GuestOnlyRoute` (auth routes) and `ProtectedRoute` -> `AuthorityGuard` -> `PageContainer` (or Vue `beforeEach` returning route objects — never calling `useRouter()` inside `beforeEach`, never failing open `else { next(); }`).
  - **Single Source of Truth (`useAuthority`):** `authority?: string[]` on `NavItem` in `navigation.config.ts` filters BOTH sidebar links and route access. **Fail closed:** if `requiredRoles.length > 0` and `user.roles.length === 0`, return `false`! Keep `/401` and `/403` outside protected guards so users aren't trapped in redirect loops.

---

## 8. Advisory Recommendations: `.env`, Docker, API Keys & Salting (User Choice)

> **Note:** Every pattern in `designer-dashboards` is an **advisory default, not a mandatory lock-in**. Users always choose their own auth provider, database, deployment target, and security tradeoffs.

### A. `.env` & Environment Separation
- Keep `.env.example` committed with **empty/placeholder** values; keep `.env` / `.env.local` in `.gitignore`.
- Use distinct credentials per environment (`dev`, `staging`, `prod`) and rotate secrets on team/environment changes.
- In production, prefer platform secret stores (Vercel/Cloudflare/Fly env bindings, Doppler, Infisical, AWS/GCP Secret Manager) over static `.env` files on disk.

### B. Docker & Container Hygiene (If Containerized)
- **Exclude secrets from images:** Add `.env*`, `*.db`, `*.sqlite`, `.git`, and `node_modules` to `.dockerignore`.
- **Never** `COPY .env` or bake secrets into `Dockerfile` `ARG` / `ENV` instructions (they remain visible in `docker history`). Inject secrets at runtime via `env_file:`, Docker `secrets:`, or BuildKit `--mount=type=secret`.
- Use multi-stage builds, run as a non-root user (`USER node` / `nextjs`), and keep `/api/health` minimal (`{ ok: true }` — no env/DB diagnostics).

### C. Dashboard-Issued API Keys (For SaaS / Developer Consoles)
If the dashboard includes an API Keys management page:
- Generate keys with a CSPRNG (`crypto.randomBytes(32).toString('base64url')`) and a clear prefix (e.g., `app_live_...`, `app_test_...`).
- **Display the full key once on creation**, then store only its **SHA-256 hash** (or HMAC-SHA256) + display prefix/last-4 in the database—never store or return plaintext keys on subsequent `GET` requests.
- Attach explicit scopes, optional expiration dates, and instant revocation.
- Proxy third-party API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, etc.) through authenticated backend routes; never expose them in client bundles (`NEXT_PUBLIC_*`/`VITE_*`) or set `dangerouslyAllowBrowser: true`.
- **AI Endpoint Hardening (`/api/ai/*`):** Require `getServerSession` / `auth()` + RBAC before calling any LLM provider, enforce per-user/tenant rate limits, cap `maxTokens` / `maxDuration` / prompt payload size, encrypt any BYOK (Bring-Your-Own-Key) user keys server-side with AES-256-GCM (never in `localStorage`), and Zod-whitelist all DataGrid NLQ filter fields/operators before querying the database.

### D. Password Salting, Hashing & Peppers
- **Per-user unique random salts** are mandatory to defeat rainbow tables and identical-password detection. **`Argon2id`**, **`scrypt`** (built into Node `node:crypto` with zero native dependencies), and **`bcrypt`** (`cost >= 12`) automatically generate a unique random salt per password—never roll a static/shared salt or bare `sha256(password + salt)`.
- Optional **server-side pepper**: HMAC the password with an env-stored `PASSWORD_PEPPER` secret (or pass it as `Argon2` secret) for defense-in-depth if the database is compromised without app environment access.

### E. Frontend Logging, Telemetry & Source Maps
- **Never log sensitive data in the browser:** Zero `console.log` of passwords, OTPs, JWTs, session payloads, or PII (a recurring flaw in commercial templates). Gate debug logs behind `import.meta.env.DEV` / `NODE_ENV !== 'production'`.
- **Scrub error telemetry:** Before sending errors to Sentry/LogRocket/analytics, strip `password`, `token`, `authorization`, `cookie`, and PII fields.
- **Protect source maps:** Disable public `.map` files in production builds (`sourcemap: false` or upload privately to your error tracker only).

### F. Frontend Supply Chain & Dependency Hygiene
- **Pin & verify dependencies:** Commit lockfiles (`pnpm-lock.yaml` / `package-lock.json`), use `--frozen-lockfile` / `npm ci` in CI, and run `pnpm audit` / Dependabot / Renovate regularly—especially on rich-text editors, Markdown parsers, chart engines, and SSR frameworks.
- **Bundle locally or use SRI:** Prefer bundled npm packages over external CDN `<script>` tags; if an external script/stylesheet is required, pin exact versions and add Subresource Integrity (`integrity="sha384-..." crossorigin="anonymous"`).
- **Trim attack surface:** Remove unused/legacy packages (`jquery`, `moment`, `axios-mock-adapter` in production) and review `postinstall` scripts on new dependencies.

### G. Additional Frontend DOM, URL & Storage Hardening
- **Safe URL protocols:** Validate user-supplied links/avatars before binding to `href` or `src` (allow only `https:`, `http:`, or relative `/`; block `javascript:` and `data:text/html`).
- **Iframe & `postMessage` isolation:** Sandbox embedded previews (`<iframe sandbox="...">`) and always verify `event.origin` inside `window.addEventListener('message', ...)` handlers.
- **Clickjacking & tabnabbing:** Use CSP `frame-ancestors 'none'` / `X-Frame-Options: DENY` and always pair `target="_blank"` with `rel="noopener noreferrer"`.
- **Client-side file validation & safe parsing:** Check file MIME/extension/size before `FileReader` or upload, wrap `JSON.parse()` on `localStorage`/cookies/query params in `try/catch`, and validate stored theme/locale keys against an allowlist.

---

## 9. Security & Auth Checklist (Advisory Pre-Handoff Gate)

Use this checklist before shipping any generated dashboard:

- [ ] **Auth Flows Complete:** `login`, `register`, `forgot-password`, `reset-password` (separate token route), `two-factor` (0–9 digits + paste + `one-time-code`), `verify-email`, `401`/`403`, `/logout`, `privacy-policy`, `terms-of-service`.
- [ ] **Real Backend & Hashing:** No `localStorage` fake auth or plaintext `===` password checks in prod; `Argon2id` or `bcrypt >= 12` used; `min 8–12` (`12+` admin), `max 128` enforced client + server.
- [ ] **Cookies & Tokens:** `HttpOnly`, `Secure` (prod), `SameSite=Lax|Strict` set; explicit TTLs (access 5–15m, refresh/session 7–30d with rotation); no JWTs in `localStorage` for SSR apps.
- [ ] **Server-Side Enforcement:** Every `/api/*` route, Server Action, and SSR layout checks session (`getServerSession(authOptions)`) + RBAC role; `useAuthority` fails closed on empty user roles.
- [ ] **XSS & Injection Safe:** `DOMPurify` wraps any HTML/Markdown sink; zero `eval()`/`new Function()`; parameterized ORM only (no raw SQL); Supabase uses `app_metadata` + RLS (never `user_metadata` for roles).
- [ ] **CSRF, Redirects & Rate Limits:** CSRF protection active on mutations; `resolvePostLoginRedirect()` blocks `//`, `/\\`, and external URLs; login/OTP/reset endpoints rate-limited.
- [ ] **Headers & Secrets:** CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` configured; zero `NEXT_PUBLIC_`/`VITE_` on private secrets; `.env.example` present; no `.env` or `dev.db` committed.
- [ ] **Form & A11y Hygiene:** `type="password"` with show/hide toggle, `autoComplete` tokens, `<label htmlFor>`, `aria-invalid`, `aria-describedby`, `rel="noopener noreferrer"` on `target="_blank"`, zero `console.log` of credentials.
