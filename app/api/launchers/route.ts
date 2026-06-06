import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { name, description, command, cwd } = await req.json();
    if (!name || !command) {
      return NextResponse.json({ success: false, error: "Name and command required" }, { status: 400 });
    }
    
    const db = await connectToDatabase();
    const result = await db.collection("launchers").insertOne({
      name,
      description: description || "",
      command,
      cwd: cwd || null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json({ success: true, launcher: { id: result.insertedId, name, description, command, cwd } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { name, description, command, cwd } = await req.json();
    
    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }
    if (!name || !command) {
      return NextResponse.json({ success: false, error: "Name and command required" }, { status: 400 });
    }
    
    const db = await connectToDatabase();
    const result = await db.collection("launchers").updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, description: description || "", command, cwd: cwd || null, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Launcher not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }
    
    const db = await connectToDatabase();
    const result = await db.collection("launchers").deleteOne({ 
      _id: new ObjectId(id) 
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Launcher not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await connectToDatabase();
    const launchers = await db.collection("launchers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({ success: true, launchers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}