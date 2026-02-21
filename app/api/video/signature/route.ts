// app/api/video/signature/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json(
      { error: "Missing Cloudinary environment variables" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") ?? "videos";
  const publicId = searchParams.get("publicId") ?? undefined;

  const timestamp = Math.floor(Date.now() / 1000);

  // IMPORTANT: The signature must cover the same params you send to Cloudinary.
  // If you send `folder`, it must be included here.
  const paramsToSign: Record<string, string | number> = { timestamp, folder };
  if (publicId) paramsToSign.public_id = publicId;

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return NextResponse.json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    publicId,
  });
}