"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ShieldCheck, ShieldAlert, FileText, User, LogOut, Filter } from "lucide-react";

interface DoctorRecord {
    id: string;
    user_id?: string; // Add user_id
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

interface Patient {
    id: string;
    full_name: string;
    email: string;
}

export default function DoctorDashboard() {
    const [records, setRecords] = useState<DoctorRecord[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Records
                const recordsRes = await fetch("/api/records");
                if (recordsRes.ok) {
                    const data = await recordsRes.json();
                    setRecords(data.records);
                }

                // Fetch Patients
                const patientsRes = await fetch("/api/doctor/patients");
                if (patientsRes.ok) {
                    const data = await patientsRes.json();
                    setPatients(data.patients);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDownloadCsv = () => {
        window.location.href = "/api/doctor/export-csv";
    };

    const filteredRecords = selectedPatient
        ? records.filter(rec => rec.metadata?.patient_name === patients.find(p => p.id === selectedPatient)?.full_name)
        // Note: Linking by name is fragile. Ideally records should have patient_id. 
        // Since we don't have patient_id on all records yet (only new ones might), we'll try to match by name or if we add patient_id to records.
        // For now, let's assume metadata.patient_name matches.
        : records;

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

            {/* Filters */}
            <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">Filter by Patient:</span>
                <select
                    className="h-9 bg-slate-950 border border-slate-800 rounded-md px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                >
                    <option value="">All Patients</option>
                    {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                </select>
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
                            {filteredRecords.map((rec) => (
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
                                            <button
                                                onClick={() => window.location.href = `/doctor/dashboard/analytics?recordId=${rec.id}`}
                                                className="ml-2 text-xs text-purple-400 hover:text-purple-300 underline"
                                            >
                                                Analyze
                                            </button>
                                            <button
                                                onClick={() => {
                                                    let patient = null;

                                                    // 1. Try exact user_id match (best)
                                                    if (rec.user_id) {
                                                        patient = patients.find(p => p.id === rec.user_id);
                                                    }

                                                    // 2. Try fuzzy name match
                                                    if (!patient && rec.metadata?.patient_name) {
                                                        const recordName = rec.metadata.patient_name.toLowerCase().trim();
                                                        patient = patients.find(p => p.full_name.toLowerCase().trim() === recordName);
                                                    }

                                                    if (patient) {
                                                        window.location.href = `/doctor/dashboard/prescriptions?patientId=${patient.id}`;
                                                    } else {
                                                        alert(`Could not find a registered patient profile for "${rec.metadata?.patient_name || 'Unknown'}".\n\nPlease ensure the patient is registered in the system.`);
                                                    }
                                                }}
                                                className="ml-2 text-xs text-emerald-400 hover:text-emerald-300 underline"
                                            >
                                                Prescribe
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(rec.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {filteredRecords.length === 0 && !loading && (
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
