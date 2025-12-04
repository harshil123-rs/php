"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDown, FileSignature, CheckCircle } from "lucide-react";
import jsPDF from "jspdf";

export default function CertificatesPage() {
    const [patientName, setPatientName] = useState("");
    const [type, setType] = useState("sick_leave");
    const [reason, setReason] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);

    const generateCertificate = () => {
        setLoading(true);
        const doc = new jsPDF();

        // Header
        doc.setFontSize(24);
        doc.setTextColor(40, 40, 40);
        doc.text("MEDICAL CERTIFICATE", 105, 30, { align: "center" });

        doc.setFontSize(12);
        doc.text("Dr. HealthVault", 105, 40, { align: "center" });
        doc.text("General Physician | MBBS, MD", 105, 45, { align: "center" });

        doc.line(20, 55, 190, 55);

        // Content
        doc.setFontSize(14);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 65);

        doc.text("TO WHOM IT MAY CONCERN", 105, 80, { align: "center" });

        let bodyText = "";
        if (type === "sick_leave") {
            bodyText = `This is to certify that Mr./Ms. ${patientName} is suffering from ${reason} and is under my treatment. I have advised rest for a period of ${calculateDays(fromDate, toDate)} days from ${fromDate} to ${toDate}.`;
        } else {
            bodyText = `This is to certify that I have examined Mr./Ms. ${patientName} and found him/her medically fit to resume duties/classes from ${fromDate}.`;
        }

        const splitText = doc.splitTextToSize(bodyText, 170);
        doc.text(splitText, 20, 100);

        if (remarks) {
            doc.text(`Remarks: ${remarks}`, 20, 140);
        }

        // Footer
        doc.text("Signature", 150, 180);
        doc.line(140, 178, 180, 178);
        doc.setFontSize(10);
        doc.text("(Dr. HealthVault)", 150, 185);

        doc.save(`Certificate_${type}_${patientName.replace(/\s+/g, '_')}.pdf`);
        setLoading(false);
    };

    const calculateDays = (start: string, end: string) => {
        if (!start || !end) return 0;
        const diff = new Date(end).getTime() - new Date(start).getTime();
        return Math.ceil(diff / (1000 * 3600 * 24)) + 1;
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-white">Medical Certificates</h1>
                <p className="text-slate-400">Generate official medical documents instantly.</p>
            </div>

            <div className="glass-card p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">Certificate Type</label>
                        <select
                            className="w-full h-10 bg-slate-900/50 border border-slate-800 rounded-md px-3 text-sm text-white"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="sick_leave">Sick Leave Certificate</option>
                            <option value="fitness">Fitness Certificate</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">Patient Name</label>
                        <Input
                            placeholder="Full Name"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                        />
                    </div>
                </div>

                {type === "sick_leave" && (
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">Diagnosis / Reason</label>
                        <Input
                            placeholder="e.g. Viral Fever"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">From Date</label>
                        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">To Date</label>
                        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-slate-400">Remarks (Optional)</label>
                    <textarea
                        className="w-full h-24 bg-slate-900/50 border border-slate-800 rounded-md p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                        placeholder="Additional notes..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                </div>

                <Button
                    className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700"
                    onClick={generateCertificate}
                    disabled={loading || !patientName || !fromDate || !toDate}
                >
                    <FileSignature className="w-5 h-5 mr-2" />
                    Generate & Download PDF
                </Button>
            </div>
        </div>
    );
}
