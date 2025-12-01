import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
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
    return NextResponse.json({ message: "Profile not found" }, { status: 404 });
  }

  // Return in the format expected by the frontend (nested under 'user' key if needed, or just the profile)
  // The original code returned { user: { ... } } where user object had profile fields?
  // Original code: returned user object from 'users' collection.
  // We should return a merged object or just the profile if the frontend expects it.
  // Let's return the profile merged with email/name from auth.

  const fullUser = {
    ...profile,
    email: user.email,
    name: profile.full_name
  };

  return NextResponse.json({ user: fullUser });
}


