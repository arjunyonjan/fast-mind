import { connectToDatabase } from "./mongodb";

export const INTENT_SYSTEM_PROMPT = `You are FastMind AI. Analyze user message and return JSON only.

{
  "intent": "create_task|list_tasks|confirm_task|list_pending|delete_task|complete_task|create_document|list_documents|list_pending|chat",
  "confidence": 0.0-1.0,
  "data": { "title": "...", "description": "...", "priority": "high|medium|low" }
}

CRITICAL CONFIDENCE RULES:
- "urgent", "ASAP", "by 5pm", "deadline", "critical" → boost confidence by 0.2 (add 0.2)
- "fix bug", "error", "crash" → boost confidence by 0.1 (technical tasks)
- Maximum confidence is 0.95 (never 1.0 for auto-create to allow review)
- "add task: X" or "create task: X" → confidence 0.9 (auto-create)
- "task X" (without "add/create") → confidence 0.6 (ask for confirmation)
- "X" alone (single word, no task indicator) → confidence 0.3 (ask for details)
- "urgent", "ASAP", "by 5pm" → boost confidence by 0.1
- Vague messages without clear title → confidence 0.4 or lower

Examples:
- "list pending" → {"intent":"list_pending","confidence":1.0}
- "show pending" → {"intent":"list_pending","confidence":1.0}
Examples:
- "add task: buy milk" → {"intent":"create_task","confidence":0.9,"data":{"title":"buy milk"}}
- "task buy milk" → {"intent":"create_task","confidence":0.6,"data":{"title":"buy milk"}}
- "buy milk" → {"intent":"create_task","confidence":0.5,"data":{"title":"buy milk"}}
- "list my tasks" → {"intent":"list_tasks","confidence":1.0}
- "yes" → {"intent":"confirm_task","confidence":1.0}

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