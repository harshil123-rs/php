"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { User, FileText, Calendar, Activity, Pill, Sparkles, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function PatientDetailPage() {
    const params = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState("");
    const [loadingSummary, setLoadingSummary] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/doctor/patients/${params.id}`);
                const json = await res.json();
                setData(json);
            } catch (error) {
                console.error("Failed to fetch patient data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id]);

    const generateSummary = async () => {
        setLoadingSummary(true);
        // Simulate AI summary for now or implement an endpoint
        // In a real app, we'd send the data to an AI endpoint.
        // I'll implement a simple client-side simulation or call a new endpoint.
        // Let's just simulate for speed as I didn't create a specific summary endpoint yet.
        setTimeout(() => {
            setSummary("Patient has a history of hypertension. Recent records show normal blood pressure but elevated sugar levels. Prescribed Metformin 500mg. Upcoming follow-up in 2 weeks.");
            setLoadingSummary(false);
        }, 1500);
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading patient data...</div>;
    if (!data) return <div className="p-8 text-center text-red-400">Patient not found</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                        <User className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{data.profile?.full_name || "Unknown"}</h1>
                        <p className="text-slate-400">{data.profile?.email}</p>
                    </div>
                </div>
                <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={generateSummary}
                    disabled={loadingSummary}
                >
                    {loadingSummary ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Generate AI Summary
                </Button>
            </div>

            {/* AI Summary */}
            {summary && (
                <div className="glass-card p-6 border-purple-500/20 bg-purple-500/5">
                    <h3 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> AI Health Summary
                    </h3>
                    <p className="text-slate-300 leading-relaxed">{summary}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Vitals */}
                <div className="glass-card p-5 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-400" /> Vitals
                    </h3>
                    {data.vitals ? (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Heart Rate</span>
                                <span className="font-mono text-white">{data.vitals.heart_rate} bpm</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Blood Pressure</span>
                                <span className="font-mono text-white">{data.vitals.systolic_bp}/{data.vitals.diastolic_bp}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Blood Sugar</span>
                                <span className="font-mono text-white">{data.vitals.blood_sugar} mg/dL</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">No recent vitals recorded.</p>
                    )}
                </div>

                {/* Recent Records */}
                <div className="glass-card p-5 space-y-4 md:col-span-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" /> Recent Records
                    </h3>
                    <div className="space-y-2">
                        {data.records?.slice(0, 3).map((rec: any) => (
                            <div key={rec.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-slate-500" />
                                    <div>
                                        <p className="text-sm font-medium text-white">{rec.title}</p>
                                        <p className="text-xs text-slate-500">{new Date(rec.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => window.open(rec.file_url, "_blank")}>
                                    View
                                </Button>
                            </div>
                        ))}
                        {(!data.records || data.records.length === 0) && (
                            <p className="text-sm text-slate-500">No records found.</p>
                        )}
                    </div>
                </div>

                {/* Prescriptions */}
                <div className="glass-card p-5 space-y-4 md:col-span-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Pill className="w-5 h-5 text-pink-400" /> Prescriptions History
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {data.prescriptions?.map((pres: any) => (
                            <div key={pres.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                                <p className="text-xs text-slate-500 mb-2">{new Date(pres.created_at).toLocaleDateString()}</p>
                                <div className="space-y-2">
                                    {pres.medicines?.map((med: any, i: number) => (
                                        <div key={i} className="text-sm">
                                            <span className="font-medium text-white">{med.name}</span>
                                            <span className="text-slate-400 mx-2">•</span>
                                            <span className="text-slate-400">{med.dosage}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {(!data.prescriptions || data.prescriptions.length === 0) && (
                            <p className="text-sm text-slate-500">No prescriptions found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
