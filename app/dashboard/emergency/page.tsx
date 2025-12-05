"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Map from "@/components/ui/map";
import CallOverlay from "@/components/ui/call-overlay";

export default function EmergencyPage() {
  const [sos, setSos] = useState(false);
  const [medicalInfo, setMedicalInfo] = useState({
    bloodGroup: "N/A",
    allergies: "N/A",
    conditions: "N/A"
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: "Primary Care", phone: "+1 555-202-1111" }, // Fallback
    { name: "Emergency Contact", phone: "+1 555-808-9900" }, // Fallback
    { name: "Nearest Hospital", phone: "911" }
  ]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const p = data.user.profile;

          setMedicalInfo({
            bloodGroup: p.bloodGroup || "N/A",
            allergies: p.allergies || "None known",
            conditions: p.conditions || "None declared"
          });

          // Update contacts if available
          if (p.emergencyContactName || p.emergencyContactPhone) {
            setEmergencyContacts([
              { name: p.emergencyContactName || "Primary Contact", phone: p.emergencyContactPhone || "N/A" },
              { name: "Ambulance / Emergency", phone: "911" },
              { name: "Nearest Hospital", phone: "Locating..." } // Will be updated by map logic if possible, or static
            ]);
          }
        }
      } catch {
        // ignore in demo mode
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      () => {
        // Fallback
        setLocation({ lat: 40.7128, lng: -74.0060 });
      }
    );
  }, []);

  useEffect(() => {
    if (!location) return;

    const fetchHospitals = async () => {
      try {
        const token = process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN;
        if (!token) return;

        const url = `https://us1.locationiq.com/v1/nearby.php?key=${token}&lat=${location.lat}&lon=${location.lng}&tag=hospital&radius=5000&format=json`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch hospitals");

        const data = await res.json();

        const mappedHospitals = data.slice(0, 3).map((h: any) => ({
          name: h.name,
          distance: `${(h.distance / 1000).toFixed(1)} km`,
          address: h.display_name.split(",")[0] + ", " + h.display_name.split(",")[1],
          travelTime: `${Math.ceil((h.distance / 1000) * 3)} min drive`,
          lat: parseFloat(h.lat),
          lng: parseFloat(h.lon)
        }));

        setHospitals(mappedHospitals);
      } catch (err) {
        console.error(err);
        setHospitals([]);
      }
    };

    fetchHospitals();
  }, [location]);

  const mapMarkers = useMemo(() => hospitals.map(h => ({
    id: h.name,
    position: [h.lat, h.lng] as [number, number],
    title: h.name,
    description: h.address
  })), [hospitals]);

  const [activeCall, setActiveCall] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <CallOverlay
        isOpen={!!activeCall}
        name={activeCall || ""}
        onEndCall={() => setActiveCall(null)}
      />

      <div>
        <p className="page-title">Emergency Access</p>
        <p className="page-subtitle">
          SOS mode, critical info, and real-time nearby hospital locator.
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
                  onClick={() => setActiveCall(contact.name)}
                >
                  Call
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Real LocationIQ Map + hospital list */}
        <div>
          <p className="font-semibold mb-3">Nearest hospitals</p>
          <div className="rounded-xl overflow-hidden border border-card-border/60 bg-slate-950">
            <div className="relative h-64 w-full">
              {location ? (
                <Map
                  center={[location.lat, location.lng]}
                  zoom={13}
                  markers={mapMarkers}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              )}
            </div>
            <div className="divide-y divide-card-border/60">
              {hospitals.length > 0 ? hospitals.map((h) => (
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
              )) : (
                <div className="p-4 text-center text-sm text-muted">
                  Searching for nearby hospitals...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
