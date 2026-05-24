import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

function parseTask(message: string) {
  const msg = message.trim();
  
  // Detect priority from keywords
  let priority = "medium";
  if (/urgent|asap|critical|immediately|now|today/i.test(msg)) priority = "high";
  if (/whenever|later|someday|low prio|optional/i.test(msg)) priority = "low";

  // Split into title + description
  const sentenceBreak = msg.match(/[.!?\n]/);
  let title = msg;
  let description = "";

  if (sentenceBreak && sentenceBreak.index && sentenceBreak.index > 10) {
    title = msg.slice(0, sentenceBreak.index + 1).trim();
    description = msg.slice(sentenceBreak.index + 1).trim();
  }

  // Cap title length
  if (title.length > 80) {
    description = title.slice(80) + " " + description;
    title = title.slice(0, 80);
  }

  return { title: title || "Untitled task", description: description || "", priority, status: "pending" };
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    console.log("📥 Chat request:", message?.slice(0, 50));

    const hfToken = process.env.HF_TOKEN;
    let task = parseTask(message);

    // Try HuggingFace if token exists, with fast timeout
    if (hfToken) {
      try {
        console.log("🤖 Trying HuggingFace...");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
          method: "POST",
          headers: { Authorization: `Bearer ${hfToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            inputs: `Extract a task from this text. Output ONLY valid JSON with keys: title, description, priority (high/medium/low). Text: "${message}"`,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const json = await res.json();
          const text = json[0]?.generated_text || "";
          const match = text.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            task = { title: parsed.title || task.title, description: parsed.description || task.description, priority: parsed.priority || task.priority, status: "pending" };
            console.log("✅ HF parsed:", task.title);
          }
        }
      } catch (e: any) {
        console.warn("⚠️ HF failed, using local parser:", e.message);
      }
    }

    console.log("💾 Saving task:", task.title);
    const db = await connectToDatabase();
    const result = await db.collection("tasks").insertOne({
      ...task,
      createdAt: new Date(),
      source: "chat",
    });
    console.log("✅ Task saved:", result.insertedId);

    return NextResponse.json({ reply: `📝 Task: **${task.title}**\n📋 ${task.description || "No description"}\n🔴 Priority: ${task.priority}` });
  } catch (err: any) {
    console.error("❌ Chat error:", err.message);
    return NextResponse.json({ reply: `⚠️ Error: ${err.message}` }, { status: 500 });
  }
}
