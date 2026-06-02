import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid document ID" }, { status: 400 });
    }

    const db = await connectToDatabase();
    const doc = await db.collection("documents").findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      document: {
        _id: doc._id.toString(),
        title: doc.title,
        content: doc.content,
        updatedAt: doc.updatedAt?.toISOString?.() || new Date().toISOString(),
      }
    });
  } catch (err: any) {
    console.error("[API/documents/[id] GET]", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, content } = await req.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    const db = await connectToDatabase();
    const result = await db.collection("documents").updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, content, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
    }

    const updated = await db.collection("documents").findOne({ _id: new ObjectId(id) });
    return NextResponse.json({
      success: true,
      document: {
        _id: updated._id.toString(),
        title: updated.title,
        content: updated.content,
        updatedAt: updated.updatedAt?.toISOString?.() || new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error("[API/documents/[id] PUT]", err.message);
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
    const result = await db.collection("documents").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[API/documents/[id] DELETE]", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
