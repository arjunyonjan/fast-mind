import { NextResponse } from "next/server";

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  bytes: number;
}

interface CloudinaryApiResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
}

export async function GET() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary credentials not configured" },
      { status: 500 },
    );
  }

  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=100`;

    const response = await fetch(new URL(url), {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Cloudinary API error ${response.status}: ${text}`);
      return NextResponse.json(
        { error: `Cloudinary API returned ${response.status}` },
        { status: 502 },
      );
    }

    const data: CloudinaryApiResponse = await response.json();

    const sorted = data.resources.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    const latest = sorted.slice(0, 100);

    const images = latest.map((res) => ({
      public_id: res.public_id,
      url: res.secure_url,
      width: res.width,
      height: res.height,
      format: res.format,
      created_at: res.created_at,
    }));

    return NextResponse.json({ images });
  } catch (err) {
    console.error("Cloudinary fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch images from Cloudinary" },
      { status: 502 },
    );
  }
}
