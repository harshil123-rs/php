import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
    const supabase = createClient();

    // Fetch profiles with role 'doctor'
    const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, specialization")
        .eq("role", "doctor");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ doctors: data });
}
