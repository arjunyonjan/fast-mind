import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

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
