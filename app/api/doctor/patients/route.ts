import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify doctor role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "doctor") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // SIMPLIFIED: Fetch ALL patients from profiles
        // This allows doctors to prescribe to any registered user, not just those with appointments.
        const { data: patients, error: profilesError } = await supabase
            .from("profiles")
            .select("id, full_name, email, created_at")
            .eq("role", "patient")
            .order("full_name");

        if (profilesError) throw profilesError;

        return NextResponse.json({ patients });

    } catch (error: any) {
        console.error("Error fetching patients:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
