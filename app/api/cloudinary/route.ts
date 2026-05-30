import { NextResponse } from "next/server";

export async function GET() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Check all required environment variables
  if (!cloudName || !apiKey || !apiSecret) {
    const missing = [];
    if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missing.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
    
    return NextResponse.json(
      { error: 'Missing Cloudinary configuration', missing: missing },
      { status: 500 }
    );
  }

  const auth = Buffer.from(apiKey + ':' + apiSecret).toString('base64');
  const url = 'https://api.cloudinary.com/v1_1/' + cloudName + '/resources/image?max_results=100';

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Basic ' + auth
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Cloudinary API error: ' + response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    const images = (data.resources || []).map(function(r) {
      return {
        public_id: r.public_id,
        url: r.secure_url,
        width: r.width,
        height: r.height,
        format: r.format,
        created_at: r.created_at
      };
    });

    return NextResponse.json({ images: images });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch from Cloudinary';
    return NextResponse.json(
      { error: errorMsg },
      { status: 502 }
    );
  }
}