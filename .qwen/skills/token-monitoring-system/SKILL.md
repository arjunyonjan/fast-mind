---
name: token-monitoring-system
description: DashScope/Qwen API token usage tracking and dashboard
source: auto-skill
extracted_at: '2026-05-28T00:00:00.000Z'
---

## Architecture

| File | Purpose |
|------|---------|
| `lib/token-monitor.ts` | Core tracking logic — `recordUsage()`, `getUsageSummary()`, `extractUsageFromResponse()` |
| `lib/dashscope.ts` | Wrapper `chatCompletion()` that auto-tracks tokens on every API call |
| `app/api/token-usage/route.ts` | API endpoint — GET for stats, POST?action=clear to reset |
| `app/token-usage/page.tsx` | Dashboard at `/token-usage` |
| `components/AppSidebar.tsx` | Sidebar link with `BarChart3` icon |

## Usage

```ts
import { chatCompletion } from '@/lib/dashscope';

const res = await chatCompletion([
  { role: 'user', content: 'Hello' }
], { model: 'qwen-turbo' });
```

Or track manually:
```ts
import { extractUsageFromResponse, recordUsage } from '@/lib/token-monitor';

const usage = extractUsageFromResponse(apiResponse, 'qwen-turbo');
if (usage) recordUsage(usage);
```

## Dashboard Features
- Time range presets: Today / 7d / 30d / All time
- Stat cards: API calls, input tokens, output tokens, total tokens
- Daily bar chart (CSS-only, no library)
- Model breakdown with progress bars and share percentage
- Input vs Output ratio bars
- Averages: tokens/call, input/call, output/call, active days

## Storage
Currently uses in-memory storage — data resets on server restart.
For persistence, wire up to MongoDB (already available in `lib/mongodb.ts`).
The `token-monitor.ts` module exports `getUsageLog()`, `clearUsageLog()` for easy integration.
