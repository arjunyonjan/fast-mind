import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await connectToDatabase();
    const doc = await db.collection("documents").findOne({ _id: new ObjectId(id) });
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, document: { _id: doc._id.toString(), title: doc.title, content: doc.content, updatedAt: doc.updatedAt?.toISOString?.() } });
  } catch (err: any) { return NextResponse.json({ success: false, error: err.message }, { status: 500 }); }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { title, content } = await req.json();
    const db = await connectToDatabase();
    const result = await db.collection("documents").findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { title, content, updatedAt: new Date() } }, { returnDocument: "after" });
    if (!result) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, document: { _id: result._id.toString(), title: result.title, content: result.content, updatedAt: result.updatedAt?.toISOString?.() } });
  } catch (err: any) { return NextResponse.json({ success: false, error: err.message }, { status: 500 }); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await connectToDatabase();
    const result = await db.collection("documents").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) { return NextResponse.json({ success: false, error: err.message }, { status: 500 }); }
}