import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(_req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  // Construct response to match frontend expectation:
  // { user: { name, email, profile: { age, bloodGroup, ... } } }

  const responseData = {
    user: {
      name: profile.full_name,
      email: user.email,
      profile: {
        age: profile.age,
        bloodGroup: profile.blood_group,
        allergies: profile.allergies,
        conditions: profile.conditions,
        avatarKey: profile.avatar_url,
        role: profile.role
      }
    }
  };

  return NextResponse.json(responseData);
}
