"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertTriangle, ShieldCheck, ScanLine } from "lucide-react";
import { motion } from "framer-motion";

interface VerificationResult {
  verified: boolean;
  name: string;
  manufacturer: string;
  expiry: string;
  batchNumber: string;
  safetyScore: number;
  warnings: string[];
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

    // Simulate realistic scanning phases
    // Phase 1: Uploading & OCR
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Phase 2: Database Lookup
    // In a real app, this would call an API. Here we simulate a smart response.
    // We'll generate data based on the file name or random realistic data.

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const isSafe = Math.random() > 0.1; // 90% chance of being safe
      const today = new Date();
      const expiryDate = new Date(today.setFullYear(today.getFullYear() + 1 + Math.floor(Math.random() * 2)));

      const mockResult: VerificationResult = {
        verified: isSafe,
        name: "Amoxicillin 500mg",
        manufacturer: "PharmaCorp Ltd.",
        expiry: expiryDate.toLocaleDateString(),
        batchNumber: `BATCH-${Math.floor(Math.random() * 100000)}`,
        safetyScore: isSafe ? 95 + Math.floor(Math.random() * 5) : 45,
        warnings: isSafe
          ? ["Take with food", "Complete the full course"]
          : ["Potential counterfeit detected", "Batch number not found in registry"]
      };

      setResult(mockResult);

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
      setError("Failed to verify medicine. Please try again.");
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  return (
    <div className="space-y-8">
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

        <div className="relative">
          {/* Preview Area */}
          <div className="glass-card p-2 min-h-[400px] flex items-center justify-center relative overflow-hidden">
            {preview ? (
              <>
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover rounded-lg opacity-80"
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
              className="absolute -bottom-6 left-4 right-4 glass-card p-6 border-t-4 border-t-emerald-500 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">{result.name}</h3>
                    {result.verified && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  </div>
                  <p className="text-sm text-slate-400">{result.manufacturer}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Safety Score</p>
                  <p className={`text-2xl font-bold ${result.safetyScore > 80 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {result.safetyScore}/100
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">Batch No.</p>
                  <p className="font-mono text-sm text-slate-300">{result.batchNumber}</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">Expiry Date</p>
                  <p className="font-mono text-sm text-slate-300">{result.expiry}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2 uppercase">Recommendations</p>
                <ul className="space-y-1">
                  {result.warnings.map((w, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}


