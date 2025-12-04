"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle, XCircle, User, FileText } from "lucide-react";
import { format } from "date-fns";

interface Appointment {
    id: string;
    patient: { full_name: string; email: string };
    date: string;
    time: string;
    type: string;
    status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
    notes: string;
}

export default function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            const res = await fetch("/api/appointments");
            const data = await res.json();
            if (data.appointments) {
                setAppointments(data.appointments);
            }
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/appointments/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                setAppointments((prev) =>
                    prev.map((appt) => (appt.id === id ? { ...appt, status: status as any } : appt))
                );
            }
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            case "rejected": return "text-red-400 bg-red-500/10 border-red-500/20";
            case "pending": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
            default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Appointments</h1>
                <p className="text-slate-400">Manage your patient bookings and schedule.</p>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Notes</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {appointments.map((appt) => (
                                <tr key={appt.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                                <User className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{appt.patient?.full_name || "Unknown"}</p>
                                                <p className="text-xs text-slate-500">{appt.patient?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-slate-500" />
                                                {format(new Date(appt.date), "MMM d, yyyy")}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3 text-slate-500" />
                                                {appt.time}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 capitalize">{appt.type}</td>
                                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{appt.notes || "-"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appt.status)}`}>
                                            {appt.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {appt.status === "pending" && (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    onClick={() => updateStatus(appt.id, "approved")}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 border-red-500/20 text-red-400 hover:bg-red-500/10"
                                                    onClick={() => updateStatus(appt.id, "rejected")}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" /> Reject
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {appointments.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No appointments found.
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
