import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const tasks = await db.collection("tasks").find({}).sort({ createdAt: -1 }).toArray();
    const serialized = tasks.map(({ _id, title, description, priority, status, source, createdAt }) => ({
      _id: _id.toString(),
      title,
      description: description || "",
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

export async function POST(req: Request) {
  try {
    const { title, description, priority, status, source, spaceId } = await req.json();
    const db = await connectToDatabase();
    const result = await db.collection("tasks").insertOne({
      title: title || "Untitled",
      description: description || "",
      priority: priority || "medium",
      status: status || "pending",
      source: source || "manual",
      spaceId: spaceId || null,
      createdAt: new Date(),
    });
    return NextResponse.json({ success: true, task: { _id: result.insertedId.toString(), title, description } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}