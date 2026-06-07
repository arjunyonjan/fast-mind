import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { recordUsage } from "@/lib/token-monitor";

// Helper: extract and record token usage from DeepSeek response
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
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return NextResponse.json({ reply: "⚠️ API key not configured" }, { status: 500 });

    // Build messages array for intent classification (include recent history)
    const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
    const classifyMessages = [
      { role: "system" as const, content: 'You are FastMind AI. Features: Spaces, Tasks (priority/status), Documents, Brain Panel, Debug Panel. Actions: create_task, confirm_task, confirm_document, list_tasks, list_documents, complete_task, delete_task, create_document, chat. Classify the LAST message into: "create_task", "confirm_task", "confirm_document", "list_tasks", "list_documents", "complete_task", "delete_task", "create_document", "chat". Return ONLY the word.' },
      ...recentHistory.map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: message }
    ];

    // Classify intent
    const classifyRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: classifyMessages,
        temperature: 0, max_tokens: 10
      }),
    });
    const classifyJson = classifyRes.ok ? await classifyRes.json() : null;
    const intent = classifyJson?.choices?.[0]?.message?.content?.trim().toLowerCase() || "create_task";
    trackTokens(classifyJson, "deepseek-chat");
    async function matchPendingTask(message: string, tasks: any[]) {
      if (tasks.length === 0) return null;
      if (tasks.length === 1) return tasks[0];
      
      const taskList = tasks.map((t, i) => `${i+1}. ${t.data.title} (${t.type})`).join("\n");
      const matchRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: `You have these pending items:\n${taskList}\nUser says: "${message}". Return ONLY the number (1-${tasks.length}) of the best match.` }
          ],
          temperature: 0, max_tokens: 10
        }),
      });
      if (!matchRes.ok) return tasks[0];
      const data = await matchRes.json();
      const idx = parseInt(data.choices?.[0]?.message?.content?.trim() || "1") - 1;
      return tasks[Math.min(Math.max(0, idx), tasks.length - 1)];
    }

    const db = await connectToDatabase();

    // Helper: find the last confirmation message in history and extract JSON
    function findConfirmation(type: "task" | "document") {
      for (let i = recentHistory.length - 1; i >= 0; i--) {
        const m = recentHistory[i];
        if (m.role === "assistant" && m.content.includes("Reply **yes** to confirm")) {
          // Find the JSON block in this message
          const jsonMatch = m.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              return JSON.parse(jsonMatch[0]);
            } catch {}
          }
          // Fallback: also check user message before this
          if (i > 0 && recentHistory[i - 1].role === "user") {
            return { source: recentHistory[i - 1].content };
          }
        }
      }
      return null;
    }

    // Helper: create task from extracted data
    async function createTaskFromData(p: any) {
      let finalSpaceId = spaceId || null;
      if (!finalSpaceId) {
        try {
          const spaces = await db.collection("spaces").find({}).toArray();
          if (spaces.length > 0) {
            const spaceRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
              method: "POST",
              headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                  { role: "system", content: "Match this task to a space: " + JSON.stringify(spaces.map(s => s.name)) + ". Return ONLY the matching space name or 'none'." },
                  { role: "user", content: p.title }
                ],
                temperature: 0, max_tokens: 20
              }),
            });
            if (spaceRes.ok) {
              const sj = await spaceRes.json();
              trackTokens(sj, "deepseek-chat");
              const name = sj.choices?.[0]?.message?.content?.trim();
              const match = spaces.find(s => s.name.toLowerCase() === name?.toLowerCase());
              if (match) finalSpaceId = match._id.toString();
            }
          }
        } catch {}
      }

      const task = { title: p.title || "Untitled", description: p.description || "", priority: p.priority || "medium", status: "pending" };
      await db.collection("tasks").insertOne({ ...task, spaceId: finalSpaceId, createdAt: new Date(), source: "deepseek" });
      return NextResponse.json({ reply: `✅ Created:\n\n**Title:** ${task.title}\n**Priority:** ${task.priority}\n**Status:** pending${finalSpaceId ? "\n🪐 Assigned to space" : ""}` });
    }

    // LIST TASKS
        if (intent === "list_pending") {
      const pending = await db.collection("pendingTasks").find({ sessionId }).toArray();
      if (pending.length === 0) {
        return NextResponse.json({ reply: "📭 No pending tasks or documents." });
      }
      const list = pending.map((p, i) => `${i+1}. ${p.data.title || p.data.name || "Untitled"} (${p.type})`).join("\n");
      return NextResponse.json({ reply: `📋 **Pending items:**\n\n${list}\n\nReply with a hint or number to create.` });
    }

     {
      const tasks = await db.collection("tasks").find({}).sort({ createdAt: -1 }).limit(10).toArray();
      if (tasks.length === 0) return NextResponse.json({ reply: "📋 No tasks yet." });
      const list = tasks.map((t, i) => {
        if (t.status === "failed") {
          return `${i+1}. ❌ **${t.title}** — [${t.priority}] **FAILED**`;
        }
        const statusEmoji = t.status === "completed" ? "✅" : "⏳";
        return `${i+1}. **${t.title}** — [${t.priority}] ${statusEmoji} ${t.status}`;
      }).join("\n");
      return NextResponse.json({ reply: `📋 **Your tasks** (${tasks.length}):\n\n${list}` });
    }
    if (intent === "list_documents") {
      const docs = await db.collection("documents").find({}).sort({ updatedAt: -1 }).limit(15).toArray();
      if (docs.length === 0) return NextResponse.json({ reply: "📄 No documents yet." });
      const list = docs.map((d, i) => `${i + 1}. **${d.title}** — ${new Date(d.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`).join("\n");
      return NextResponse.json({ reply: `📄 **Your documents** (${docs.length}):\n\n${list}` });
    }

    // COMPLETE / DELETE TASK
    if (intent === "complete_task" || intent === "delete_task") {
      const extractRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: 'Extract the task number or title keywords from: "' + message + '". Return ONLY the identifier.' },
            { role: "user", content: message }
          ],
          temperature: 0, max_tokens: 20
        }),
      });
      const identifier = extractRes.ok ? ((await extractRes.json()).choices?.[0]?.message?.content?.trim() || "") : "";
      const extractJson2 = extractRes.ok ? await extractRes.json() : null;
      trackTokens(extractJson2, "deepseek-chat");
      const tasks = await db.collection("tasks").find({}).sort({ createdAt: -1 }).limit(10).toArray();
      let target = null;
      const num = parseInt(identifier);
      if (!isNaN(num) && num > 0 && num <= tasks.length) { target = tasks[num - 1]; }
      else { target = tasks.find(t => t.title.toLowerCase().includes(identifier.toLowerCase())); }
      if (!target) return NextResponse.json({ reply: "❌ Task not found: " + identifier });
      if (intent === "complete_task") {
        await db.collection("tasks").updateOne({ _id: target._id }, { $set: { status: "completed", updatedAt: new Date() } });
        return NextResponse.json({ reply: "✅ Completed: **" + target.title + "**" });
      } else {
        await db.collection("tasks").deleteOne({ _id: target._id });
        return NextResponse.json({ reply: "🗑️ Deleted: **" + target.title + "**" });
      }
    }

    // CONFIRM TASK — user said "yes" to a pending task creation
    if (intent === "confirm_task") {
      const pending = findConfirmation("task");
      if (!pending) return NextResponse.json({ reply: "🤔 I don't see a pending task to confirm. Please describe the task again." });
      if (pending.title) {
        return createTaskFromData(pending);
      }
      // Fallback: re-extract from the original user message
      const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: 'Extract task. Return ONLY JSON: {"title":"...","description":"...","priority":"high|medium|low"}' },
            { role: "user", content: pending.source || message }
          ],
          temperature: 0, max_tokens: 150
        }),
      });
      if (r.ok) {
        const j = await r.json();
        trackTokens(j, "deepseek-chat");
        const txt = j.choices?.[0]?.message?.content || "";
        const m = txt.match(/\{[\s\S]*\}/);
        if (m) return createTaskFromData(JSON.parse(m[0]));
      }
      return NextResponse.json({ reply: "⚠️ Could not confirm task. Please try again." });
    }

    // CONFIRM DOCUMENT — user said "yes" to a pending doc creation
    if (intent === "confirm_document") {
      const pending = findConfirmation("document");
      if (!pending) return NextResponse.json({ reply: "🤔 I don't see a pending document to confirm." });
      if (pending.title && pending.content) {
        await db.collection("documents").insertOne({ title: pending.title, content: pending.content, createdAt: new Date(), updatedAt: new Date() });
        return NextResponse.json({ reply: `✅ Created:\n\n📄 **${pending.title}**` });
      }
      return NextResponse.json({ reply: "⚠️ Could not confirm document. Please try again." });
    }

    // CREATE DOCUMENT — show confirmation first
    if (intent === "create_document") {
      const extractRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST", headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "deepseek-chat", messages: [
          { role: "system", content: 'Create a document. Return ONLY valid JSON: {"title":"document title","content":"<p>HTML content</p>"}' },
          { role: "user", content: message }
        ], temperature: 0, max_tokens: 800 }),
      });
      if (!extractRes.ok) return NextResponse.json({ reply: "⚠️ DeepSeek error " + extractRes.status }, { status: 502 });
      const j2 = await extractRes.json();
      trackTokens(j2, "deepseek-chat");
      const txt2 = j2.choices?.[0]?.message?.content || "";
      const m2 = txt2.match(/\{[\s\S]*\}/);
      if (!m2) return NextResponse.json({ reply: "⚠️ Could not parse document JSON. Raw: " + txt2.slice(0,100) });
      try {
        const p2 = JSON.parse(m2[0]);
        const preview = `📄 **Ready to create?**\n\n**Title:** ${p2.title || "Untitled"}\n**Content:** ${p2.content || message}\n\nReply **yes** to confirm, or describe changes.`;
        return NextResponse.json({ reply: preview });
      } catch {
        const preview = `📄 **Ready to create?**\n\n**Title:** ${message.slice(0, 50)}\n\nReply **yes** to confirm.`;
        return NextResponse.json({ reply: preview });
      }
    }

    // CHAT ONLY - now with full conversation history
    if (intent === "chat") {
      const chatMessages = [
        { role: "system" as const, content: "You are FastMind AI — a helpful assistant. Keep responses concise." },
        ...recentHistory.map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: message }
      ];

      const chatRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "deepseek-chat", messages: chatMessages, temperature: 0.7, max_tokens: 600 }),
      });
      if (chatRes.ok) {
        const j = await chatRes.json();
        trackTokens(j, "deepseek-chat");
        return NextResponse.json({ reply: j.choices?.[0]?.message?.content || "🤔 I'm not sure." });
      }
      return NextResponse.json({ reply: "⚠️ Chat unavailable." });
    }

    // CREATE TASK (default) — show confirmation first
    const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: 'Extract task. Return ONLY JSON: {"title":"...","description":"...","priority":"high|medium|low"}' },
          { role: "user", content: message }
        ],
        temperature: 0, max_tokens: 150
      }),
    });
    if (!r.ok) return NextResponse.json({ reply: "⚠️ DeepSeek error " + r.status }, { status: 502 });
    const j = await r.json();
    trackTokens(j, "deepseek-chat");
    const txt = j.choices?.[0]?.message?.content || "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return NextResponse.json({ reply: "⚠️ Invalid response" }, { status: 502 });
    const p = JSON.parse(m[0]);

    const reply = `📝 **Ready to create?**\n\n**Title:** ${p.title || "Untitled"}\n**Description:** ${p.description || "None"}\n**Priority:** ${p.priority || "medium"}\n\nReply **yes** to confirm, or describe changes.`;
    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json({ reply: "⚠️ " + err.message }, { status: 502 });
  }
}
