import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  const db = await connectToDatabase();
  const spaces = await db.collection("spaces").find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ success: true, spaces: spaces.map(s => ({ _id: s._id.toString(), name: s.name })) });
}

export async function POST(req: Request) {
  const { name } = await req.json();
  const db = await connectToDatabase();
  const result = await db.collection("spaces").insertOne({ name, createdAt: new Date() });
  return NextResponse.json({ success: true, space: { _id: result.insertedId.toString(), name } });
}

