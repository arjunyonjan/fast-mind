import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    configured: false,
    message: "Cloudinary not configured"
  });
}