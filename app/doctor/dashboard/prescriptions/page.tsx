"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, FileDown, Sparkles, Loader2, Save, User, FileText, ShieldCheck } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Patient {
  id: string;
  full_name: string;
  email: string;
}

interface Record {
  id: string;
  title: string;
  created_at: string;
}

export default function PrescriptionsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRecord, setSelectedRecord] = useState("");

  const [symptoms, setSymptoms] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch Patients on Load
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/doctor/patients");
        const data = await res.json();
        if (data.patients) {
          setPatients(data.patients);

          // Check for URL param
          const params = new URLSearchParams(window.location.search);
          const patientId = params.get("patientId");
          console.log("URL Patient ID:", patientId);
          console.log("Available Patients:", data.patients);

          if (patientId) {
            const found = data.patients.find((p: any) => p.id === patientId);
            console.log("Found Patient:", found);
            if (found) {
              setSelectedPatient(patientId);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch patients", error);
      }
    };
    fetchPatients();
  }, []);



  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleAISuggest = async () => {
    if (!symptoms) return;
    setLoadingAI(true);
    try {
      const res = await fetch("/api/doctor/prescriptions/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });
      const data = await res.json();
      if (data.medicines) {
        setMedicines([...medicines, ...data.medicines]);
      }
    } catch (error) {
      console.error("AI Suggestion Failed", error);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPatient || medicines.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/doctor/prescriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedPatient,
          record_id: null,
          medicines,
          instructions: symptoms // Using symptoms as general instructions/notes for now
        }),
      });

      if (res.ok) {
        alert("Prescription saved successfully!");
        // Reset form or redirect
        setMedicines([]);
        setSymptoms("");
        setSelectedRecord("");
      } else {
        alert("Failed to save prescription");
      }
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const patientName = patients.find(p => p.id === selectedPatient)?.full_name || "Unknown";

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Dr. HealthVault", 15, 20);
    doc.setFontSize(10);
    doc.text("General Physician | MBBS, MD", 15, 25);
    doc.text("123 Health St, Wellness City", 15, 30);

    doc.line(15, 35, 195, 35);

    // Patient Info
    doc.setFontSize(12);
    doc.text(`Patient Name: ${patientName}`, 15, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 45);
    if (symptoms) {
      doc.text(`Diagnosis/Symptoms: ${symptoms}`, 15, 52);
    }

    // Medicines Table
    const tableData = medicines.map(m => [m.name, m.dosage, m.frequency, m.duration, m.instructions]);

    autoTable(doc, {
      startY: 60,
      head: [['Medicine', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.text("Doctor's Signature", 150, finalY + 30);
    doc.line(150, finalY + 28, 190, finalY + 28);

    doc.save(`Prescription_${patientName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Smart Prescription</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-400">Create AI-assisted prescriptions.</p>
            {selectedPatient ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <User className="w-3 h-3 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">
                  Patient: {patients.find(p => p.id === selectedPatient)?.full_name}
                </span>
              </div>
            ) : (
              <a href="/doctor/dashboard" className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-colors">
                <ShieldCheck className="w-3 h-3 text-red-400" />
                <span className="text-xs font-medium text-red-400">
                  No Patient Selected (Click to Select)
                </span>
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generatePDF} disabled={medicines.length === 0 || !selectedPatient}>
            <FileDown className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSave}
            disabled={saving || medicines.length === 0 || !selectedPatient}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Record
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">


          <div className="glass-card p-5 space-y-4 border-purple-500/20">
            <div className="flex items-center gap-2 text-purple-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold text-lg">AI Assistant</h3>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Symptoms / Diagnosis</label>
              <textarea
                className="w-full h-24 bg-slate-950/50 border border-slate-800 rounded-md p-3 text-sm focus:outline-none focus:border-purple-500/50"
                placeholder="e.g. High fever, dry cough, headache..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={handleAISuggest}
              disabled={loadingAI || !symptoms}
            >
              {loadingAI ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Suggest Medicines
            </Button>
          </div>
        </div>

        {/* Prescription Editor */}
        <div className="md:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Rx / Medicines</h3>
            <Button size="sm" variant="secondary" onClick={addMedicine}>
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </div>

          <div className="space-y-4">
            {medicines.map((med, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-start bg-slate-900/30 p-3 rounded-lg border border-slate-800/50 group hover:border-slate-700 transition-colors">
                <div className="col-span-4 space-y-1">
                  <Input
                    placeholder="Medicine Name"
                    className="h-8 text-sm bg-transparent border-0 border-b border-slate-700 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500"
                    value={med.name}
                    onChange={(e) => updateMedicine(index, "name", e.target.value)}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Input
                    placeholder="Dosage"
                    className="h-8 text-sm bg-transparent border-0 border-b border-slate-700 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500"
                    value={med.dosage}
                    onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Input
                    placeholder="Freq"
                    className="h-8 text-sm bg-transparent border-0 border-b border-slate-700 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500"
                    value={med.frequency}
                    onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                  />
                </div>
                <div className="col-span-3 space-y-1">
                  <Input
                    placeholder="Instructions"
                    className="h-8 text-sm bg-transparent border-0 border-b border-slate-700 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500"
                    value={med.instructions}
                    onChange={(e) => updateMedicine(index, "instructions", e.target.value)}
                  />
                </div>
                <div className="col-span-1 flex justify-end pt-1">
                  <button
                    onClick={() => removeMedicine(index)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {medicines.length === 0 && (
              <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                <p>No medicines added yet.</p>
                <p className="text-xs mt-1">Use AI Suggest or add manually.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
