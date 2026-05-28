---
name: token-monitoring-system
description: DashScope/DeepSeek API token usage tracking and dashboard
source: auto-skill
extracted_at: '2026-05-28T00:00:00.000Z'
---

## Architecture

| File | Purpose |
|------|---------|
| `lib/token-monitor.ts` | Core tracking — `recordUsage()`, `getUsageSummary()`, in-memory store |
| `lib/dashscope.ts` | Wrapper `chatCompletion()` that auto-tracks tokens |
| `app/api/token-usage/route.ts` | API endpoint — GET for stats, POST?action=clear to reset |
| `app/token-usage/page.tsx` | Dashboard at `/token-usage` with charts, model breakdown, averages |
| `components/AppSidebar.tsx` | Sidebar link with `BarChart3` icon |

## Integration: Add token tracking to any API route

When an API route makes direct `fetch()` calls to DeepSeek/DashScope (not using the wrapper), add a `trackTokens` helper:

```ts
import { recordUsage } from "@/lib/token-monitor";

function trackTokens(responseJson: any, model: string = "deepseek-chat") {
  const u = responseJson?.usage;
  if (!u) return;
  recordUsage({
    inputTokens: u.prompt_tokens || 0,
    outputTokens: u.completion_tokens || 0,
    totalTokens: u.total_tokens || 0,
    timestamp: new Date().toISOString(),
    model,
    requestId: responseJson.id || undefined,
  });
}
```

Then after **every** DeepSeek API response, parse JSON once and call `trackTokens`:

```ts
// Before:
const classifyRes = await fetch(DEEPSEEK_URL, { ... });
const intent = classifyRes.ok
  ? ((await classifyRes.json()).choices?.[0]?.message?.content || "chat")
  : "chat";

// After (parse once, track, then use):
const classifyRes = await fetch(DEEPSEEK_URL, { ... });
const classifyJson = classifyRes.ok ? await classifyRes.json() : null;
const intent = classifyJson?.choices?.[0]?.message?.content || "chat";
trackTokens(classifyJson, "deepseek-chat");
```

Apply this to every DeepSeek call in the route — intent classification, chat responses, task extraction, document creation, space matching, etc.

## Dashboard

Visit `/token-usage` to see:
- Time range presets: Today / 7d / 30d / All time
- Stat cards: API calls, input/output/total tokens
- Daily bar chart (CSS-only, hover tooltips)
- Model breakdown with progress bars
- Input vs Output ratio
- Averages: tokens/call, input/call, output/call, active days

## Storage

Currently in-memory — resets on server restart.
