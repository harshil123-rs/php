import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(_request: NextRequest) {
  const supabase = createClient();

  const { data: records, error } = await supabase
    .from("records")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map stored "file_url" field to "url" so the frontend can open the file directly
  // If using Supabase Storage, we might need to generate a signed URL if it's private,
  // but for now assuming public or direct link.
  const mapped = records.map((rec) => ({
    ...rec,
    url: rec.file_url
  }));

  return NextResponse.json({ records: mapped });
}


