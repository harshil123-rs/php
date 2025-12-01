"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Phone, Star } from "lucide-react";
import { motion } from "framer-motion";

type Category = "hospital" | "clinic" | "pharmacy";

interface Place {
  id: string;
  name: string;
  vicinity: string;
  type: Category;
  distance: string;
  rating: number;
  lat: number;
  lng: number;
}

// Names to generate realistic-looking data
const HOSPITAL_NAMES = ["City General", "Memorial Health", "St. Mary's", "Community Medical", "University Hospital"];
const CLINIC_NAMES = ["Family Care", "Wellness Center", "Urgent Care", "Pediatric Associates", "Downtown Clinic"];
const PHARMACY_NAMES = ["HealthPlus", "MediCare Rx", "City Drugs", "Wellness Pharmacy", "24/7 Pharma"];

export default function DoctorsPage() {
  const [selected, setSelected] = useState<Category>("hospital");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        generatePlaces(latitude, longitude);
        setLoading(false);
      },
      (err) => {
        setError("Unable to retrieve your location. Showing demo data.");
        // Fallback to a default location (e.g., New York)
        const defaultLat = 40.7128;
        const defaultLng = -74.0060;
        setLocation({ lat: defaultLat, lng: defaultLng });
        generatePlaces(defaultLat, defaultLng);
        setLoading(false);
      }
    );
  }, []);

  const generatePlaces = (lat: number, lng: number) => {
    const newPlaces: Place[] = [];
    const types: Category[] = ["hospital", "clinic", "pharmacy"];

    types.forEach(type => {
      const count = 3 + Math.floor(Math.random() * 3); // 3-5 places per type
      const names = type === "hospital" ? HOSPITAL_NAMES : type === "clinic" ? CLINIC_NAMES : PHARMACY_NAMES;

      for (let i = 0; i < count; i++) {
        // Random offset from user location (approx 1-5km)
        const latOffset = (Math.random() - 0.5) * 0.04;
        const lngOffset = (Math.random() - 0.5) * 0.04;

        newPlaces.push({
          id: `${type}-${i}`,
          name: `${names[i % names.length]} ${type === "hospital" ? "" : type === "clinic" ? "" : ""}`,
          vicinity: `${Math.floor(Math.random() * 100)} Main St, Sector ${Math.floor(Math.random() * 10)}`,
          type: type,
          distance: `${(Math.random() * 5).toFixed(1)} km`,
          rating: 4 + Math.random(),
          lat: lat + latOffset,
          lng: lng + lngOffset
        });
      }
    });
    setPlaces(newPlaces);
  };

  const filtered = useMemo(
    () => places.filter((p) => p.type === selected),
    [selected, places]
  );

  const categories: { label: string; value: Category }[] = [
    { label: "Hospitals", value: "hospital" },
    { label: "Clinics", value: "clinic" },
    { label: "Pharmacies", value: "pharmacy" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Find Care Nearby
        </h1>
        <p className="text-slate-400">
          Locate the nearest hospitals, clinics, and pharmacies based on your current location.
        </p>
      </div>

      <div className="glass-card p-6 space-y-6">
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selected === cat.value ? "primary" : "outline"}
              onClick={() => setSelected(cat.value)}
              className={selected === cat.value ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Map Interface */}
        <div className="relative h-[400px] w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-inner group">
          {/* Map Background (Abstract) */}
          <div className="absolute inset-0 bg-[#0f172a]">
            {/* Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

            {/* Radar Effect */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
          </div>

          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-blue-400 animate-pulse">Locating you...</p>
            </div>
          ) : (
            <>
              {/* User Location */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg shadow-blue-500/50" />
                  <div className="absolute inset-0 w-full h-full bg-blue-500 rounded-full animate-ping opacity-75" />
                </div>
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/80 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap border border-slate-700">
                  You are here
                </div>
              </div>

              {/* Places Markers */}
              {filtered.map((place) => {
                // Calculate relative position for demo purposes (clamped to container)
                // In a real map, we'd project lat/lng to pixels.
                // Here we just use the offset we generated.
                if (!location) return null;

                const latDiff = (place.lat - location.lat) * 2000; // Scale factor
                const lngDiff = (place.lng - location.lng) * 2000;

                // Clamp to keep inside view roughly
                const x = 50 + Math.max(-45, Math.min(45, lngDiff));
                const y = 50 - Math.max(-45, Math.min(45, latDiff)); // Invert Y for map

                return (
                  <motion.div
                    key={place.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute z-10 cursor-pointer group/marker"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <MapPin className={`w-8 h-8 ${place.type === 'hospital' ? 'text-red-500' :
                      place.type === 'clinic' ? 'text-emerald-500' : 'text-orange-500'
                      } drop-shadow-lg transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-transform`} />

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/marker:block bg-slate-900 text-white text-xs p-2 rounded border border-slate-700 whitespace-nowrap z-30">
                      <p className="font-bold">{place.name}</p>
                      <p className="text-slate-400">{place.distance}</p>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((place) => (
          <motion.div
            key={place.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 hover:bg-white/5 transition-colors border border-white/5"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 rounded-lg bg-slate-800">
                {place.type === 'hospital' && <div className="text-red-400">🏥</div>}
                {place.type === 'clinic' && <div className="text-emerald-400">⚕️</div>}
                {place.type === 'pharmacy' && <div className="text-orange-400">💊</div>}
              </div>
              <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded text-yellow-400 text-xs font-medium">
                <Star className="w-3 h-3 fill-yellow-400" />
                {place.rating.toFixed(1)}
              </div>
            </div>

            <h3 className="font-semibold text-lg truncate">{place.name}</h3>
            <p className="text-sm text-slate-400 mb-4 truncate">{place.vicinity}</p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <Navigation className="w-3 h-3" />
                {place.distance}
              </div>
              <Button size="sm" variant="ghost" className="h-8 text-blue-400 hover:text-blue-300">
                <Phone className="w-3 h-3 mr-2" />
                Call
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
