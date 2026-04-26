# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port **3000**, auto-opens browser. Proxies `/api` → `http://localhost:3001` (backend). |
| `npm run build` | `tsc && vite build` — type errors fail the build. Output to `dist/`. |
| `npm run preview` | Serve the production build. |
| `npm run lint` | `tsc --noEmit` only. There is **no ESLint config**. |
| `node verify-setup.js` | Sanity-checks `.env`, required files, and dependencies for backend integration. |

**Tests:** Test files exist (`src/**/__tests__/*.test.{ts,tsx}`, written with Jest + RTL syntax) but **no test runner is configured** — there is no `test` npm script and no `jest`/`vitest` in dependencies. `tsconfig.json` explicitly excludes `**/__tests__/**` from type checking, so `npm run lint` will not surface errors in test files. If you need to run tests, you must add a runner first; do not assume `npm test` works.

## Environment

`.env` (gitignored) drives runtime config — see `.env.example`:

- `VITE_API_URL` — backend base URL (default `http://localhost:3001`, used by `src/config/api.config.ts` and `src/utils/axios.ts`).
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — Supabase client (`src/lib/supabase.ts`) used alongside the custom backend for auth.

Path alias: `@/*` → `src/*` (declared in `tsconfig.json`; not currently re-declared in `vite.config.ts`, so Vite resolves it via the bundler `moduleResolution`).

## Architecture

### Two-layer state: local editor state vs. backend-synced state

This is the single most important thing to understand before editing state code. There are **two parallel resume contexts**, and they serve different purposes:

- **`ResumeContext`** (`src/contexts/ResumeContext.tsx`) — `useReducer`-driven, holds the *editable* `Resume` object (sectioned format with `sections: ResumeSection[]`). Wraps every action in undo/redo (`useUndoRedo`) and writes to localStorage via `useAutoSave` (30 s interval, 1 s debounce, also flushes on `beforeunload`). Mounted **per route** at `/editor/:id` (see `src/router/index.tsx`).
- **`ResumeBackendContext`** (`src/contexts/ResumeBackendContext.tsx`) — wraps `resumeService` API calls, holds `currentResume: ResumeResponse` in the *backend* shape (flat `content` with `experience`, `education`, etc.). Mounted **app-wide** in `src/main.tsx`.

The two shapes are bridged by `src/utils/resumeConverter.ts` (`backendToFrontendResume` / `frontendToBackendResume`). When loading a resume from the API, convert before dispatching into `ResumeContext`; when persisting to the backend, convert in the other direction. **Editing the section list directly on the backend shape (or vice versa) will break things.**

`@tanstack/react-query` (`src/lib/queryClient.ts`, hooks like `useResumes`, `useVersions`, `useSharing`) is the preferred fetch path for list/detail/version data — it caches under the keys in `QUERY_KEYS`. `ResumeBackendContext` predates some of those hooks; prefer the React Query hooks for new work and keep cache keys in sync.

### Provider order (`src/main.tsx`)

```
HelmetProvider → QueryProvider → AuthProvider → ResumeBackendProvider → RouterProvider
```

`ResumeProvider` and `PDFExportProvider` are mounted **inside** the `/editor/:id` route only. Anything above that route in the tree cannot read editor state.

### Auth flow

- `AuthContext` + `auth.service` use the custom backend for primary auth and **Supabase** for OAuth/session helpers.
- Tokens live in `localStorage` under keys from `STORAGE_KEYS` (`access_token`, `refresh_token`, `user`).
- `apiClient` (`src/utils/axios.ts`) attaches `Authorization: Bearer <token>` automatically. On any **401**, it clears the tokens, calls `supabase.auth.signOut()` (critical — without this Supabase silently re-logs the user in), and hard-redirects to `/login`. Don't add a competing 401 handler.
- Routing distinguishes `ProtectedRoute` (requires auth) from `PublicRoute` (redirects to `/dashboard` when authed, with a special carve-out for `/signup` while `pendingVerificationEmail` is set).

### Templates and PDF export

All resume templates live in `src/components/Templates/` and extend the shared `TemplateBase` (`forwardRef<HTMLDivElement>`). The `forwardRef` is **load-bearing**: PDF export uses `react-to-print`, which needs a ref to the DOM node. New templates must:

1. Use `forwardRef` and forward to the root element.
2. Accept `{ resume, layout, className, printMode }`.
3. Stay within ATS constraints (single column, no `<table>` for layout, ATS-safe fonts only — see `src/utils/atsValidator.ts` for the exact rules).

PDF rendering relies entirely on `@media print` CSS plus `printMode` branching, not on a separate render path.

### Sections, ordering, drag-and-drop

`Resume.sections: ResumeSection[]` is the source of truth for section order and enabled/disabled state. Reordering uses `@dnd-kit` (`SortableSectionList`, `DraggableSection`). The reducer's `REORDER_SECTIONS` action expects a fully reordered array, not a swap pair.

### Backend conversion gotcha

`resumeConverter` reconstructs sections in a **fixed order** (`summary → experience → education → projects → skills → certifications → custom`). If a resume needs a non-default order, the order must round-trip through the section array — don't expect the converter to preserve a custom ordering implicit in the backend's flat `content`.

## Conventions

These come from `.cursor/rules/resumebuilderrules.mdc` and `.kiro/steering/` and are enforced informally:

- **TypeScript strict** with `noUnusedLocals` + `noUnusedParameters` + `noFallthroughCasesInSwitch`. Any `// @ts-ignore` or `any` is suspect.
- **Functional components only**; custom hooks in `src/hooks/`, prefixed `use`.
- **ATS compliance is non-negotiable** for anything that ends up in the printed/PDF output: ATS-safe fonts only (Arial, Helvetica, Times New Roman, Georgia, Calibri), standard section headers, no tables-for-layout, no icons inside resume content (icons are fine in editor chrome). `useATSValidation` runs live as the user edits.
- **Reducer dispatch shape:** `{ type, payload }` — see `src/types/actions.types.ts` for the exhaustive union. Add new action types there before using them in the reducer.
- **Storage keys** are centralized in `src/utils/storageManager.ts` (`STORAGE_KEYS`) and `src/config/api.config.ts` — don't inline string keys.
- **API endpoints** are centralized in `API_CONFIG.ENDPOINTS` (`src/config/api.config.ts`). New endpoints go there, not as inline strings in services.
