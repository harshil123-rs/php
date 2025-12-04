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
    // 1. Total Patients (unique from appointments)
    // 2. Total Appointments
    // 3. Pending Appointments
    // 4. Vitals Trends (mocked or fetched if we had time-series data)

    // For this demo, we'll fetch real counts and mock some trend data if DB is empty

    const { count: totalAppointments } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true });

    const { count: pendingAppointments } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

    // Mock trend data for charts
    const trends = [
        { date: "Mon", patients: 4, emergency: 1 },
        { date: "Tue", patients: 6, emergency: 0 },
        { date: "Wed", patients: 8, emergency: 2 },
        { date: "Thu", patients: 5, emergency: 1 },
        { date: "Fri", patients: 9, emergency: 3 },
        { date: "Sat", patients: 3, emergency: 0 },
        { date: "Sun", patients: 2, emergency: 1 },
    ];

    return NextResponse.json({
        stats: {
            total_patients: 124, // Mocked for demo as calculating unique is expensive here
            total_appointments: totalAppointments || 0,
            pending_appointments: pendingAppointments || 0,
            avg_rating: 4.8
        },
        trends
    });
}
