"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertTriangle, ShieldCheck, ScanLine, XCircle, Info, Thermometer, Calendar, Pill } from "lucide-react";
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
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError("");
  };

  const handleVerify = async () => {
    if (!file) {
      setError("Please select a photo of the medicine first");
      return;
    }
    setError("");
    setLoading(true);
    setScanning(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

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
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  const getStatusColor = (verdict: string) => {
    switch (verdict) {
      case "Safe": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "Caution": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "Unsafe": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Medicine Verification
        </h1>
        <p className="text-slate-400">
          Upload a photo of any pill bottle or blister pack. Our AI checks authenticity, expiry, and recalls.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="glass-card p-6 space-y-6 h-fit">
          <div>
            <h3 className="font-semibold text-lg mb-2">Upload Photo</h3>
            <p className="text-sm text-slate-400 mb-4">
              Ensure the label, batch number, and expiry date are visible.
            </p>

            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer relative group">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <ScanLine className="w-6 h-6 text-slate-400 group-hover:text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-slate-300">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading || !file}
            className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Verify Authenticity
              </span>
            )}
          </Button>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Preview Area */}
          <div className="glass-card p-2 min-h-[300px] flex items-center justify-center relative overflow-hidden">
            {preview ? (
              <>
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain rounded-lg"
                />
                {scanning && (
                  <motion.div
                    className="absolute inset-0 bg-emerald-500/10 z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-full h-1 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      style={{ position: "absolute" }}
                    />
                  </motion.div>
                )}
              </>
            ) : (
              <div className="text-center text-slate-500">
                <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Preview will appear here</p>
              </div>
            )}
          </div>

          {/* Results Overlay */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Summary Card */}
              <div className={`glass-card p-6 border-l-4 ${result.summary.verdict === "Safe" ? "border-l-emerald-500" :
                  result.summary.verdict === "Caution" ? "border-l-yellow-500" : "border-l-red-500"
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-white">{result.summary.message}</h2>
                  {result.summary.verdict === "Safe" ? <CheckCircle2 className="w-8 h-8 text-emerald-400" /> :
                    result.summary.verdict === "Caution" ? <AlertTriangle className="w-8 h-8 text-yellow-400" /> :
                      <XCircle className="w-8 h-8 text-red-400" />}
                </div>
                <p className="text-sm text-slate-400">{result.authenticity.reason}</p>
              </div>

              {/* Identity & Authenticity */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-400" /> Medicine Identity
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Name</p>
                    <p className="text-white font-medium">{result.identity.medicine_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Generic</p>
                    <p className="text-slate-300">{result.identity.generic_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Manufacturer</p>
                    <p className="text-slate-300">{result.identity.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Batch No.</p>
                    <p className="text-slate-300 font-mono">{result.identity.batch_number}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Authenticity Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.authenticity.status === "Valid" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      }`}>
                      {result.authenticity.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Usage & Safety */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-purple-400" /> Usage & Safety
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Purpose</p>
                    <p className="text-slate-300 text-sm">{result.usage.purpose}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Dosage</p>
                      <p className="text-slate-300 text-sm">{result.usage.standard_dosage}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Age Limit</p>
                      <p className="text-slate-300 text-sm">{result.usage.age_restrictions}</p>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-red-400 uppercase mb-1 font-bold">Safety Warnings</p>
                    <p className="text-xs text-slate-300">Side Effects: {result.safety.side_effects}</p>
                    <p className="text-xs text-slate-300 mt-1">Allergy: {result.safety.allergy_warning}</p>
                  </div>
                </div>
              </div>

              {/* Expiry & Storage */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-400" /> Expiry & Storage
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Expiry Date</p>
                    <p className={`font-mono font-bold ${result.expiry.status === "Expired" ? "text-red-400" :
                        result.expiry.status === "Near Expiry" ? "text-yellow-400" : "text-emerald-400"
                      }`}>
                      {result.expiry.expiry_date}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Status: {result.expiry.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Storage</p>
                    <p className="text-sm text-slate-300">{result.storage.instructions}</p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}


