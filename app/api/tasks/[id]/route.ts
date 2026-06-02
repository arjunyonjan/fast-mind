import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    const db = await connectToDatabase();
    const result = await db.collection("tasks").updateOne(
      { _id: new ObjectId(id) },
      { $set: {...body, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }
    const db = await connectToDatabase();
    await db.collection("tasks").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
