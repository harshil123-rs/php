import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const fullName = formData.get("fullName");
    const age = formData.get("age");
    const email = formData.get("email");

    // File upload
    const file = formData.get("photo") as File | null;
    let photoUrl = null;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "uploads/profile");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const filename = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, filename);

      fs.writeFileSync(filePath, buffer);

      photoUrl = `/uploads/profile/${filename}`;
    }

    // TODO: Save user info & photoUrl to MongoDB here

    return NextResponse.json({
      success: true,
      photoUrl,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
