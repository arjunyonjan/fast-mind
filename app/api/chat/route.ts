import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { recordUsage } from "@/lib/token-monitor";
import crypto from "crypto";

function trackTokens(responseJson: any, model: string = "deepseek-chat") {
  const u = responseJson?.usage;
  if (!u) return;
  recordUsage({
    inputTokens: u.prompt_tokens || 0,
    outputTokens: u.completion_tokens || 0,
    totalTokens: u.total_tokens || 0,
    timestamp: new Date().toISOString(),
    model,
    requestId: responseJson.id || undefined,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, messages: history, spaceId } = body;
    const sessionId = body.sessionId || crypto.randomUUID();
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: "⚠️ API key not configured" }, { status: 500 });
    }

    const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
    
    // Hardcoded intent
    let intent = "chat";
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("create task")) intent = "create_task";
    else if (lowerMsg === "yes" || lowerMsg === "confirm") intent = "confirm_task";
    else if (lowerMsg.includes("list tasks")) intent = "list_tasks";

    // AI intent if not hardcoded
    if (intent === "chat") {
      const classifyMessages = [
        { role: "system" as const, content: "You are FastMind AI. Actions: create_task, confirm_task, list_tasks. Return ONLY the word." },
        ...recentHistory.map((m: any) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: message }
      ];
      const classifyRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "deepseek-chat", messages: classifyMessages, temperature: 0, max_tokens: 10 }),
      });
      const classifyJson = classifyRes.ok ? await classifyRes.json() : null;
      intent = classifyJson?.choices?.[0]?.message?.content?.trim().toLowerCase() || "create_task";
      trackTokens(classifyJson, "deepseek-chat");
    }

    const db = await connectToDatabase();

    async function createTaskFromData(p: any) {
      const task = { title: p.title || "Untitled", description: p.description || "", priority: p.priority || "medium", status: "pending" };
      await db.collection("tasks").insertOne({ ...task, spaceId: spaceId || null, createdAt: new Date(), source: "deepseek" });
      return NextResponse.json({ reply: "✅ Created: " + task.title });
    }

    if (intent === "list_tasks") {
      const tasks = await db.collection("tasks").find({}).sort({ createdAt: -1 }).limit(10).toArray();
      if (tasks.length === 0) return NextResponse.json({ reply: "📋 No tasks yet." });
      const list = tasks.map((t, i) => (i+1) + ". " + t.title + " — " + t.priority + " " + t.status).join("\n");
      return NextResponse.json({ reply: "📋 Your tasks:\n\n" + list });
    }

    if (intent === "confirm_task") {
      const pending = await db.collection("pendingTasks").findOne({ sessionId: sessionId, type: "task" });
      if (!pending) return NextResponse.json({ reply: "No pending task found." });
      const result = await createTaskFromData(pending.data);
      await db.collection("pendingTasks").deleteOne({ _id: pending._id });
      return result;
    }

    // Create task
    const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: "Extract task. Return ONLY JSON: {\"title\":\"...\",\"description\":\"...\",\"priority\":\"high|medium|low\"}" }, { role: "user", content: message }],
        temperature: 0, max_tokens: 150
      }),
    });
    if (!r.ok) return NextResponse.json({ reply: "⚠️ DeepSeek error" }, { status: 502 });
    const j = await r.json();
    trackTokens(j, "deepseek-chat");
    const txt = j.choices?.[0]?.message?.content || "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return NextResponse.json({ reply: "⚠️ Invalid response" }, { status: 502 });
    const p = JSON.parse(m[0]);

    await db.collection("pendingTasks").insertOne({
      sessionId: sessionId,
      type: "task",
      data: { title: p.title, description: p.description, priority: p.priority },
      createdAt: new Date()
    });

    const replyMsg = "📝 Ready to create?\n\nTitle: " + p.title + "\nPriority: " + p.priority + "\n\nReply yes to confirm.";
    return NextResponse.json({ reply: replyMsg });
  } catch (err: any) {
    return NextResponse.json({ reply: "⚠️ " + err.message }, { status: 502 });
  }
}