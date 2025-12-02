import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Map frontend fields to DB columns
    // Frontend: name, age, bloodGroup, allergies, conditions, avatarKey
    // DB: full_name, age, blood_group, allergies, conditions, avatar_url

    const updates = {
      full_name: body.name,
      age: body.age,
      blood_group: body.bloodGroup,
      allergies: body.allergies,
      conditions: body.conditions,
      avatar_url: body.avatarKey, // Using avatarKey as avatar_url in DB
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: error.message || "Internal Error" }, { status: 500 });
  }
}
