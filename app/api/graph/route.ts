import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await connectToDatabase();

    const documents = await db.collection('documents').find({}).sort({ updatedAt: -1 }).toArray();
    const tasks = await db.collection('tasks').find({}).sort({ createdAt: -1 }).toArray();
    const spaces = await db.collection('spaces').find({}).toArray();

    const nodes: { id: string; label: string; type: string; href: string; color: string }[] = [];
    const edges: { source: string; target: string }[] = [];

    for (const s of spaces) {
      const id = s._id.toString();
      nodes.push({ id, label: s.name, type: 'space', href: `/documents?space=${id}`, color: '#a855f7' });
    }

    for (const d of documents) {
      const id = d._id.toString();
      nodes.push({ id, label: d.title || 'Untitled', type: 'document', href: `/documents/${id}`, color: '#06b6d4' });
      const words = (d.title || '').toLowerCase().split(/\s+/).filter(Boolean);
      for (const other of documents) {
        if (d._id.toString() === other._id.toString()) continue;
        const otherWords = (other.title || '').toLowerCase().split(/\s+/).filter(Boolean);
        if (words.some((w: string) => w.length > 3 && otherWords.includes(w))) {
          edges.push({ source: id, target: other._id.toString() });
        }
      }
    }

    for (const t of tasks) {
      const id = t._id.toString();
      nodes.push({ id, label: t.title || 'Untitled', type: 'task', href: `/tasks`, color: '#f59e0b' });
      const words = (t.title || '').toLowerCase().split(/\s+/).filter(Boolean);
      for (const other of tasks) {
        if (t._id.toString() === other._id.toString()) continue;
        const otherWords = (other.title || '').toLowerCase().split(/\s+/).filter(Boolean);
        if (words.some((w: string) => w.length > 3 && otherWords.includes(w))) {
          edges.push({ source: id, target: other._id.toString() });
        }
      }
    }

    return NextResponse.json({ success: true, nodes, edges });
  } catch (error) {
    console.error('Graph API error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
