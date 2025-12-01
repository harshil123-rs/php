"use client";

import { createContext, useContext } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const MapContext = createContext<any>(null);

export function GoogleMapsProvider({ children }: any) {
  const loader = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  return (
    <MapContext.Provider value={loader}>
      {children}
    </MapContext.Provider>
  );
}

export const useGoogleMaps = () => useContext(MapContext);
