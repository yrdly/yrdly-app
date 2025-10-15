
"use client";

import { SettingsScreen } from "@/components/SettingsScreen";

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
    return <SettingsScreen />;
}
