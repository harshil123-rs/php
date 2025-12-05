
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = createClient();

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error("Patient Analytics: Unauthorized", authError);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("Patient Analytics: Fetching for User ID:", user.id);

        // Fetch vitals for the logged-in patient
        const { data: vitals, error: vitalsError } = await supabase
            .from("vitals")
            .select("*")
            .eq("patient_id", user.id)
            .order("recorded_at", { ascending: true })
            .limit(30); // Last 30 records

        if (vitalsError) {
            console.error("Error fetching vitals:", vitalsError);
            return NextResponse.json({ error: "Failed to fetch vitals" }, { status: 500 });
        }

        console.log(`Patient Analytics: Found ${vitals?.length} records for user ${user.id}`);

        // Calculate simple trends (e.g., average heart rate)
        const avgHeartRate = vitals && vitals.length > 0
            ? Math.round(vitals.reduce((acc, curr) => acc + (curr.heart_rate || 0), 0) / vitals.length)
            : 0;

        const avgSystolic = vitals && vitals.length > 0
            ? Math.round(vitals.reduce((acc, curr) => acc + (curr.systolic_bp || 0), 0) / vitals.length)
            : 0;

        const avgDiastolic = vitals && vitals.length > 0
            ? Math.round(vitals.reduce((acc, curr) => acc + (curr.diastolic_bp || 0), 0) / vitals.length)
            : 0;

        return NextResponse.json({
            vitals: vitals || [],
            summary: {
                avg_heart_rate: avgHeartRate,
                avg_bp: `${avgSystolic}/${avgDiastolic}`,
                total_records: vitals?.length || 0
            }
        });

    } catch (error: any) {
        console.error("Patient Analytics Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
