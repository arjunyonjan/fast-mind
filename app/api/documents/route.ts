import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    
    const db = await connectToDatabase();
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const documents = await db.collection('documents')
      .find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    const total = await db.collection('documents').countDocuments(query);
    
    return NextResponse.json({ success: true, documents, total, page, limit, search });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, slug } = await request.json();
    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }
    const db = await connectToDatabase();
    const documents = db.collection('documents');
    const existingDoc = await documents.findOne({ slug });
    if (existingDoc) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    const newDocument = {
      title,
      content: content || '',
      slug,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await documents.insertOne(newDocument);
    return NextResponse.json({
      success: true,
      document: { id: result.insertedId, ...newDocument }
    }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}