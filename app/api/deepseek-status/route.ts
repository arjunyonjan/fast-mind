// app/api/cloudinary-status/route.ts - NEW FILE
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    configured: !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌',
    apiKey: process.env.CLOUDINARY_API_KEY ? '✅' : '❌',
    apiSecret: process.env.CLOUDINARY_API_SECRET ? '✅' : '❌',
  });
}