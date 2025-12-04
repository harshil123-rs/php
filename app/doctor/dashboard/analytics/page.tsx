"use client";

import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { Users, Calendar, Activity, Star, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [recordAnalysis, setRecordAnalysis] = useState<any>(null);
    const [viewMode, setViewMode] = useState<"practice" | "record">("practice");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const recordId = params.get("recordId");

                if (recordId) {
                    setViewMode("record");
                    const res = await fetch(`/api/doctor/analytics?record_id=${recordId}`);
                    const json = await res.json();
                    setRecordAnalysis(json.analysis);
                } else {
                    setViewMode("practice");
                    const res = await fetch("/api/doctor/analytics");
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
    );

    if (viewMode === "record" && recordAnalysis) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Activity className="w-6 h-6 text-emerald-400" />
                            Record Analysis
                        </h1>
                        <p className="text-slate-400">Real-time insights for <span className="text-white font-medium">{recordAnalysis.patient_name}</span></p>
                    </div>
                    <a href="/doctor/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
                        &larr; Back to Overview
                    </a>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recordAnalysis.metrics.map((metric: any, i: number) => (
                        <div key={i} className="glass-card p-4 border-t-4 border-t-blue-500/50">
                            <p className="text-xs text-slate-400 uppercase">{metric.label}</p>
                            <div className="flex items-end gap-2 mt-1">
                                <span className="text-2xl font-bold text-white">{metric.value}</span>
                                <span className="text-xs text-slate-500 mb-1">{metric.unit}</span>
                            </div>
                            <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {metric.status}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* AI Summary */}
                    <div className="md:col-span-2 glass-card p-6 space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-purple-400">
                            <Star className="w-5 h-5" /> AI Health Summary
                        </h3>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 text-slate-300 text-sm leading-relaxed">
                            {recordAnalysis.ai_summary}
                        </div>

                        <h4 className="font-medium text-white mt-4">Recommendations</h4>
                        <ul className="space-y-2">
                            {recordAnalysis.recommendations.map((rec: string, i: number) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Risk & Actions */}
                    <div className="glass-card p-6 space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Risk Assessment</h3>
                            <div className={`p-4 rounded-lg border ${recordAnalysis.risk_assessment.includes("Low") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-orange-500/10 border-orange-500/20 text-orange-400"}`}>
                                <div className="flex items-center gap-2 font-bold">
                                    <Activity className="w-5 h-5" />
                                    {recordAnalysis.risk_assessment}
                                </div>
                                <p className="text-xs mt-2 opacity-80">Based on analysis of vitals and history.</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-2">Actions</h3>
                            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium text-white transition-colors mb-2">
                                Generate Full Report
                            </button>
                            <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-sm font-medium text-slate-300 transition-colors">
                                Share with Specialist
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Practice Analytics</h1>
                <p className="text-slate-400">Insights into your practice performance and patient health.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-5 space-y-2 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-400 text-sm uppercase">Total Patients</p>
                        <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-white">{data?.stats.total_patients}</p>
                </div>
                <div className="glass-card p-5 space-y-2 border-l-4 border-l-purple-500">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-400 text-sm uppercase">Appointments</p>
                        <Calendar className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold text-white">{data?.stats.total_appointments}</p>
                </div>
                <div className="glass-card p-5 space-y-2 border-l-4 border-l-orange-500">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-400 text-sm uppercase">Pending Requests</p>
                        <Activity className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold text-white">{data?.stats.pending_appointments}</p>
                </div>
                <div className="glass-card p-5 space-y-2 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-400 text-sm uppercase">Patient Rating</p>
                        <Star className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-white">{data?.stats.avg_rating} / 5.0</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" /> Patient Visits Trend
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.trends}>
                                <defs>
                                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="date" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="patients" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPatients)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-red-400" /> Emergency Cases
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data?.trends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="date" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="emergency" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
