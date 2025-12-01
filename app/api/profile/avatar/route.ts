import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";

const schema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const key = `avatars/${user.id}/${Date.now()}-${parsed.data.filename}`;

  // Create a signed upload URL for the 'records' bucket (or 'avatars' if we had one, but schema.sql used 'records' for everything?)
  // Wait, schema.sql created 'records' bucket. I should probably use 'records' bucket or create 'avatars' bucket.
  // The schema.sql said: insert into storage.buckets (id, name) values ('records', 'records');
  // I'll use 'records' bucket for now to avoid creating another one unless I update schema.
  // Actually, let's just use 'records' bucket for simplicity as per plan.

  const { data, error } = await supabase
    .storage
    .from('records')
    .createSignedUploadUrl(key);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  // Supabase signed upload URL is in data.signedUrl
  // But wait, createSignedUploadUrl creates a URL to upload TO?
  // Yes.

  // Also need the public URL for viewing.
  const { data: publicUrlData } = supabase
    .storage
    .from('records')
    .getPublicUrl(key);

  return NextResponse.json({
    uploadUrl: data?.signedUrl,
    key,
    urlPublic: publicUrlData.publicUrl
  });
}


