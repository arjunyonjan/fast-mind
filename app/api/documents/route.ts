import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const docs = await db.collection("documents").find({}).sort({ updatedAt: -1 }).limit(10).toArray();
    const serialized = docs.map(({ _id, title, content, updatedAt }) => ({
      _id: _id.toString(),
      title: title || "Untitled",
      content: content || "",
      updatedAt: updatedAt?.toISOString?.() || new Date().toISOString(),
    }));
    return NextResponse.json({ success: true, documents: serialized });
  } catch (err: any) {
    console.error("[API/documents]", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();
    const db = await connectToDatabase();
    const result = await db.collection("documents").insertOne({
      title: title || "Untitled",
      content: content || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("? Document saved:", result.insertedId);
    return NextResponse.json({ success: true, document: { _id: result.insertedId.toString(), title, content } });
  } catch (err: any) {
    console.error("[API/documents POST]", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


