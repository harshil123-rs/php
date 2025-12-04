"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Profile {
  name: string;
  email: string;
  profile: {
    age: number | null;
    bloodGroup: string;
    allergies: string;
    conditions: string;
    avatarKey?: string;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    bloodGroup: "",
    allergies: "",
    conditions: "",
    avatarKey: ""
  });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadProfile = useCallback(async () => {
    const res = await fetch("/api/profile", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setProfile(data.user);
      setForm({
        name: data.user.name || "",
        age: data.user.profile?.age?.toString() || "",
        bloodGroup: data.user.profile?.bloodGroup || "",
        allergies: data.user.profile?.allergies || "",
        conditions: data.user.profile?.conditions || "",
        avatarKey: data.user.profile?.avatarKey || ""
      });
      if (data.user.profile?.avatarKey) {
        setAvatarUrl(data.user.profile.avatarKey);
      }
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);



  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          age: form.age ? Number(form.age) : null,
          bloodGroup: form.bloodGroup,
          allergies: form.allergies,
          conditions: form.conditions,
          avatarKey: form.avatarKey
        })
      });
      if (!res.ok) {
        throw new Error("Update failed");
      }
      setMessage("Profile updated");
      await loadProfile();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="page-title">Profile</p>
        <p className="page-subtitle">Manage personal details and emergency info.</p>
      </div>

      <div className="glass-card p-6 flex flex-col md:flex-row gap-6">

        <div className="flex-1 grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted">Full name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-muted">Email</label>
            <Input value={profile?.email || ""} disabled />
          </div>
          <div>
            <label className="text-sm text-muted">Age</label>
            <Input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-muted">Blood group</label>
            <Input
              value={form.bloodGroup}
              onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
              placeholder="O+, A-, ..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-muted">Allergies</label>
            <Input
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              placeholder="Peanuts, etc."
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-muted">Medical conditions</label>
            <Input
              value={form.conditions}
              onChange={(e) => setForm({ ...form, conditions: e.target.value })}
              placeholder="Hypertension, Diabetes..."
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={loading}>
          Save changes
        </Button>
        {message && <p className="text-sm text-muted">{message}</p>}
      </div>
    </div>
  );
}
