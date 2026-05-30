import { NextResponse } from "next/server";

export async function GET() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return NextResponse.json({
    configured: !!(cloudName && apiKey && apiSecret),
    cloudName: cloudName ? "✅" : "❌",
    apiKey: apiKey ? "✅" : "❌",
    apiSecret: apiSecret ? "✅" : "❌"
  });
}
