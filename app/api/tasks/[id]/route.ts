// app/api/tasks/[id]/route.ts
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
    const db = await connectToDatabase();
    
    const update: any = {};
    if (body.title !== undefined) update.title = body.title;
    if (body.description !== undefined) update.description = body.description;
    if (body.priority !== undefined) update.priority = body.priority;
    if (body.status !== undefined) update.status = body.status;
    if (body.dueDate !== undefined) update.dueDate = body.dueDate;
    update.updatedAt = new Date();
    
    const result = await db.collection("tasks").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
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
    const db = await connectToDatabase();
    
    const result = await db.collection("tasks").deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}