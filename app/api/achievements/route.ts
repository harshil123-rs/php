import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const baseAchievements = {
  points: 0,
  streak: 0,
  badges: [] as string[],
  last_visit: null as string | null,
  level: 1
};

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data: doc, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!doc) {
    // Create default achievements
    const { data: newDoc, error: insertError } = await supabase
      .from("achievements")
      .insert({
        user_id: user.id,
        ...baseAchievements,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ message: "Error creating achievements" }, { status: 500 });
    }
    return NextResponse.json({ achievements: newDoc });
  }

  return NextResponse.json({ achievements: doc });
}


