import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get("x-cron-secret");
  if (authHeader !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { connectToDatabase } = await import("@/lib/mongodb");
  const db = await connectToDatabase();
  
  const expired = await db.collection("pendingTasks").find({
    snoozeUntil: { $lte: new Date() }
  }).toArray();
  
  // Mark them as ready (add flag to show on next user interaction)
  for (const task of expired) {
    await db.collection("pendingTasks").updateOne(
      { _id: task._id },
      { $set: { reminderReady: true }, $unset: { snoozeUntil: "" } }
    );
  }
  
  return NextResponse.json({ success: true, count: expired.length });
}
