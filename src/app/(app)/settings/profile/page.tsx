"use client";

import { EditProfileScreen } from "@/components/EditProfileScreen";

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
    return <EditProfileScreen />;
}