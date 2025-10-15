
"use client";

import { MessagesScreen } from "@/components/MessagesScreen";

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function MessagesPage() {
    return <MessagesScreen />;
}
