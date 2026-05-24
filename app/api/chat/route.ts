import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { message, spaceId } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return NextResponse.json({ reply: "⚠️ API key not configured" }, { status: 500 });

    // Step 1: Ask DeepSeek to classify the intent
    const classifyRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: 'Classify the user message into one of: "create_task", "list_tasks", "complete_task", "delete_task", "create_document", "chat". Return ONLY the intent word.' },
          { role: "user", content: message }
        ],
        temperature: 0, max_tokens: 10
      }),
    });

    const intent = classifyRes.ok ? ((await classifyRes.json()).choices?.[0]?.message?.content?.trim().toLowerCase() || "create_task") : "create_task";

    // Step 2: Route based on intent
    if (intent === "list_tasks") {
      const db = await connectToDatabase();
      const tasks = await db.collection("tasks").find({}).sort({ createdAt: -1 }).limit(10).toArray();
      const list = tasks.map((t, i) => `${i + 1}. ${t.title} [${t.priority}] - ${t.status}`).join("\n");
      return NextResponse.json({ reply: `📋 **Your tasks:**\n${list || "No tasks yet."}` });
    }

    if (intent === "complete_task" || intent === "delete_task") {
      // Extract task number or title from message using DeepSeek
      const extractRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: 'Extract the task identifier (number or title keywords) from: "' + message + '". Return ONLY the identifier.' },
            { role: "user", content: message }
          ],
          temperature: 0, max_tokens: 20
        }),
      });
      const identifier = extractRes.ok ? ((await extractRes.json()).choices?.[0]?.message?.content?.trim() || "") : "";
      const db = await connectToDatabase();
      const tasks = await db.collection("tasks").find({}).sort({ createdAt: -1 }).limit(10).toArray();
      
      let target = null;
      const num = parseInt(identifier);
      if (!isNaN(num) && num > 0 && num <= tasks.length) {
        target = tasks[num - 1];
      } else {
        target = tasks.find(t => t.title.toLowerCase().includes(identifier.toLowerCase()));
      }

      if (!target) return NextResponse.json({ reply: `❌ Could not find task matching "${identifier}".` });

      if (intent === "complete_task") {
        await db.collection("tasks").updateOne({ _id: target._id }, { $set: { status: "completed", updatedAt: new Date() } });
        return NextResponse.json({ reply: `✅ Marked **${target.title}** as completed.` });
      } else {
        await db.collection("tasks").deleteOne({ _id: target._id });
        return NextResponse.json({ reply: `🗑️ Deleted **${target.title}**.` });
      }
    }

    if (intent === "create_document") {
      const extractRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: 'Extract from: "' + message + '". Return ONLY JSON: {"title":"document title","content":"document content in HTML"}' },
            { role: "user", content: message }
          ],
          temperature: 0, max_tokens: 500
        }),
      });
      if (extractRes.ok) {
        const j = await extractRes.json();
        const txt = j.choices?.[0]?.message?.content || "";
        const m = txt.match(/\{[\s\S]*\}/);
        if (m) {
          const p = JSON.parse(m[0]);
          const db = await connectToDatabase();
          const result = await db.collection("documents").insertOne({ title: p.title, content: p.content, createdAt: new Date(), updatedAt: new Date() });
          return NextResponse.json({ reply: `📄 Document created: **${p.title}**` });
        }
      }
      return NextResponse.json({ reply: "⚠️ Could not create document." });
    }

    if (intent === "chat") {
      const chatRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: message }],
          temperature: 0.7, max_tokens: 300
        }),
      });
      if (chatRes.ok) {
        const j = await chatRes.json();
        return NextResponse.json({ reply: j.choices?.[0]?.message?.content || "🤔 I'm not sure how to respond." });
      }
      return NextResponse.json({ reply: "⚠️ Chat unavailable." });
    }

    // Default: create_task
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

    if (!r.ok) return NextResponse.json({ reply: "⚠️ DeepSeek error " + r.status }, { status: 502 });

    const j = await r.json();
    const txt = j.choices?.[0]?.message?.content || "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return NextResponse.json({ reply: "⚠️ Invalid response" }, { status: 502 });

    const p = JSON.parse(m[0]);
    const task = { title: p.title || "Untitled", description: p.description || "", priority: p.priority || "medium", status: "pending" };

    const db = await connectToDatabase();
    await db.collection("tasks").insertOne({ ...task, spaceId: spaceId || null, createdAt: new Date(), source: "deepseek" });

    return NextResponse.json({ reply: `📝 **${task.title}**\n📋 ${task.description || "No description"}\n🔴 Priority: ${task.priority}` });
  } catch (err: any) {
    return NextResponse.json({ reply: "⚠️ " + err.message }, { status: 502 });
  }
}