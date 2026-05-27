---
name: chat-confirmation-flow
description: AI assistant confirms task/document details before creating, using conversation history to resolve pending confirmations
source: auto-skill
extracted_at: '2026-05-28T10:00:00.000Z'
---

## Problem
When user asks the AI to create a task or document, the action executes immediately without showing what will be created. This leads to wrong titles, priorities, or content being saved.

## Solution: Two-Step Confirmation Flow

### Architecture

**Step 1 — Preview (always shown first)**
- User says "create a task to learn React"
- Backend extracts JSON via DeepSeek, but does NOT write to DB
- Instead returns: "📝 **Ready to create?**\n\n**Title:** Learn React\n**Priority:** medium\n\nReply **yes** to confirm, or describe changes."

**Step 2 — Commit (on user confirmation)**
- User says "yes" → classifier detects `confirm_task` or `confirm_document` intent
- Backend scans `recentHistory` for the last message containing "Reply **yes** to confirm"
- Extracts the JSON from that confirmation message and performs the DB insert
- Returns "✅ Created: **Learn React**"

### Implementation Pattern

```typescript
// 1. Classifier system prompt includes confirm intents
'Actions: create_task, confirm_task, confirm_document, list_tasks, ...'
'Classify into: "create_task", "confirm_task", "confirm_document", ...'

// 2. Helper to find pending confirmation in history
function findConfirmation(type: "task" | "document") {
  for (let i = recentHistory.length - 1; i >= 0; i--) {
    const m = recentHistory[i];
    if (m.role === "assistant" && m.content.includes("Reply **yes** to confirm")) {
      const jsonMatch = m.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      // Fallback: use the user message before the confirmation
      if (i > 0 && recentHistory[i - 1].role === "user")
        return { source: recentHistory[i - 1].content };
    }
  }
  return null;
}

// 3. Confirm handler
if (intent === "confirm_task") {
  const pending = findConfirmation("task");
  if (!pending) return NextResponse.json({ reply: "No pending task to confirm." });
  // Extract from cached JSON or re-extract from source message
  return createTaskFromData(pending);
}

// 4. Create handler (default) — preview only, no DB write
const reply = `📝 **Ready to create?**\n\n**Title:** ${p.title}\n**Priority:** ${p.priority}\n\nReply **yes** to confirm.`;
return NextResponse.json({ reply });
```

### Key Design Decisions

1. **JSON embedded in confirmation message** — the assistant's preview response contains the full JSON object, so on "yes" we can extract it directly from conversation history without re-parsing
2. **Fallback to source message** — if JSON extraction fails, re-extract from the original user message that preceded the confirmation
3. **No server-side state** — everything lives in the conversation `history` array. No session, no cache. Works across tab refreshes because localStorage stores messages
4. **User can modify before confirming** — if user says "change priority to high" instead of "yes", the classifier routes to `chat`, and the chat model updates the preview naturally
