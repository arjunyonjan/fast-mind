import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const items = await db.collection('pendingTasks')
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .toArray();

    const mapped = items.map(i => ({
      _id: i._id.toString(),
      type: i.type,
      data: i.data,
      createdAt: i.createdAt,
    }));

    return NextResponse.json({ success: true, items: mapped });
  } catch (error) {
    console.error('Pending API error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { sessionId, id } = await req.json();
    if (!sessionId || !id) {
      return NextResponse.json({ success: false, error: 'sessionId and id required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const pending = await db.collection('pendingTasks').findOne({ _id: new ObjectId(id), sessionId });
    if (!pending) {
      return NextResponse.json({ success: false, error: 'Pending item not found' }, { status: 404 });
    }

    const task = {
      title: pending.data.title || 'Untitled',
      description: pending.data.description || '',
      priority: pending.data.priority || 'medium',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'pending-confirm',
    };
    await db.collection('tasks').insertOne(task);
    await db.collection('pendingTasks').deleteOne({ _id: pending._id });

    return NextResponse.json({ success: true, reply: `✅ Created: ${task.title}` });
  } catch (error) {
    console.error('Pending confirm error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
