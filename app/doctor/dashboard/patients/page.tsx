"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Search, FileText, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Patient {
    id: string;
    full_name: string;
    email: string;
    created_at: string;
}

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch("/api/doctor/patients");
                const data = await res.json();
                if (data.patients) {
                    setPatients(data.patients);
                }
            } catch (error) {
                console.error("Failed to fetch patients", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(p =>
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Patients</h1>
                    <p className="text-slate-400">View patient history and records.</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search patients..."
                        className="pl-9 bg-slate-900/50 border-slate-800"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.map((patient) => (
                    <div key={patient.id} className="glass-card p-5 hover:border-emerald-500/30 transition-colors group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                <User className="w-6 h-6 text-slate-400 group-hover:text-emerald-400" />
                            </div>
                            <Link href={`/doctor/dashboard/patients/${patient.id}`}>
                                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                                    View Details <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-white">{patient.full_name || "Unknown"}</h3>
                            <p className="text-sm text-slate-400">{patient.email}</p>
                            <p className="text-xs text-slate-500 mt-2">
                                Joined: {new Date(patient.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}

                {filteredPatients.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        No patients found.
                    </div>
                )}
            </div>
        </div>
    );
}
