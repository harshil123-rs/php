"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/custom-select";
import { Calendar as CalendarIcon, Clock, User, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface Doctor {
    id: string;
    full_name: string;
    specialization: string;
}

export default function PatientAppointmentsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [type, setType] = useState("general");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await fetch("/api/doctors");
                const data = await res.json();
                if (data.doctors) {
                    setDoctors(data.doctors);
                }
            } catch (error) {
                console.error("Failed to fetch doctors", error);
            }
        };
        fetchDoctors();
    }, []);

    const handleBook = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    doctor_id: selectedDoctor,
                    date,
                    time,
                    type,
                    notes
                }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
                // Reset form
                setDate("");
                setTime("");
                setNotes("");
            }
        } catch (error) {
            console.error("Booking failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-white">Book Appointment</h1>
                <p className="text-slate-400">Schedule a visit with your doctor.</p>
            </div>

            <div className="glass-card p-6 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm text-slate-400">Select Doctor</label>
                    <Select
                        options={doctors.map(doc => ({
                            value: doc.id,
                            label: `${doc.full_name} ${doc.specialization ? `(${doc.specialization})` : ""}`
                        }))}
                        value={selectedDoctor}
                        onChange={setSelectedDoctor}
                        placeholder="Choose a doctor..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">Date</label>
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">Time</label>
                        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-slate-400">Type</label>
                    <Select
                        options={[
                            { value: "general", label: "General Checkup" },
                            { value: "follow-up", label: "Follow-up" },
                            { value: "emergency", label: "Emergency" }
                        ]}
                        value={type}
                        onChange={setType}
                        placeholder="Select type..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-slate-400">Notes</label>
                    <textarea
                        className="w-full h-24 bg-slate-900/50 border border-slate-800 rounded-md p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                        placeholder="Describe your symptoms or reason for visit..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleBook}
                    disabled={loading || !date || !time || !selectedDoctor}
                >
                    {loading ? "Booking..." : success ? <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Booked!</span> : "Confirm Booking"}
                </Button>
            </div>
        </div>
    );
}
