import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await connectToDatabase();
    
    // Ping the database to check connection
    await db.command({ ping: 1 });
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connected successfully!' 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect to database' },
      { status: 500 }
    );
  }
}


