# Reference 07: State, Data Layer & AI Surfaces

Distilled from the 17-template commercial dashboard audit.

## 1. Scoped State Management (The Corpus Evolution)

Follow the proven generational evolution (`Redux-everything -> Scoped Redux -> Context -> Micro-stores/Signals`):
- **React / Next.js:** **Zustand** (`^5.1.0`) micro-stores split by concern (`themeStore`, `localeStore`, `authStore`, `routeKeyStore`, `aiStore`, plus per-app stores like `use<Feature>Store` mounted only around interactive routes so dashboard pages stay Server Components) with `persist` middleware. Never create a single monolithic global store, legacy Redux `connect()` HOCs, or 12 nested React Contexts.
- **Per-Route Overrides & Persistence:** `themeStore` exposes `updatePageSettings(partial)` for ephemeral `NavItem.meta` overrides, listens to `prefers-color-scheme` when `theme === 'system'`, and mirrors attributes (`data-theme`, `data-layout`, `data-navbar-style`, `data-layout-position`, `data-content-width`, `data-card-style`, `data-sidebar-skin`, `dir`) onto `<html>` (cookie-backed for SSR when needed). `authStore` supports pluggable persistence (`cookies | sessionStorage | localStorage`).
- **Fetch vs. UI State Boundary:** Use TanStack Query (`@tanstack/react-query`) or SWR strictly for server fetching & caching—never for client UI state. Use `nuqs` (or framework `searchParams`) for URL-synced table filters, pagination, and shareable dashboard views. Never leave an installed query library unused.
- **Vue:** **Pinia** (`^4.1.0`) per-concern stores with `pinia-plugin-persistedstate` mirroring `data-*` attributes onto `<html>` and supporting `updatePageSettings`.
- **Angular:** Native **Signals** (`signal`, `computed`, `effect`, `toSignal` for RxJS interop) in services—avoid `BehaviorSubject` services and NgRx boilerplate.

## 2. Production-Shaped Data Layer & File Architecture

Never hardcode mock arrays inside UI components or chart configs. Structure data identically to a real API so swapping backends is a single-file change:

- **Import-Aliased Layering:** Separate `@core` (tokens, theme, auth, i18n, icons), `@layouts`, `@menu`, `configs/`, `constants/`, `@types/`, `fake-db/`, and `apps/<feature>/`.
- **Next.js (Server-First):** `widget = async Server Component + local data accessor` reading typed domain repositories (`src/data/<domain>/{model.ts, repository.ts}`) + `src/fake-db/<domain>.ts` fixtures + companion REST `src/app/api/<domain>/route.ts` handlers and `src/app/server/actions.ts` Server Actions, with `<Suspense>` boundaries around Client Islands. Avoid `'use client'` on `app/**/page.tsx` wrappers.
- **React / Vue SPA Contract:** Shared typed HTTP client (`src/@core/data/httpClient.ts` over `fetch` or `axios` with base URL, auth token injection, 401 session-reset hook, and error normalization) + typed CRUD repository (`list`, `get`, `create`, `update`, `remove`) + **TanStack Query** (`useDataGridQuery`) / **SWR** + opt-in mock adapter (`msw` or `axios-mock-adapter`) controlled by `DATA_MODE=mock|live` (`NEXT_PUBLIC_DATA_MODE` / `VITE_DATA_MODE`).
- **Per-App Isolation (`generate.mjs data-layer <name>`):** Group each feature module cleanly:
  ```text
  src/apps/<feature>/
  ├── routes.ts
  ├── store/
  │   └── <feature>Store.ts
  ├── data/
  │   ├── model.ts
  │   ├── mock.ts
  │   └── service.ts
  └── features/
  ```
  Generate this scaffold on demand with `node scripts/generate.mjs data-layer <name> --framework <react|vue|angular> --out <project-dir>`.

## 3. AI Surfaces (Current Standard)

Across the 17-template audit, **8–9/17** templates ship AI surfaces in current-era releases.

### Five Tiered AI Integration Patterns

