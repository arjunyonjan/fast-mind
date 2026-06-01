import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const db = await connectToDatabase();
  const query = status ? { status } : {};
  const tasks = await db.collection('tasks').find(query).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ success: true, tasks });
}

export async function POST(req: Request) {
  const { title, description, priority } = await req.json();
  const db = await connectToDatabase();
  const result = await db.collection('tasks').insertOne({
    title, description, priority, status: 'pending',
    createdAt: new Date(), updatedAt: new Date()
  });
  return NextResponse.json({ success: true, task: { id: result.insertedId, title, description, priority, status: 'pending' } });
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json();
  const db = await connectToDatabase();
  await db.collection('tasks').updateOne({ _id: new ObjectId(id) }, { $set: { status, updatedAt: new Date() } });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const db = await connectToDatabase();
  await db.collection('tasks').deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ success: true });
}