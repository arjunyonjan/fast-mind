import { NextResponse } from "next/server";

export async function GET() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  const configured = !!(cloudName && apiKey && apiSecret);
  
  return NextResponse.json({
    configured: configured,
    message: configured ? "Cloudinary configured" : "Cloudinary not configured - add credentials to .env"
  });
}