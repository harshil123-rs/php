import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
    const supabase = createClient();

    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get("record_id");

    if (recordId) {
        // Fetch specific record analysis
        const { data: record, error } = await supabase
            .from("records")
            .select("*")
            .eq("id", recordId)
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Generate "Real-time" analysis based on metadata
        // In a real app, this might call an AI service again or process vitals.
        // Here we'll structure the existing metadata for the frontend.
        const metadata = record.metadata || {};

        const analysis = {
            record_title: record.title,
            patient_name: metadata.patient_name || "Unknown",
            date: record.created_at,
            metrics: [
                { label: "Blood Pressure", value: metadata.blood_pressure || "120/80", status: "Normal", unit: "mmHg" },
                { label: "Heart Rate", value: metadata.heart_rate || "72", status: "Normal", unit: "bpm" },
                { label: "Sugar Level", value: metadata.sugar_level || "95", status: "Good", unit: "mg/dL" },
                { label: "Temperature", value: metadata.temperature || "98.6", status: "Normal", unit: "°F" },
            ],
            ai_summary: metadata.summary || "No AI summary available for this record.",
            risk_assessment: metadata.disease ? "Moderate Attention Required" : "Low Risk",
            recommendations: [
                "Monitor vitals daily",
                "Follow prescribed medication",
                "Regular follow-up in 7 days"
            ]
        };

        return NextResponse.json({ analysis });
    }

    // Default: Fetch aggregate data

    // 1. Total Patients
    const { count: totalPatients } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "patient");

    // 2. Total Appointments
    const { count: totalAppointments } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true });

    // 3. Pending Appointments
    const { count: pendingAppointments } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

    // 4. Trends (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Include today
    const dateString = sevenDaysAgo.toISOString().split('T')[0];

    const { data: recentAppts } = await supabase
        .from("appointments")
        .select("date, type")
        .gte("date", dateString);

    // Process trends
    const trends = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateKey = d.toISOString().split('T')[0];
        const dayName = days[d.getDay()];

        const dayAppts = recentAppts?.filter(a => a.date === dateKey) || [];
        const patientCount = dayAppts.length;
        const emergencyCount = dayAppts.filter(a => a.type === 'emergency').length;

        trends.push({
            date: dayName,
            patients: patientCount,
            emergency: emergencyCount
        });
    }

    return NextResponse.json({
        stats: {
            total_patients: totalPatients || 0,
            total_appointments: totalAppointments || 0,
            pending_appointments: pendingAppointments || 0,
            avg_rating: 4.8 // Rating is not yet in DB, keeping mock
        },
        trends
    });
}
