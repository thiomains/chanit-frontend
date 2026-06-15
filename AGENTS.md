# AGENTS.md — Chanit Frontend

## Tech Stack

- **Nuxt 4** (SSR-capable, but runs as SPA in practice)
- **Vue 3** with `<script setup>` (Composition API) and TypeScript
- **Tailwind CSS v4** — configured via `@import "tailwindcss"` in `app/assets/css/main.css` (no `tailwind.config.js`)
- **@nuxt/ui v4** — component library (UButton, UCard, UTable, UModal, UInput, etc.)
- **Valibot** for form validation (not Zod)
- **Axios** (plugin-provided as `$axios`) + `$fetch` (nuxt built-in) for HTTP
- **Luxon** for date/time formatting
- **markdown-it** for rendering message bodies, bios, etc.
- **@nuxt/image** for image optimization

## Project Structure

```
app/
├── app.vue                  # Root: auth guard, loading screen, NuxtLayout + NuxtPage
├── assets/css/
│   ├── main.css             # Tailwind imports, @nuxt/ui import, custom theme (dark only)
│   └── markdown.css         # GitHub-style markdown rendering (rendered via v-html)
├── components/              # Auto-imported Vue components
│   ├── settings/            # Settings-specific components
│   └── friendList/          # Friend list sub-components
├── layouts/
│   ├── default.vue          # Public pages (landing, legal): UHeader + slot + UFooter
│   ├── sidebar.vue          # Main app shell: SidebarChannelSelect + slot for content
│   ├── settings.vue         # Settings: left nav (UNavigationMenu) + slot + back link
│   └── admin.vue            # Admin: UDashboardGroup + UDashboardSidebar + slot
├── pages/
│   ├── index.vue            # Landing page (public)
│   ├── app.vue              # /app → redirects to /channels/me
│   ├── login.vue            # Login/Register toggle
│   ├── auth.vue             # OAuth callback (faser)
│   ├── register.vue         # Standalone register (redirects to /login?register=1)
│   ├── verify-email.vue     # Email verification page
│   ├── logout.vue           # Logout page
│   ├── channels/me/
│   │   ├── index.vue        # Friend list (sidebar layout)
│   │   └── [id].vue         # Channel/DM view with messages
│   ├── settings/
│   │   ├── account.vue      # Account settings (data request, password change)
│   │   └── profile.vue      # Profile editor
│   └── admin/
│       ├── index.vue         # Admin dashboard (empty shell)
│       └── users/
│           ├── index.vue    # User table with search/filter
│           └── [id].vue     # Single user detail view
└── plugins/
    ├── 01.session.client.js  # Session state + refresh timer + connect/refreshUser
    ├── 02.ws.client.js       # WebSocket connection + auth handshake
    ├── 03.onlineStatus.client.js  # Online status tracking via WS events
    └── axios.client.js       # Axios instance (baseURL from runtime config)

server/                        # Effectively empty (only tsconfig placeholder)
```

## Commands

```bash
npm install          # also runs `nuxt prepare` via postinstall
npm run dev          # dev server on http://localhost:3000
npm run build        # production build → .output/
npm run preview      # preview production build locally
npm run generate     # static generation

# No test runner configured. No linting configured.
```

## Architecture & Conventions

### State Management
- **Global session state**: `useState("session")` returns `{ session, user }`. Set by `01.session.client.js` plugin. This is the single source of truth for auth/identity across the app.
- All plugins use `useState("session")` to read session data — never pass tokens as props.

### Plugin Ordering Matters
Plugins load in filename order. `01.session.client.js` MUST run before `02.ws.client.js` (WS needs the session tokens). `03.onlineStatus.client.js` depends on the WS connection.

### Accessing Plugin-Provided Utilities
```ts
const { $connect, $startRefreshTimer, $connectWebsocket, $refreshSession, $refreshUser, $setOnlineStatus, $getOnlineStatus } = useNuxtApp()
const { $axios } = useNuxtApp()  // Axios instance
```

