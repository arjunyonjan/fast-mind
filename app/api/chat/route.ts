import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { classifyIntent } from "@/lib/intent-classifier";
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
    
    // Unified intent classification
    const { intent, confidence, data } = await classifyIntent(message, apiKey, recentHistory);
    console.log("[DEBUG] Intent:", intent, "Confidence:", confidence);

    const db = await connectToDatabase();

    async function createTaskFromData(taskData: any) {
      const task = { 
        title: taskData.title || "Untitled", 
        description: taskData.description || "", 
        priority: taskData.priority || "medium", 
        status: "pending" 
      };
      await db.collection("tasks").insertOne({ ...task, spaceId: spaceId || null, createdAt: new Date(), source: "deepseek" });
      return NextResponse.json({ reply: "✅ Created: " + task.title });
    }

    async function matchPendingTask(userMsg: string, pendingList: any[]) {
      if (pendingList.length === 1) return pendingList[0];
      const taskList = pendingList.map((p, i) => `${i+1}. ${p.data.title} (${p.type})`).join("\n");
      const matchRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "system", content: `Pending items:\n${taskList}\nUser: "${userMsg}". Return ONLY the number (1-${pendingList.length}) of the best match.` }],
          temperature: 0, max_tokens: 10
        }),
      });
      if (!matchRes.ok) return pendingList[0];
      const resData = await matchRes.json();
      const idx = parseInt(resData.choices?.[0]?.message?.content?.trim() || "1") - 1;
      return pendingList[Math.min(Math.max(0, idx), pendingList.length - 1)];
    }

    // AUTO-CONFIRM: High confidence create_task
    if (intent === "create_task" && confidence >= 0.8 && data?.title) {
      await createTaskFromData(data);
      return NextResponse.json({ reply: `✅ Auto-created: ${data.title} (${Math.round(confidence * 100)}% confident)` });
    }

    // LIST PENDING
    if (intent === "list_pending") {
      const pending = await db.collection("pendingTasks").find({ sessionId: sessionId }).toArray();
      if (pending.length === 0) {
        return NextResponse.json({ reply: "📭 No pending tasks or documents." });
      }
      const list = pending.map((p, i) => `${i+1}. ${p.data.title || "Untitled"} (${p.type})`).join("\n");
      return NextResponse.json({ reply: "📋 **Pending items:**\n\n" + list + "\n\nReply with number or description to create." });
    }

    // LIST TASKS
    if (intent === "list_tasks") {
      const tasks = await db.collection("tasks").find({}).sort({ createdAt: -1 }).limit(10).toArray();
      if (tasks.length === 0) return NextResponse.json({ reply: "📋 No tasks yet." });
      const list = tasks.map((t, i) => (i+1) + ". " + t.title + " — " + t.priority + " " + t.status).join("\n");
      return NextResponse.json({ reply: "📋 Your tasks:\n\n" + list });
    }

    // CONFIRM TASK (multi-pending support)
    if (intent === "confirm_task") {
      const allPending = await db.collection("pendingTasks").find({ sessionId: sessionId, type: "task" }).toArray();
      if (allPending.length === 0) {
        return NextResponse.json({ reply: "🤔 No pending tasks found. Create one first!" });
      }
      
      let matched = null;
      const lowerMsgConfirm = message.toLowerCase();
      const numMatch = lowerMsgConfirm.match(/(\d+)/);
      if (numMatch) {
        const idx = parseInt(numMatch[1]) - 1;
        if (idx >= 0 && idx < allPending.length) matched = allPending[idx];
      }
      
      if (!matched && allPending.length > 1) {
        matched = await matchPendingTask(message, allPending);
      }
      if (!matched) matched = allPending[0];
      
      const result = await createTaskFromData(matched.data);
      await db.collection("pendingTasks").deleteOne({ _id: matched._id });
      return result;
    }

    // CREATE TASK (store as pending for confirmation)
    const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: 'Extract task. Return ONLY JSON: {"title":"...","description":"...","priority":"high|medium|low"}' }, { role: "user", content: message }],
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

    return NextResponse.json({ reply: "📝 Ready to create?\n\nTitle: " + p.title + "\nPriority: " + p.priority + "\n\nReply yes to confirm." });
  } catch (err: any) {
    return NextResponse.json({ reply: "⚠️ " + err.message }, { status: 502 });
  }
}