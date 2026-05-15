import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { title, content, slug } = await request.json();
    
    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    const documents = db.collection('documents');
    
    const existingDoc = await documents.findOne({ slug });
    if (existingDoc) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      );
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
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await connectToDatabase();
    const documents = db.collection('documents');
    
    const allDocuments = await documents
      .find({})
      .sort({ updatedAt: -1 })
      .project({ content: 0 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      documents: allDocuments
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
