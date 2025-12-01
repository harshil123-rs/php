"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const emergencyContacts = [
  { name: "Primary Care", phone: "+1 555-202-1111" },
  { name: "Emergency Contact", phone: "+1 555-808-9900" },
  { name: "Nearest Hospital", phone: "+1 555-444-2211" }
];

const nearbyHospitals = [
  {
    name: "CityCare Trauma Center",
    distance: "1.2 km",
    address: "Ring Road, Sector 4",
    travelTime: "5 min drive"
  },
  {
    name: "Green Valley Emergency Wing",
    distance: "2.0 km",
    address: "Lake View Avenue",
    travelTime: "8 min drive"
  },
  {
    name: "Metro Heart Institute",
    distance: "3.1 km",
    address: "Metro Station Complex",
    travelTime: "12 min drive"
  }
];

export default function EmergencyPage() {
  const [sos, setSos] = useState(false);
  const [medicalInfo, setMedicalInfo] = useState({
    bloodGroup: "N/A",
    allergies: "N/A",
    conditions: "N/A"
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setMedicalInfo({
            bloodGroup: data.user.profile?.bloodGroup || "N/A",
            allergies: data.user.profile?.allergies || "N/A",
            conditions: data.user.profile?.conditions || "N/A"
          });
        }
      } catch {
        // ignore in demo mode
      }
    };
    loadProfile();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="page-title">Emergency Access</p>
        <p className="page-subtitle">
          Demo view showing SOS, your critical info, and nearby hospitals (mock data).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-card p-6 text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-muted">
            SOS Mode
          </p>
          <p className="text-2xl font-semibold">
            {sos ? "Broadcasting emergency info" : "Tap when immediate help is needed"}
          </p>
          <Button
            className="w-full h-16 text-2xl bg-red-600 hover:bg-red-500"
            onClick={() => setSos((prev) => !prev)}
          >
            {sos ? "Deactivate SOS" : "SOS"}
          </Button>
          {sos && (
            <p className="text-sm text-red-300">
              (Demo) SOS triggered – contacts would be notified with your location.
            </p>
          )}
        </div>

        <div className="glass-card p-6 space-y-3">
          <p className="font-semibold">Critical medical info</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted text-xs uppercase tracking-[0.3em]">Blood Group</p>
              <p className="text-lg font-semibold mt-1">{medicalInfo.bloodGroup}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-[0.3em]">Allergies</p>
              <p className="mt-1">{medicalInfo.allergies || "None listed"}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-[0.3em]">Conditions</p>
              <p className="mt-1">{medicalInfo.conditions || "None listed"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-5 grid md:grid-cols-2 gap-6">
        <div>
          <p className="font-semibold mb-3">Emergency contacts</p>
          <div className="space-y-3">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.name}
                className="flex items-center justify-between border border-card-border/60 rounded-lg px-3 py-2"
              >
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-muted">{contact.phone}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => (window.location.href = `tel:${contact.phone}`)}
                >
                  Call
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Fake mini-map + hospital list */}
        <div>
          <p className="font-semibold mb-3">Nearest hospitals (demo)</p>
          <div className="rounded-xl overflow-hidden border border-card-border/60 bg-slate-950">
            <div className="relative h-64 w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.9)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.9)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs text-muted">You</span>
              </div>
              {nearbyHospitals.map((h, idx) => (
                <div
                  key={h.name}
                  className="absolute flex flex-col items-center text-[10px]"
                  style={{
                    left: `${25 + idx * 20}%`,
                    top: `${35 + (idx % 2) * 20}%`
                  }}
                >
                  <div className="h-4 w-4 rounded-full bg-red-400 border border-red-200 shadow-lg" />
                  <span className="mt-1 px-1.5 py-0.5 rounded-full bg-slate-900/80 whitespace-nowrap">
                    🏥 {h.name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
            <div className="divide-y divide-card-border/60">
              {nearbyHospitals.map((h) => (
                <div key={h.name} className="p-3 text-sm flex justify-between items-center">
                  <div>
                    <p className="font-medium">{h.name}</p>
                    <p className="text-xs text-muted">{h.address}</p>
                  </div>
                  <div className="text-right text-xs text-muted">
                    <p>{h.distance}</p>
                    <p>{h.travelTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
