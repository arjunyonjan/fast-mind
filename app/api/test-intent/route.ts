import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are FastMind AI. Analyze user message and return JSON only.

{
  "intent": "create_task|list_tasks|confirm_task|delete_task|complete_task|create_document|list_documents|list_pending|chat",
  "confidence": 0.0-1.0,
  "data": { "title": "...", "description": "...", "priority": "high|medium|low" }
}

Rules:
- confidence >= 0.8 → auto-execute without confirmation
- confidence < 0.8 → ask user to confirm
- "add task: buy milk" → intent=create_task, confidence=0.9
- "create urgent task fix bug" → intent=create_task, confidence=0.85, priority="high"
- "list my tasks" → intent=list_tasks, confidence=1.0
- "yes" → intent=confirm_task, confidence=1.0

Return ONLY valid JSON. No other text.`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: message }],
        temperature: 0,
        max_tokens: 200
      }),
    });
    
    const json = await res.json();
    const content = json.choices?.[0]?.message?.content || "{}";
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { intent: "chat", confidence: 0, error: "Invalid JSON", raw: content };
    }
    
    return NextResponse.json({ message, ...parsed, raw: content });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}