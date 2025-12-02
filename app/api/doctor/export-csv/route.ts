import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
    const supabase = createClient();

    // 1. Check Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Check Role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "doctor") {
        return NextResponse.json({ message: "Forbidden: Doctors only" }, { status: 403 });
    }

    // 3. Fetch All Records
    // Note: RLS must allow this, or we need a service role client (not available here without env var for service key)
    // We assume RLS is updated to allow doctors to see all.
    // 3. Fetch All Records
    // Note: RLS must allow this. We assume RLS is updated to allow doctors to see all.
    const { data: records, error: recordsError } = await supabase
        .from("records")
        .select("*")
        .order("created_at", { ascending: false });

    if (recordsError) {
        return NextResponse.json({ message: recordsError.message }, { status: 500 });
    }

    // 4. Fetch Profiles for these records
    const userIds = Array.from(new Set(records.map((r: any) => r.user_id)));
    const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", userIds);

    if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Continue without profiles if error
    }

    // Map profiles to records
    const profileMap = new Map();
    profiles?.forEach((p: any) => profileMap.set(p.id, p));

    const recordsWithProfile = records.map((r: any) => ({
        ...r,
        profiles: profileMap.get(r.user_id) || {}
    }));



    // 4. Generate CSV
    const headers = ["Patient Name", "Age", "Gender", "Blood Group", "Disease", "Legality", "File Name", "Uploaded At"];
    const rows = recordsWithProfile.map((rec: any) => {
        const meta = rec.metadata || {};
        const profile = rec.profiles || {};
        return [
            meta.patient_name || profile.full_name || "Unknown",
            meta.age || "Unknown",
            meta.gender || "Unknown",
            meta.blood_group || "Unknown",
            meta.disease || "Unknown",
            meta.legality || "Unverified",
            rec.title,
            new Date(rec.created_at).toISOString()
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(","); // Escape quotes
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    // 5. Return CSV File
    return new NextResponse(csvContent, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="patient_records_${Date.now()}.csv"`
        }
    });
}
