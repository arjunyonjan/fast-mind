import { NextResponse } from "next/server";

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
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

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const url = "https://api.cloudinary.com/v1_1/" + cloudName + "/resources/image?max_results=100";

  let cloudinaryRes: Response;
  try {
    cloudinaryRes = await fetch(url, {
      headers: { Authorization: "Basic " + auth },
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    console.error("Cloudinary fetch error:", err);
    return NextResponse.json(
      { error: "Failed to reach Cloudinary API" },
      { status: 502 },
    );
  }

  if (!cloudinaryRes.ok) {
    return NextResponse.json(
      { error: "Cloudinary API returned " + cloudinaryRes.status },
      { status: 502 },
    );
  }

  try {
    const data: CloudinaryApiResponse = await cloudinaryRes.json();

    const sorted = [...data.resources].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    const images = sorted.slice(0, 100).map((r) => ({
      public_id: r.public_id,
      url: r.secure_url,
      width: r.width,
      height: r.height,
      format: r.format,
      created_at: r.created_at,
    }));

    return NextResponse.json({ images });
  } catch (err) {
    console.error("Cloudinary parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse Cloudinary response" },
      { status: 502 },
    );
  }
}
