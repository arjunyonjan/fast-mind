---
name: appsidebar-encoding-fix
description: AppSidebar.tsx has corrupted UTF-8 characters (→ stored as garbled bytes) — edit tool will fail to match strings containing these characters
source: auto-skill
extracted_at: '2026-05-28T00:00:00.000Z'
---

## Problem

`components/AppSidebar.tsx` contains garbled UTF-8 sequences where arrow characters (→) should be. The raw file shows sequences like `Ã¢â€ Ã¢â€` or similar mojibake instead of proper `→` characters. This affects the Diagrams link and DeepSeek Usage link.

**Why:** The file was likely saved with incorrect encoding at some point, corrupting non-ASCII characters. The edit tool fails with "0 occurrences found" because the garbled bytes don't match visually similar text.

**How to apply:**
1. If editing AppSidebar.tsx and the edit fails due to non-matching strings, **do not keep retrying** — the file has encoding corruption.
2. Use `read_file` to confirm — if you see garbled characters where arrows/special chars should be, the file is corrupted.
3. **Fix:** Rewrite the entire file using `write_file` with clean UTF-8 characters instead of trying to patch individual lines.
4. Alternatively, restore from git (`git checkout components/AppSidebar.tsx`) first, then make clean edits — but note even the git version may have the corruption.

## Token monitoring setup

For tracking DashScope/Qwen API token usage in this project:
- `lib/token-monitor.ts` — in-memory tracking with `recordUsage()`, `getUsageSummary()`, `extractUsageFromResponse()`
- `lib/dashscope.ts` — wrapper `chatCompletion()` that auto-tracks tokens on every call
- `app/api/token-usage/route.ts` — API endpoint for stats (GET) and clearing (POST)
- `app/token-usage/page.tsx` — dashboard at `/token-usage`
- Sidebar link added in `AppSidebar.tsx` with `BarChart3` icon

**Note:** Uses in-memory storage — resets on server restart. If persistence is needed later, wire up to MongoDB (already available in `lib/mongodb.ts`).
