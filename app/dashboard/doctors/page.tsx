"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Phone, Star, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Map from "@/components/ui/map";
import CallOverlay from "@/components/ui/call-overlay";

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

export default function DoctorsPage() {
  const [selected, setSelected] = useState<Category>("hospital");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [locationSource, setLocationSource] = useState<"gps" | "ip" | "default">("default");
  const [activeCall, setActiveCall] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError("");

    try {
      const token = process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN;
      const res = await fetch(`https://us1.locationiq.com/v1/search.php?key=${token}&q=${encodeURIComponent(searchQuery)}&format=json&limit=1`);

      if (!res.ok) throw new Error("Location not found");

      const data = await res.json();
      if (data.length > 0) {
        setLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        });
        setLocationSource("default");
      } else {
        setError("Location not found. Please try another query.");
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError("Failed to search location.");
    } finally {
      setIsSearching(false);
    }
  };

  const getLocation = () => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      fetchIpLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationSource("gps");
        setLoading(false);
      },
      (err) => {
        console.warn("GPS failed, trying IP location...", err);
        let errorMsg = "Unable to retrieve your location.";
        if (err.code === 1) errorMsg = "Location permission denied.";
        else if (err.code === 2) errorMsg = "Location unavailable.";
        else if (err.code === 3) errorMsg = "Location request timed out.";

        setError(errorMsg + " Trying IP fallback...");
        fetchIpLocation();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const fetchIpLocation = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) throw new Error("IP Location failed");
      const data = await res.json();
      setLocation({ lat: data.latitude, lng: data.longitude });
      setLocationSource("ip");
      setLoading(false);
    } catch (err) {
      console.error("IP Location failed:", err);
      setError("Unable to retrieve your location. Showing default.");
      setLocation({ lat: 40.7128, lng: -74.0060 }); // New York fallback
      setLocationSource("default");
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (!location) return;

    const fetchPlaces = async () => {
      try {
        const token = process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN;
        if (!token) {
          console.error("LocationIQ API token not found.");
          setPlaces([]);
          return;
        }

        // LocationIQ Nearby API
        const url = `https://us1.locationiq.com/v1/nearby.php?key=${token}&lat=${location.lat}&lon=${location.lng}&tag=${selected}&radius=5000&format=json`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch places");

        const data = await res.json();

        const mappedPlaces: Place[] = data.map((place: any) => ({
          id: place.place_id,
          name: place.name,
          vicinity: place.display_name.split(",")[0] + ", " + place.display_name.split(",")[1], // Simple address
          type: selected,
          distance: `${(place.distance / 1000).toFixed(1)} km`,
          rating: 4 + Math.random(), // Mock rating as LocationIQ doesn't provide it in free tier often
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon)
        }));

        setPlaces(mappedPlaces.slice(0, 9));
      } catch (err) {
        console.error(err);
        // Fallback or empty state
        setPlaces([]);
      }
    };

    fetchPlaces();
  }, [location, selected]);

  const categories: { label: string; value: Category }[] = [
    { label: "Hospitals", value: "hospital" },
    { label: "Clinics", value: "clinic" },
    { label: "Pharmacies", value: "pharmacy" }
  ];

  const mapMarkers = useMemo(() => places.map(p => ({
    id: p.id,
    position: [p.lat, p.lng] as [number, number],
    title: p.name,
    description: p.vicinity
  })), [places]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CallOverlay
        isOpen={!!activeCall}
        name={activeCall || ""}
        onEndCall={() => setActiveCall(null)}
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Find Care Nearby
            </h1>
            <p className="text-slate-400">
              Locate the nearest hospitals, clinics, and pharmacies.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={getLocation} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Navigation className="w-4 h-4 mr-2" />}
            {loading ? "Locating..." : "Retry GPS"}
          </Button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search city or address (e.g. 'San Francisco', '123 Main St')..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isSearching || !searchQuery.trim()} className="bg-blue-600 hover:bg-blue-700">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </Button>
        </form>

        <div className="flex items-center gap-2 text-xs">
          {locationSource === "gps" && <span className="text-emerald-400 flex items-center gap-1">● Using precise GPS location</span>}
          {locationSource === "ip" && <span className="text-yellow-500 flex items-center gap-1">● Using approximate IP location</span>}
          {locationSource === "default" && <span className="text-slate-400 flex items-center gap-1">● Using searched/default location</span>}
          {error && <span className="text-red-400 ml-auto">{error}</span>}
        </div>
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
        <div className="relative h-[400px] w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-inner">
          {location ? (
            <Map
              center={[location.lat, location.lng]}
              zoom={13}
              markers={mapMarkers}
              className="z-0"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-blue-400 animate-pulse">Locating you...</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {places.map((place) => (
          <motion.div
            key={place.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 hover:bg-white/5 transition-colors border border-white/5 cursor-pointer"
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
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-blue-400 hover:text-blue-300"
                onClick={() => setActiveCall(place.name)}
              >
                <Phone className="w-3 h-3 mr-2" />
                Call
              </Button>
            </div>
          </motion.div>
        ))}
        {places.length === 0 && !loading && (
          <div className="col-span-full text-center py-10 text-slate-500">
            No {selected}s found nearby.
          </div>
        )}
      </div>
    </div>
  );
}
