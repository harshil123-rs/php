"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MapClient = dynamic(() => import("./map-client"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full w-full bg-slate-900">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    ),
});

interface MapProps {
    center: [number, number];
    zoom?: number;
    markers?: {
        id: string;
        position: [number, number];
        title: string;
        description?: string;
    }[];
    onMarkerClick?: (id: string) => void;
    className?: string;
}

export default function Map(props: MapProps) {
    return <MapClient {...props} />;
}
