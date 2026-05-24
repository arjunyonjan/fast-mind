import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

function parseTask(message: string) {
  const msg = message.trim();
  const steps: string[] = [];
  let priority = "medium";
  if (/urgent|asap|critical|immediately|now|today|pray|bless|important/i.test(msg)) { priority = "high"; steps.push("🔍 Keyword → high"); }
  else if (/whenever|later|someday|optional|maybe/i.test(msg)) { priority = "low"; steps.push("🔍 Keyword → low"); }
  else { steps.push("🔍 Default medium"); }
  let title = msg;
  let description = "";
  const cleaned = msg.replace(/^(please\s+)?(add\s+(a\s+)?task\s+(to\s+)?|create\s+(a\s+)?task\s+(to\s+)?|remind\s+me\s+to\s+|make\s+(a\s+)?(note|task)\s+(to\s+)?)/i, "").trim();
  if (cleaned && cleaned !== msg) { title = cleaned; steps.push("🧹 Stripped command prefix"); }
  else { steps.push("🧹 No prefix"); }
  const breakIdx = title.search(/[.!?\n]/);
  if (breakIdx > 10 && breakIdx < title.length - 5) { description = title.slice(breakIdx + 1).trim(); title = title.slice(0, breakIdx).trim(); steps.push("✂️ Split at punctuation"); }
  title = title.charAt(0).toUpperCase() + title.slice(1);
  if (title.length > 70) { description = title.slice(70) + " " + description; title = title.slice(0, 70); steps.push("📏 Capped at 70"); }
  steps.push("💾 Done");
  return { title: title || "Untitled", description: description.trim(), priority, status: "pending", steps };
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    let task = parseTask(message);
    let source = "local";
    const hfToken = process.env.HF_TOKEN;
    if (hfToken) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const r = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
          method: "POST", headers: { Authorization: "Bearer " + hfToken, "Content-Type": "application/json" },
          body: JSON.stringify({ inputs: 'Extract task from: "' + message + '". Return ONLY JSON: {"title":"short name","description":"details","priority":"high|medium|low"}' }),
          signal: ctrl.signal,
        });
        clearTimeout(t);
        if (r.ok) {
          const j = await r.json();
          const txt = j[0]?.generated_text || "";
          const m = txt.match(/\{[\s\S]*\}/);
          if (m) {
            const p = JSON.parse(m[0]);
            task = { title: p.title || task.title, description: p.description || task.description, priority: p.priority || task.priority, status: "pending", steps: [...task.steps, "🤖 HF merged"] };
            source = "huggingface";
          }
        }
      } catch (e: any) { task.steps.push("⚠️ HF failed: " + e.message); }
    }
    const db = await connectToDatabase();
    await db.collection("tasks").insertOne({ ...task, createdAt: new Date(), source });
    return NextResponse.json({ reply: "📝 **" + task.title + "**\n📋 " + (task.description || "No description") + "\n🔴 Priority: " + task.priority, steps: task.steps });
  } catch (err: any) {
    return NextResponse.json({ reply: "⚠️ " + err.message, steps: ["❌ " + err.message] }, { status: 500 });
  }
}