1. **AI Chat App (`/apps/ai-chat` + `/ai-chat/:id`):**
   - **Threaded-stream shell:** Date-grouped conversation sidebar (`Today` / `Yesterday` / `Previous 7 days`) with search, rename/archive/delete, and `New Chat`; empty-state persona/prompt starter cards; model selector; autosizing `Enter`/`Shift+Enter` composer with attachment/dictation triggers; `AbortController` **Stop** button; streaming markdown bubbles with syntax-highlighted code blocks + copy button; per-message feedback (`Copy`, `Good`/`Bad`, `Regenerate`—never a single global vote state); and `localStorage`/DB thread persistence.
2. **Always-On Assistant Chrome (Side Panel or Floating FAB):**
   - One root `aiStore` / `AiAssistantService` (Zustand in React, Pinia in Vue, `signal()` service in Angular) powering **both** `/apps/ai-chat` and an always-available overlay (connected overlay, aside drawer, or floating FAB) with `"Open in full chat"` handoff and page-aware quick prompts. Never ship a decorative-only promo card with an unwired `"Try Now"` button.
3. **AI Copywriter & Multi-Modal Generator Suites:**
   - **AI Copywriter:** Quota KPI bar (`Words Available`), filterable AI Template Library, split-pane prompt form (Template, Keywords, Language, Tone, Variant count) + rich-text editor (`Tiptap`) with one-click insert-to-editor, plus generation history timeline.
   - **Multi-Modal Generators:** Text, Code, Image (parameter selectors: Aspect Ratio, Style, Tone, Lighting, Camera + reference image upload wired to the API + selectable multi-image grid + Upscale/Zoom chips + Masonry gallery), Voice, and Video.
4. **Embedded Dashboard AI Cards:**
   - Contextual AI cards inside vertical dashboards (`AI Summary` with refresh & action chips, `Ask AI` inline prompt + pill questions, `AI Insights` anomaly callouts).
5. **Embedded DataGrid NLQ AI:**
   - Natural-language query bar above `<DataGrid>` translating user prompts into structured `DataGridFetchParams` (`sorting`, `filters`, `searchQuery`) via server-side structured output (`generateObject` / Zod schema), paired with suggested query chips.

### Recommended AI Libraries & Stack

| Layer | React / Next.js | Vue | Angular |
|---|---|---|---|
| **Streaming Client & Transport** | `ai` + `@ai-sdk/react` (`useChat` + `DefaultChatTransport`) | `@ai-sdk/vue` (`useChat`) or `fetch` `ReadableStream` | `fetch` `ReadableStream` SSE in root `AiAssistantService` (`signal()`) |
| **Server Provider SDKs** | `@ai-sdk/google` / `@ai-sdk/openai` / `@google/genai` (Route Handler) | Server proxy (`/api/ai/chat`) | Server proxy (`/api/ai/chat`) |
| **Streaming Markdown** | `streamdown` (`@streamdown/code`, `@streamdown/math`, `@streamdown/mermaid`) | `marked` + `DOMPurify` + `shiki` | `marked` + `DOMPurify` |
| **Agentic UI (Optional)** | `@assistant-ui/react` (`@assistant-ui/ai-sdk`) or `shadcn/ui` AI Elements | Custom Pinia + drawer primitives | Custom CDK overlay + signals |

- **Why `streamdown` over `marked`/`react-markdown` for streaming:** `streamdown` gracefully auto-completes unterminated code fences, links, and bold tags mid-stream without layout flicker or XSS, and memoizes completed blocks. Use `DOMPurify` whenever rendering static HTML from `marked`.

### `AIProvider` Contract & Security Guardrails
- **Server-Only API Keys (Strict):** Read `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY` strictly in server Route Handlers (`/api/ai/chat` `ReadableStream`/SSE or `toUIMessageStreamResponse()`, `/api/ai/image`) or Server Actions. **Never** use `NEXT_PUBLIC_*` or `VITE_*` for AI keys.
- **Unified `AIProvider` + Deterministic Mock Streamer:** Wrap calls behind `streamChat(messages, signal) -> AsyncIterable<string>` (plus optional `generateImage` / `translateGridQuery`). When `AI_MODE=mock` or no server key is set, stream deterministic token chunks over `ReadableStream` with `AbortSignal` support so UI streaming, Stop, and error states work identically in demos.
- **Accessibility:** Render streaming output inside `aria-live="polite"`, provide `aria-label` on every icon-only action button (copy, thumbs up/down, regenerate, attach, mic, stop), and support `Enter` to send / `Shift+Enter` for newline.
