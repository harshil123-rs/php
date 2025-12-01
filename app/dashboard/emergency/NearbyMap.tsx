"use client";

import { GoogleMap, Marker } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { useGoogleMaps } from "@/components/GoogleMapsProvider";

const containerStyle = {
  width: "100%",
  height: "350px",
};

export default function NearbyMap() {
  const { isLoaded } = useGoogleMaps();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hospitals, setHospitals] = useState<google.maps.places.PlaceResult[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => alert("Enable location permission")
    );
  }, []);

  useEffect(() => {
    if (!isLoaded || !location) return;

    const service = new google.maps.places.PlacesService(
      document.createElement("div")
    );

    service.nearbySearch(
      { location, radius: 5000, type: "hospital" },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setHospitals(results);
        }
      }
    );
  }, [isLoaded, location]);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap center={location || { lat: 0, lng: 0 }} zoom={13} mapContainerStyle={containerStyle}>
      {location && (
        <Marker position={location} icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" />
      )}

      {hospitals.map((h, i) => (
        h.geometry?.location && (
          <Marker key={i} position={h.geometry.location} />
        )
      ))}
    </GoogleMap>
  );
}
