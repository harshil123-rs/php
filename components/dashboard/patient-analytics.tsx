
"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Activity, Heart, Scale, Thermometer } from "lucide-react";
import { format } from "date-fns";

export default function PatientAnalytics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/patient/analytics");
                const json = await res.json();
                if (json.vitals) {
                    // Format dates for charts
                    const formattedVitals = json.vitals.map((v: any) => ({
                        ...v,
                        date: format(new Date(v.recorded_at), "MMM d"),
                        fullDate: format(new Date(v.recorded_at), "MMM d, yyyy HH:mm"),
                    }));
                    setData({ ...json, vitals: formattedVitals });
                }
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-400 animate-pulse">Loading health data...</div>;
    }

    if (!data || !data.vitals || data.vitals.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-white">No Health Data Yet</h3>
                <p className="text-slate-400 mt-2">Your vitals history will appear here once recorded.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 border border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-medium uppercase">Avg Heart Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{data.summary.avg_heart_rate} <span className="text-sm font-normal text-slate-500">bpm</span></div>
                </div>
                <div className="glass-card p-4 border border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-medium uppercase">Avg BP</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{data.summary.avg_bp} <span className="text-sm font-normal text-slate-500">mmHg</span></div>
                </div>
                <div className="glass-card p-4 border border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Scale className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-medium uppercase">Records</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{data.summary.total_records}</div>
                </div>
                <div className="glass-card p-4 border border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-medium uppercase">Latest Temp</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{data.vitals[data.vitals.length - 1]?.temperature || '--'} <span className="text-sm font-normal text-slate-500">°C</span></div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Heart Rate & BP Chart */}
                <div className="glass-card p-6 border border-slate-800 bg-slate-900/50">
                    <h3 className="text-lg font-medium text-white mb-6">Heart Rate & Blood Pressure</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.vitals}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                    labelStyle={{ color: '#94a3b8' }}
                                />
                                <Line type="monotone" dataKey="heart_rate" name="Heart Rate" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="systolic_bp" name="Systolic BP" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
                                <Line type="monotone" dataKey="diastolic_bp" name="Diastolic BP" stroke="#60a5fa" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: '#60a5fa' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Blood Sugar & Weight */}
                <div className="glass-card p-6 border border-slate-800 bg-slate-900/50">
                    <h3 className="text-lg font-medium text-white mb-6">Blood Sugar & Weight</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.vitals}>
                                <defs>
                                    <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                    labelStyle={{ color: '#94a3b8' }}
                                />
                                <Area yAxisId="left" type="monotone" dataKey="blood_sugar" name="Blood Sugar" stroke="#10b981" fillOpacity={1} fill="url(#colorSugar)" />
                                <Line yAxisId="right" type="monotone" dataKey="weight" name="Weight (kg)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
