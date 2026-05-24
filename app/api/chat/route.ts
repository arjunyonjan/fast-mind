import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { message, spaceId } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return NextResponse.json({ reply: "⚠️ DEEPSEEK_API_KEY not configured", steps: ["❌ No API key"] }, { status: 500 });

    const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: 'Extract a task from the user message. Return ONLY valid JSON: {"title":"clean title","description":"details","priority":"high|medium|low"}' },
          { role: "user", content: message }
        ],
        temperature: 0, max_tokens: 150
      }),
    });

    if (!r.ok) return NextResponse.json({ reply: "⚠️ DeepSeek error " + r.status, steps: ["❌ Status " + r.status] }, { status: 502 });

    const j = await r.json();
    const txt = j.choices?.[0]?.message?.content || "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return NextResponse.json({ reply: "⚠️ Invalid response", steps: ["❌ Parse failed"] }, { status: 502 });

    const p = JSON.parse(m[0]);
    const task = { title: p.title || "Untitled", description: p.description || "", priority: p.priority || "medium", status: "pending", steps: ["🤖 DeepSeek parsed"] };

    const db = await connectToDatabase();
    await db.collection("tasks").insertOne({ ...task, spaceId: spaceId || null, createdAt: new Date(), source: "deepseek" });

    return NextResponse.json({ reply: `📝 **${task.title}**\n📋 ${task.description || "No description"}\n🔴 Priority: ${task.priority}`, steps: task.steps });
  } catch (err: any) {
    return NextResponse.json({ reply: "⚠️ " + err.message, steps: ["❌ " + err.message] }, { status: 502 });
  }
}