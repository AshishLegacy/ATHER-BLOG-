import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Please log in to upload images." },
        { status: 401 }
      );
    }

    const data = await request.formData();
    const file = data.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    // Validate mime type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files (JPEG, PNG, WebP, GIF) are allowed." },
        { status: 400 }
      );
    }

    // Limit size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds the 10MB limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Determine extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    let filename = `${randomUUID()}.${ext}`;
    let filepath = path.join(uploadsDir, filename);

    // Try Sharp optimization if available, fallback to direct buffer write
    let optimized = false;
    try {
      const sharp = (await import("sharp")).default;
      filename = `${randomUUID()}.webp`;
      filepath = path.join(uploadsDir, filename);

      await sharp(buffer)
        .resize({ width: 1920, height: 1080, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filepath);

      optimized = true;
    } catch {
      // Fallback: write original buffer without sharp
      await fs.writeFile(filepath, buffer);
    }

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      url: publicUrl,
      filename,
      size: file.size,
      optimized,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload and process image. Please try an image link." },
      { status: 500 }
    );
  }
}