### Navigation + Auth Guard
- `app.vue` `onMounted` is the central auth guard. Skips auth for public paths (`/login`, `/`, `/verify-email`, `/auth`, `/logout`, `/register`). For all others: calls `$connect()` (session refresh), `$connectWebsocket()`, and navigates to the actual route.
- **Anti-pattern note**: The codebase uses `window.location.reload()` after many `navigateTo()` calls. This forces a full page reload. When adding new navigation, prefer NOT to add more `window.location.reload()` calls — it may indicate a need to properly handle reactive state updates instead.

### Layout Assignment
Pages declare their layout via `definePageMeta({ layout: 'sidebar' })`. Available layouts: `default`, `sidebar`, `settings`, `admin`. This is Nuxt's standard mechanism — do not use manual layout wrapper components.

### API Calls
- **Pattern**: `$fetch(config.public.apiBaseUrl + "/endpoint", { method, headers: { Authorization, Session }, body, credentials: "include" })`
- Access tokens and session IDs are passed as custom headers: `Authorization: Bearer <token>`, `Session: <sessionId>`
- `$axios` (plugin-provided) is configured with `baseURL` and `withCredentials: true` but is less commonly used.

### Environment Variables (Runtime Config)
```
API_BASE_URL       → config.public.apiBaseUrl
WEBSOCKET_URL      → config.public.webSocketUrl
```
Set via environment variables, NOT in `.env` files (`.env` is gitignored). Nuxt `runtimeConfig.public` makes them available client-side.

### WebSocket Protocol
- Connection: `new WebSocket(config.public.webSocketUrl + "?session=<id>&token=<token>")`
- Auth flow: server sends `authentication-failure` or `authentication-success` → client sends `client-connection`
- Heartbeat: server sends `ping` → client responds `pong`
- Disconnect: `window.location.reload()` on close
- Channel join: `ws.send({ type: "view-channel", channelId })`
- Message events: `message`, `message-delete`, `message-edit`, `typing`, `online-status`

### Icons
Uses **Material Symbols** (`material-symbols:icon-name`). Always prefer these for consistency.

### Form Validation
Use **Valibot** (not Zod):
```ts
import * as v from 'valibot'
const schema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email')),
  password: v.pipe(v.string(), v.minLength(8, 'Must be at least 8 characters'))
})
```

### Styling
- Tailwind utility classes are the primary styling method.
- Custom theme variables are in `main.css` using OKLCH colors. The app is dark-mode only (`colorMode: false` in nuxt.config).
- Markdown content rendered via `v-html` must use the `markdown-body` class on its container.
- Custom scrollbar styling is applied globally in `main.css`.

### Nuxt UI v4 Patterns
- `useToast()` for notifications: `toast.add({ title, description, color })`
- `UForm` + `valibot` schema for validated forms
- `UTable` with `columns` array using `accessorKey`, `header`, and `cell` render functions
- `UNavigationMenu` with `items` array for nav — used in `settings` and `admin` layouts

## Gotchas

- **No test infrastructure exists.** If adding tests, you'll need to set up vitest or similar from scratch.
- **No linting/formatter config exists.** The `tsconfig.json` extends `.nuxt/tsconfig.json` (auto-generated). No ESLint, Prettier, or similar.
- **Mixed `$fetch` / `$axios`**: Two HTTP clients coexist. `$fetch` is the de facto standard for new code. `$axios` exists but sees less use.
- **`event.data` vs `event` in WS handlers**: The `03.onlineStatus.client.js` plugin has a bug — `addEventListener("message")` callback accesses `event.data` but the parameter is unnamed, so it relies on the global `event` object. New WS message handlers should use `(event) => { const msg = JSON.parse(event.data) }`.
- **No explicit TypeScript compilation step.** TypeScript is handled by Nuxt's built-in transform. The `tsconfig.json` extends the auto-generated `.nuxt/tsconfig.json`.
- **Components auto-import:** Vue components in `app/components/` are globally available without import. However, some files still have explicit `import` statements — both patterns coexist.
- **Heavy `window.location.reload()` usage**: Many navigation flows end with `window.location.reload()`. This is a known pattern — investigate whether state reactivity can replace it before adding new reloads.
- **Kein Build zum Testen**: Führe keine Builds (`npm run build`, `npx nuxi typecheck`, etc.) zum Testen aus, es sei denn, es ist ausdrücklich erwünscht. Type-Checks sind ohne laufendes Backend + `.env` nicht aussagekräftig und verursachen nur unnötige Wartezeit.
