import { NextResponse } from "next/server";

export async function GET() {
  try {
    const key = process.env.DEEPSEEK_API_KEY;
    if (!key) return NextResponse.json({ online: false });
    const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: "ping" }], max_tokens: 1 }),
      signal: AbortSignal.timeout(5000),
    });
    return NextResponse.json({ online: r.ok || r.status === 401 });
  } catch {
    return NextResponse.json({ online: false });
  }
}

