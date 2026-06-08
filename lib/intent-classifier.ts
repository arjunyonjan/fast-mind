import { connectToDatabase } from "./mongodb";

export const INTENT_SYSTEM_PROMPT = `You are FastMind AI. Analyze user message and return JSON only.

{
  "intent": "create_task|list_tasks|confirm_task|delete_task|complete_task|create_document|list_documents|list_pending|chat",
  "confidence": 0.0-1.0,
  "data": { "title": "...", "description": "...", "priority": "high|medium|low" }
}

CRITICAL RULES:
- If user says "add task" or "create task" → intent MUST be "create_task", confidence 0.9
- "add task: buy milk" → {"intent":"create_task","confidence":0.9,"data":{"title":"buy milk"}}
- "list my tasks" → {"intent":"list_tasks","confidence":1.0}
- "yes" or "confirm" → {"intent":"confirm_task","confidence":1.0}
- Vague messages ("task" alone) → intent="create_task", confidence=0.4, ask for details

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