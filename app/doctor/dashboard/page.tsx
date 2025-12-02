"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ShieldCheck, ShieldAlert, FileText, User, LogOut } from "lucide-react";

interface DoctorRecord {
    id: string;
    title: string;
    created_at: string;
    metadata: {
        patient_name?: string;
        age?: string;
        blood_group?: string;
        disease?: string;
        legality?: string;
        [key: string]: any;
    };
}

export default function DoctorDashboard() {
    const [records, setRecords] = useState<DoctorRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                // We can reuse the main records API if RLS allows doctors to see all
                // Or create a specific one. Let's try the main one first, assuming RLS update.
                // Actually, let's use a dedicated endpoint to be sure we get what we want.
                // For now, I'll fetch from the same CSV endpoint logic but as JSON? 
                // No, let's just use the existing records endpoint and see if it works (it won't until RLS is fixed).
                // I'll assume I will fix RLS.
                const res = await fetch("/api/records");
                if (res.ok) {
                    const data = await res.json();
                    setRecords(data.records);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    const handleDownloadCsv = () => {
        window.location.href = "/api/doctor/export-csv";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <User className="w-6 h-6 text-blue-400" />
                        Doctor Portal
                    </h1>
                    <p className="text-slate-400">
                        View and manage patient records with AI-extracted insights.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleDownloadCsv} className="bg-blue-600 hover:bg-blue-700">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button
                        variant="outline"
                        className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={async () => {
                            await fetch("/api/auth/logout", { method: "POST" });
                            window.location.href = "/auth/login";
                        }}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Patient Name</th>
                                <th className="px-6 py-4">Age</th>
                                <th className="px-6 py-4">Disease / Diagnosis</th>
                                <th className="px-6 py-4">Blood Group</th>
                                <th className="px-6 py-4">Legality</th>
                                <th className="px-6 py-4">File</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {records.map((rec) => (
                                <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">
                                        {rec.metadata?.patient_name || "Unknown"}
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        {rec.metadata?.age || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        {rec.metadata?.disease || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        {rec.metadata?.blood_group || "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        {rec.metadata?.legality === "Valid" ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <ShieldCheck className="w-3 h-3" /> Valid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                                <ShieldAlert className="w-3 h-3" /> {rec.metadata?.legality || "Unverified"}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-500" />
                                            {rec.title}
                                            <button
                                                onClick={() => window.open((rec as any).file_url || (rec as any).url, '_blank')}
                                                className="ml-2 text-xs text-blue-400 hover:text-blue-300 underline"
                                            >
                                                Preview
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(rec.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {records.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
