import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  const db = await connectToDatabase();
  const expired = await db.collection("pendingTasks").find({
    snoozeUntil: { $lte: new Date() }
  }).toArray();
  
  for (const task of expired) {
    await db.collection("pendingTasks").updateOne(
      { _id: task._id },
      { $set: { reminderReady: true }, $unset: { snoozeUntil: "" } }
    );
  }
  
  return NextResponse.json({ success: true, expiredCount: expired.length });
}
