import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  req: Request,
  { params }: { params: { name: string } }
) {
  try {
    const filePath = path.join(process.cwd(), 'public/diagrams', params.name);
    const svg = await fs.readFile(filePath);
    return new NextResponse(svg, {
      headers: { "Content-Type": "image/svg+xml" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}