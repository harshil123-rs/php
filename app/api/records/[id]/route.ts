import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // First get the record to find the file path
  const { data: record, error: fetchError } = await supabase
    .from("records")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !record) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  // Delete from storage if URL exists
  if (record.file_url) {
    try {
      // Extract path from URL. URL is like: https://.../storage/v1/object/public/records/user_id/filename
      // We need 'user_id/filename'
      // Or if we stored the path in metadata? No, we stored publicUrl.
      // Let's try to parse it.
      const url = new URL(record.file_url);
      const pathParts = url.pathname.split('/records/'); // assuming bucket name is 'records'
      if (pathParts.length > 1) {
        const storagePath = pathParts[1]; // this should be the path within the bucket
        await supabase.storage.from('records').remove([storagePath]);
      }
    } catch (e) {
      console.error("Error deleting file from storage:", e);
    }
  }

  const { error: deleteError } = await supabase
    .from("records")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json({ message: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}


