import { NextRequest, NextResponse } from 'next/server';
import { getUsageSummary, getUsageLog, clearUsageLog } from '@/lib/token-monitor';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const limit = parseInt(searchParams.get('limit') || '100');

  if (action === 'log') {
    return NextResponse.json({ log: getUsageLog(limit) });
  }

  const summary = getUsageSummary(startDate, endDate);
  return NextResponse.json({ summary });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'clear') {
    clearUsageLog();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
