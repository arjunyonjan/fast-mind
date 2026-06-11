<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# FastMind — repo-specific facts

## Tech stack
- **Next.js 16** (Turbopack default, `swcMinify` removed)
- **Tailwind CSS v4** — uses `@tailwindcss/postcss` plugin, dark mode via `.dark` class, custom CSS animations in `app/globals.css`
- **MongoDB Atlas** — cached connection via `@/lib/mongodb`, requires `MONGODB_URI` + `DB_NAME`
- **AI backend**: DeepSeek API (`api.deepseek.com`), not DashScope (lib exists but unused by routes)
- **Editor**: Tiptap v3 with StarterKit, Link, Underline, Placeholder, CodeBlock, Highlight, Image, Table, Typography extensions
- **WebSocket terminal**: separate process on port 3001 (`npm run terminal`), spawned by `terminal-server.js`

## Commands
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Build + typecheck |
| `npm run lint` | ESLint (Flat config via `eslint.config.mjs`) |
| `npm run terminal` | Start WebSocket terminal server on :3001 |

## Build & typecheck
- Build runs TypeScript check automatically — fix type errors before committing
- `npm run build` is the single verification command for both TS + compilation

## Project structure
```
app/          — Next.js App Router pages + API routes
  api/        — All backend endpoints (chat, documents, tasks, graph, spaces, launchers, etc.)
  documents/  — Document list + CRUD
  tasks/      — Task list + CRUD
  graph/      — Force-directed knowledge graph (new)
  diagrams/   — SVG gallery viewer
  pending/    — Pending task confirmations
  launchers/  — Saved command launchers
  energy/     — "Energy Doom" philosophy page
components/   — React components (AppSidebar, editors, BrainPanel, terminal, task widgets)
lib/          — Shared libs (mongodb, intent-classifier, dashscope, token-monitor)
features/     — Feature modules (brain/)
hooks/        — Shared React hooks
```

## Architecture notes
- **Intent classifier** (`@/lib/intent-classifier.ts`): rule-based regex patterns, NOT AI — high-confidence actions (≥0.8) auto-execute, low-confidence creates pending items
- **Chat flow**: message → intent classifier → handler or DeepSeek fallback → pending store → confirmation
- **Chat session**: hybrid persistence — localStorage + POST to `/api/chat-session` via `sendBeacon` on page unload
- **Path alias**: `@/*` maps to project root
- **`app/layout.tsx`**: wraps all pages with `AppSidebar`, `BrainPanel`, `CommandLauncher`, `ThemeProvider`
- **Three Tiptap editors** exist: `TipTapEditor.tsx`, `RichTextEditor.tsx`, and `editor/AdvancedEditor.tsx` — understand which is used where before editing

## AI API details
- Uses `DEEPSEEK_API_KEY` env var (not `DASHSCOPE_API_KEY`)
- Token usage tracked in-memory via `@/lib/token-monitor.ts`

## DB collections
- `documents`, `tasks`, `spaces`, `pendingTasks`, `chatSessions`
- `pendingTasks` has TTL index (auto-delete after 1h)

## Themes
- Three modes: `light`, `dark` (default), `tron` — toggled via CSS class on `<html>`
- Tron mode overrides in `globals.css` — cyan neon aesthetic
