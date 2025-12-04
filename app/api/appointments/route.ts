import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    let query = supabase
        .from("appointments")
        .select(`
      *,
      patient:patient_id(full_name, email),
      doctor:doctor_id(full_name, email)
    `)
        .order("date", { ascending: true });

    if (profile?.role === "doctor") {
        query = query.eq("doctor_id", user.id);
    } else {
        query = query.eq("patient_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ appointments: data });
}

export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { doctor_id, date, time, type, notes } = body;

    const { data, error } = await supabase
        .from("appointments")
        .insert({
            patient_id: user.id,
            doctor_id,
            date,
            time,
            type,
            notes,
            status: "pending"
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ appointment: data });
}
