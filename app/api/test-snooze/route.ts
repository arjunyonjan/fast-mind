import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  const db = await connectToDatabase();
  
  // Add snoozeUntil to first pending task (2 minutes from now)
  const pending = await db.collection("pendingTasks").findOne({});
  if (!pending) {
    return NextResponse.json({ error: "No pending tasks found" });
  }
  
  await db.collection("pendingTasks").updateOne(
    { _id: pending._id },
    { $set: { snoozeUntil: new Date(Date.now() + 2 * 60 * 1000) } }
  );
  
  return NextResponse.json({ 
    message: "Snooze added for 2 minutes",
    task: pending.data?.title,
    snoozeUntil: new Date(Date.now() + 2 * 60 * 1000)
  });
}
