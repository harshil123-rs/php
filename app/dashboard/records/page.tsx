"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, ShieldCheck, ShieldAlert, Activity, User, Calendar } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

interface RecordItem {
  id: string;
  title: string;
  file_type: string;
  file_url: string;
  created_at: string;
  metadata?: {
    patient_name?: string;
    age?: string;
    blood_group?: string;
    disease?: string;
    legality?: string;
    [key: string]: any;
  };
}

const recordTypes = ["Lab Report", "Prescription", "Imaging", "Insurance", "Other"];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RecordsPage() {
  const { language } = useLanguage();
  const { data, error: swrError, isLoading } = useSWR("/api/records", fetcher);
  const records: RecordItem[] = data?.records || [];

  const [file, setFile] = useState<File | null>(null);
  const [recordType, setRecordType] = useState(recordTypes[0]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);

  const awardPoints = async (action: "upload") => {
    try {
      await fetch("/api/achievements/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
    } catch {
      // ignore gamification errors
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Select a file first");
      return;
    }
    setError("");
    setUploading(true);
    setProgress(10);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", recordType);
      formData.append("language", language);

      const res = await fetch("/api/records/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }

      setProgress(90);
      await mutate("/api/records");
      await awardPoints("upload");
      setFile(null);
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    const res = await fetch(`/api/records/${id}`, { method: "DELETE" });
    if (res.ok) {
      mutate("/api/records");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="page-title">Health Records</p>
        <p className="page-subtitle">
          Upload and securely store PDFs, images, and lab reports.
        </p>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-muted">File</label>
            <Input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div>
            <label className="text-sm text-muted">Record type</label>
            <select
              className="w-full h-10 rounded-lg border border-card-border bg-slate-900/60 px-3 text-sm"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
            >
              {recordTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={handleUpload} loading={uploading}>
              Upload to vault
            </Button>
          </div>
        </div>
        {progress > 0 && (
          <div className="w-full bg-slate-900 rounded-full h-2">
            <div
              className="bg-emerald-400 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold">Stored files</p>
            <p className="text-sm text-muted">Preview, download or delete.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted border-b border-card-border/60">
              <tr>
                <th className="py-2">Filename</th>
                <th className="py-2">Type</th>
                <th className="py-2">Uploaded</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-card-border/40">
                  <td className="py-3">{record.title}</td>
                  <td className="py-3 text-muted">{record.file_type}</td>
                  <td className="py-3 text-muted">
                    {new Date(record.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRecord(record)}
                    >
                      Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(record.file_url, "_blank")}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-muted" colSpan={4}>
                    No files yet. Upload your first record above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedRecord} onOpenChange={(open: boolean) => !open && setSelectedRecord(null)}>
        <DialogContent className="sm:max-w-[500px] bg-slate-950 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              AI Analysis
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Extracted details from {selectedRecord?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord?.metadata ? (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1">
                    <User className="w-3 h-3" /> Patient
                  </label>
                  <p className="text-sm font-medium">{selectedRecord.metadata.patient_name || "Unknown"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Age
                  </label>
                  <p className="text-sm font-medium">{selectedRecord.metadata.age || "-"}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Disease / Diagnosis
                </label>
                <p className="text-sm font-medium bg-slate-900/50 p-2 rounded-md border border-slate-800">
                  {selectedRecord.metadata.disease || "No diagnosis found"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1">
                  Legality Check
                </label>
                <div className="flex items-center gap-2">
                  {selectedRecord.metadata.legality === "Valid" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" /> Valid Document
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                      <ShieldAlert className="w-3.5 h-3.5" /> {selectedRecord.metadata.legality || "Unverified"}
                    </span>
                  )}
                </div>
                {selectedRecord.metadata.legality !== "Valid" && (
                  <p className="text-xs text-slate-500 mt-1">
                    Note: Valid documents must have a doctor's signature and official letterhead.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              No AI analysis data available for this record.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


