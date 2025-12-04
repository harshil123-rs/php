import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patientId = params.id;

    // Fetch Profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", patientId)
        .single();

    // Fetch Records
    const { data: records } = await supabase
        .from("records")
        .select("*")
        .eq("user_id", patientId)
        .order("created_at", { ascending: false });

    // Fetch Prescriptions
    const { data: prescriptions } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

    // Fetch Appointments
    const { data: appointments } = await supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", patientId)
        .order("date", { ascending: false });

    // Fetch Vitals
    const { data: vitals } = await supabase
        .from("vitals")
        .select("*")
        .eq("patient_id", patientId)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .single();

    return NextResponse.json({
        profile,
        records,
        prescriptions,
        appointments,
        vitals
    });
}
