import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = (formData.get("type") as string | null) || "Other";

  if (!file) {
    return NextResponse.json({ message: "File missing" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const filename = `${Date.now()}-${safeName}`;
  const filePath = `${user.id}/${filename}`;

  const { error: uploadError } = await supabase
    .storage
    .from('records')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    return NextResponse.json({ message: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase
    .storage
    .from('records')
    .getPublicUrl(filePath);

  const { data: doc, error: insertError } = await supabase
    .from("records")
    .insert({
      user_id: user.id,
      title: file.name, // Using filename as title for now
      file_url: publicUrlData.publicUrl,
      file_type: type,
      metadata: {
        originalName: file.name,
        size: file.size,
        mimeType: file.type
      }
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ message: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    record: { ...doc, url: doc.file_url }
  });
}
