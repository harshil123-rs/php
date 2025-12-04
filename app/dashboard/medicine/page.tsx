"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, AlertCircle, CheckCircle, ShieldCheck, ShieldAlert, FileText, Info, AlertTriangle, ScanLine, Loader2, CheckCircle2, XCircle, Pill, Calendar } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { motion } from "framer-motion";

interface VerificationResult {
  identity: {
    medicine_name: string;
    brand_name: string;
    generic_name: string;
    manufacturer: string;
    batch_number: string;
  };
  authenticity: {
    status: "Valid" | "Invalid" | "Suspicious";
    reason: string;
    counterfeit_probability: "Low" | "Medium" | "High";
  };
  composition: {
    ingredients: string;
  };
  usage: {
    purpose: string;
    standard_dosage: string;
    age_restrictions: string;
  };
  safety: {
    side_effects: string;
    drug_interactions: string;
    allergy_warning: string;
    pregnancy_safety: string;
  };
  storage: {
    instructions: string;
  };
  expiry: {
    manufacturing_date: string;
    expiry_date: string;
    status: "Safe" | "Near Expiry" | "Expired" | "Unknown";
  };
  summary: {
    verdict: "Safe" | "Unsafe" | "Caution";
    message: string;
  };
}

export default function MedicinePage() {
  const { language } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"upload" | "processing" | "result">("upload");

  const handleFileChange = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles = Array.from(fileList);
    setFiles(newFiles);

    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setPreviews(newPreviews);

    setResult(null);
    setError("");

    // Auto-start verification
    await handleVerify(newFiles);
  };

  const handleVerify = async (selectedFiles: File[]) => {
    setError("");
    setLoading(true);
    setStep("processing");

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append("file", file);
      });
      formData.append("language", language);

      const res = await fetch("/api/medicine/verify", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Verification failed");
      }

      const data = await res.json();
      setResult(data);
      setStep("result");

      // Award points
      try {
        await fetch("/api/achievements/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "medicine" })
        });
      } catch {
        // ignore
      }

    } catch (err: any) {
      setError(err.message || "Failed to verify medicine. Please try again.");
      setStep("upload"); // Go back to upload on error
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setFiles([]);
    setPreviews([]);
    setResult(null);
    setStep("upload");
  };

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Medicine Verification
        </h1>
        <p className="text-slate-400">
          Upload photos of your medicine (front, back, label). Our AI checks authenticity, expiry, and recalls.
        </p>
      </div>

      {/* Step 1: Upload Interface */}
      {step === "upload" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 transition-colors relative group cursor-pointer min-h-[400px]"
        >
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileChange(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <ScanLine className="w-12 h-12 text-slate-400 group-hover:text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-white">Upload Medicine Photos</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Select multiple photos for better accuracy. Drag and drop or click to browse.
            </p>
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </motion.div>
      )}

      {/* Step 2: Processing Interface */}
      {step === "processing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-10 flex flex-col items-center justify-center min-h-[400px] space-y-8"
        >
          <div className="flex flex-wrap justify-center gap-4">
            {previews.map((src, index) => (
              <div key={index} className="relative w-48 h-48 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
                <Image src={src} alt={`Analyzing ${index + 1}`} fill className="object-cover opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-1 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)] absolute animate-scan" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-pulse" />
              </div>
            ))}
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              Analyzing {files.length} Image{files.length > 1 ? 's' : ''}...
            </h3>
            <p className="text-slate-400">Verifying authenticity, checking ingredients, and scanning for recalls.</p>
          </div>
        </motion.div>
      )}

      {/* Step 3: Result Interface */}
      {step === "result" && result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Button variant="ghost" onClick={resetFlow} className="mb-4 text-slate-400 hover:text-white">
            ← Scan Another Medicine
          </Button>

          {/* Summary Card */}
          <div className={`glass-card p-8 border-l-4 ${result.summary.verdict === "Safe" ? "border-l-emerald-500" :
            result.summary.verdict === "Caution" ? "border-l-yellow-500" : "border-l-red-500"
            }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">{result.summary.message}</h2>
                <p className="text-slate-400 text-lg">{result.authenticity.reason}</p>
              </div>
              {result.summary.verdict === "Safe" ? <CheckCircle2 className="w-12 h-12 text-emerald-400 shrink-0" /> :
                result.summary.verdict === "Caution" ? <AlertTriangle className="w-12 h-12 text-yellow-400 shrink-0" /> :
                  <XCircle className="w-12 h-12 text-red-400 shrink-0" />}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Identity & Authenticity */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Pill className="w-5 h-5 text-blue-400" /> Medicine Identity
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Name</p>
                    <p className="text-white font-medium text-lg">{result.identity.medicine_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Generic</p>
                    <p className="text-slate-300">{result.identity.generic_name}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Manufacturer</p>
                  <p className="text-slate-300">{result.identity.manufacturer}</p>
                </div>
                <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Batch No.</p>
                    <p className="text-slate-300 font-mono">{result.identity.batch_number}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.authenticity.status === "Valid" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                    }`}>
                    {result.authenticity.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Expiry & Storage */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Calendar className="w-5 h-5 text-orange-400" /> Expiry & Storage
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Expiry Date</p>
                    <p className="text-xl font-mono font-bold text-white">{result.expiry.expiry_date}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg border ${result.expiry.status === "Expired" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                    result.expiry.status === "Near Expiry" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                      "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}>
                    {result.expiry.status}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Storage Instructions</p>
                  <p className="text-slate-300 mt-1">{result.storage.instructions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Usage & Safety - Full Width */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Info className="w-5 h-5 text-purple-400" /> Usage & Safety
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-slate-500 uppercase">Purpose</p>
                <p className="text-slate-300">{result.usage.purpose}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Standard Dosage</p>
                <p className="text-slate-300">{result.usage.standard_dosage}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Age Restrictions</p>
                <p className="text-slate-300">{result.usage.age_restrictions}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-lg">
                <p className="text-xs text-red-400 uppercase font-bold mb-2">Side Effects</p>
                <p className="text-sm text-slate-300">{result.safety.side_effects}</p>
              </div>
              <div className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-lg">
                <p className="text-xs text-yellow-400 uppercase font-bold mb-2">Allergy Warnings</p>
                <p className="text-sm text-slate-300">{result.safety.allergy_warning}</p>
              </div>
            </div>
          </div>

        </motion.div>
      )}
    </div>
  );
}


