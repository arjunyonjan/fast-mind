import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const hfToken = process.env.HF_TOKEN;
    
    if (!hfToken) {
      return NextResponse.json({ reply: "⚠️ HF_TOKEN not configured", steps: ["❌ No API key"] }, { status: 500 });
    }

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    
    const r = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
      method: "POST",
      headers: { Authorization: "Bearer " + hfToken, "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: 'Extract task: "' + message + '". Return ONLY JSON: {"title":"clean title","description":"details","priority":"high|medium|low"}'
      }),
      signal: ctrl.signal,
    });
    clearTimeout(t);

    if (!r.ok) {
      return NextResponse.json({ reply: "⚠️ HF API returned " + r.status, steps: ["❌ HF status " + r.status] }, { status: 502 });
    }

    const j = await r.json();
    const txt = j[0]?.generated_text || "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) {
      return NextResponse.json({ reply: "⚠️ HF response not valid JSON", steps: ["❌ Parse failed"] }, { status: 502 });
    }

    const p = JSON.parse(m[0]);
    const task = {
      title: p.title || "Untitled",
      description: p.description || "",
      priority: p.priority || "medium",
      status: "pending",
      steps: ["🤖 HF parsed successfully"]
    };

    const db = await connectToDatabase();
    await db.collection("tasks").insertOne({ ...task, createdAt: new Date(), source: "huggingface" });

    return NextResponse.json({
      reply: "📝 **" + task.title + "**\n📋 " + (task.description || "No description") + "\n🔴 Priority: " + task.priority,
      steps: task.steps
    });
  } catch (err: any) {
    return NextResponse.json({ reply: "⚠️ HF unreachable: " + err.message, steps: ["❌ " + err.message] }, { status: 502 });
  }
}