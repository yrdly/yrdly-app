"use client";

import { NotificationsScreen } from "@/components/NotificationsScreen";

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function NotificationsPage() {
  return <NotificationsScreen />;
}
