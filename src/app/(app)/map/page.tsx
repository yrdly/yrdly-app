"use client";

import { MapScreen } from "@/components/MapScreen";

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function MapPage() {
    return <MapScreen />;
}
