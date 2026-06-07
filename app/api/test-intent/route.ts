import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    const classifyMessages = [
      { role: "system", content: "You are FastMind AI. Actions: create_task, confirm_task, list_tasks, complete_task, delete_task, create_document, chat. Return ONLY the word." },
      { role: "user", content: message }
    ];

    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "deepseek-chat", messages: classifyMessages, temperature: 0, max_tokens: 10 }),
    });
    
    const json = await res.json();
    const intent = json.choices?.[0]?.message?.content?.trim().toLowerCase() || "unknown";
    
    return NextResponse.json({ 
      message, 
      intent,
      raw: json.choices?.[0]?.message?.content,
      full: json 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}