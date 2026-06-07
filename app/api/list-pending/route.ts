import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  const db = await connectToDatabase();
  const all = await db.collection("pendingTasks").find({}).toArray();
  
  return NextResponse.json({ 
    count: all.length,
    tasks: all.map(t => ({ 
      sessionId: t.sessionId,
      type: t.type,
      title: t.data?.title || t.data?.name,
      snoozeUntil: t.snoozeUntil,
      reminderReady: t.reminderReady || false
    }))
  });
}
