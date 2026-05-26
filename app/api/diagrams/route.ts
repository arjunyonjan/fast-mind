import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public/diagrams');
    const files = await fs.readdir(dir);
    const svgFiles = files.filter(f => f.endsWith('.svg'));
    return NextResponse.json(svgFiles);
  } catch {
    return NextResponse.json([]);
  }
}
