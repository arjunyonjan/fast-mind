import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { message, spaceId } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return NextResponse.json({ reply: "⚠️ API key not configured" }, { status: 500 });

    // Classify intent
    const classifyRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: 'You are FastMind AI. Features: Spaces, Tasks (priority/status), Documents, Brain Panel, Debug Panel. Actions: create_task, list_tasks, complete_task, delete_task, create_document, chat. Classify into: "create_task", "list_tasks", "complete_task", "delete_task", "create_document", "chat". Return ONLY the word.' },
          { role: "user", content: message }
        ],
        temperature: 0, max_tokens: 10
      }),
    });
    const intent = classifyRes.ok ? ((await classifyRes.json()).choices?.[0]?.message?.content?.trim().toLowerCase() || "create_task") : "create_task";

    const db = await connectToDatabase();

    // LIST TASKS
    if (intent === "list_tasks") {
      const tasks = await db.collection("tasks").find({}).sort({ createdAt: -1 }).limit(10).toArray();
      const list = tasks.map((t, i) => `${i + 1}. ${t.title} [${t.priority}] - ${t.status}`).join("\n");
      return NextResponse.json({ reply: `📋 **Your tasks:**\n${list || "No tasks yet."}` });
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

    // CREATE DOCUMENT
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
      const txt2 = j2.choices?.[0]?.message?.content || "";
      console.log("Document JSON: ", txt2);
      const m2 = txt2.match(/\{[\s\S]*\}/);
      if (!m2) return NextResponse.json({ reply: "⚠️ Could not parse document JSON. Raw: " + txt2.slice(0,100) });
      try {
        const p2 = JSON.parse(m2[0]);
        const result = await db.collection("documents").insertOne({ title: p2.title || "Untitled", content: p2.content || "<p>" + message + "</p>", createdAt: new Date(), updatedAt: new Date() });
        return NextResponse.json({ reply: "📄 Document created: **" + (p2.title || "Untitled") + "**" });
      } catch {
        // Fallback: create with raw message
        const result = await db.collection("documents").insertOne({ title: message.slice(0,50), content: "<p>" + message + "</p>", createdAt: new Date(), updatedAt: new Date() });
        return NextResponse.json({ reply: "📄 Document created (fallback): **" + message.slice(0,50) + "**" });
      }
    }

    // CHAT ONLY
    if (intent === "chat") {
      const chatRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: message }], temperature: 0.7, max_tokens: 300 }),
      });
      if (chatRes.ok) {
        const j = await chatRes.json();
        return NextResponse.json({ reply: j.choices?.[0]?.message?.content || "🤔 I'm not sure." });
      }
      return NextResponse.json({ reply: "⚠️ Chat unavailable." });
    }

    // CREATE TASK (default)
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
    const txt = j.choices?.[0]?.message?.content || "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return NextResponse.json({ reply: "⚠️ Invalid response" }, { status: 502 });
    const p = JSON.parse(m[0]);

    // Auto-detect space if not manually selected
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
            const name = sj.choices?.[0]?.message?.content?.trim();
            const match = spaces.find(s => s.name.toLowerCase() === name?.toLowerCase());
            if (match) finalSpaceId = match._id.toString();
          }
        }
      } catch {}
    }

    const task = { title: p.title || "Untitled", description: p.description || "", priority: p.priority || "medium", status: "pending" };
    await db.collection("tasks").insertOne({ ...task, spaceId: finalSpaceId, createdAt: new Date(), source: "deepseek" });
    return NextResponse.json({ reply: "📝 **" + task.title + "**\n📋 " + (task.description || "No description") + "\n🔴 Priority: " + task.priority + (finalSpaceId ? "\n🪐 Auto-assigned to space" : "") });
  } catch (err: any) {
    return NextResponse.json({ reply: "⚠️ " + err.message }, { status: 502 });
  }
}