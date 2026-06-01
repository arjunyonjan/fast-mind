import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const res = await fetch('https://api.deepseek.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      signal: AbortSignal.timeout(5000)
    })
    
    return NextResponse.json({ online: res.ok })
  } catch {
    return NextResponse.json({ online: false })
  }
}
