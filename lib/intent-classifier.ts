import { connectToDatabase } from "./mongodb";

export const INTENT_SYSTEM_PROMPT = `You are FastMind AI. Analyze user message and return JSON only.

{
  "intent": "create_task|list_tasks|confirm_task|delete_task|complete_task|create_document|list_documents|list_pending|chat",
  "confidence": 0.0-1.0,
  "data": { "title": "...", "description": "...", "priority": "high|medium|low" }
}

CRITICAL RULES:
- "add task" alone (no title) → confidence 0.4 (ASK for details)
- "add task: X" → confidence 0.9 (AUTO)
- "create task? X" (with question mark) → confidence 0.85 (AUTO if title follows)
- "✅ confirm", "✓ confirm", "yes", "confirm" → intent="confirm_task", confidence=1.0
- "show pending", "what's pending", "pending items" → intent="list_pending", confidence=1.0
- "list pending", "show pending tasks" → intent="list_pending", confidence=1.0

Examples:
- "add task" → {"intent":"create_task","confidence":0.4}
- "add task: buy milk" → {"intent":"create_task","confidence":0.9,"data":{"title":"buy milk"}}
- "create task? write docs" → {"intent":"create_task","confidence":0.85,"data":{"title":"write docs"}}
- "✅ confirm" → {"intent":"confirm_task","confidence":1.0}
- "show pending tasks" → {"intent":"list_pending","confidence":1.0}
- "pending items" → {"intent":"list_pending","confidence":1.0}

Return ONLY valid JSON. No other text.`;

export async function classifyIntent(message: string, apiKey: string, history: any[] = []) {
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: INTENT_SYSTEM_PROMPT },
        ...history.slice(-5),
        { role: "user", content: message }
      ],
      temperature: 0,
      max_tokens: 200
    }),
  });
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content || "{}";
  try {
    return JSON.parse(content);
  } catch {
    return { intent: "chat", confidence: 0, error: "Invalid JSON", raw: content };
  }
}