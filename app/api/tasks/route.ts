import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const tasks = await db
      .collection("tasks")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const serialized = tasks.map(({ _id, title, priority, status, source, createdAt }) => ({
      _id: _id.toString(),
      title,
      priority,
      status,
      source,
      createdAt: createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, tasks: serialized });
  } catch (err: any) {
    console.error("[API/tasks]", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
