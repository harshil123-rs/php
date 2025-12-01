"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RecordItem {
  id: string;
  title: string;
  file_type: string;
  file_url: string;
  created_at: string;
}

const recordTypes = ["Lab Report", "Prescription", "Imaging", "Insurance", "Other"];

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [recordType, setRecordType] = useState(recordTypes[0]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const loadRecords = useCallback(async () => {
    const res = await fetch("/api/records", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setRecords(data.records);
    }
  }, []);

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

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

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

      const res = await fetch("/api/records/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }

      setProgress(90);
      await loadRecords();
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
      setRecords((prev) => prev.filter((record) => record.id !== id));
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
    </div>
  );
}


