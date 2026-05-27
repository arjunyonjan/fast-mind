import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

// GET - Load a session or get the last one
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const db = await connectToDatabase();

    if (sessionId) {
      const session = await db.collection("chatSessions").findOne({ sessionId });
      if (session) return NextResponse.json({ success: true, session });
    }

    // Fall back to most recent session
    const last = await db.collection("chatSessions")
      .find({})
      .sort({ updatedAt: -1 })
      .limit(1)
      .toArray();

    if (last.length > 0) {
      return NextResponse.json({ success: true, session: last[0] });
    }

    return NextResponse.json({ success: false, session: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

// POST - Save or update a session (fire-and-forget, no blocking)
export async function POST(req: NextRequest) {
  try {
    const { sessionId, messages } = await req.json();
    if (!sessionId || !messages) return NextResponse.json({ success: false, error: "Missing sessionId or messages" });

    const db = await connectToDatabase();

    const lastMsg = messages[messages.length - 1];
    const updateDoc = {
      sessionId,
      messages,
      updatedAt: new Date(),
      lastMessage: lastMsg?.content?.slice(0, 100) || "",
      messageCount: messages.length,
    };

    await db.collection("chatSessions").updateOne(
      { sessionId },
      { $set: updateDoc },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
