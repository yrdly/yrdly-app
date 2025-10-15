
"use client";

import { EventsScreen } from "@/components/EventsScreen";

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function EventsPage() {
  return <EventsScreen />;
}
