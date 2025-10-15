
"use client";

import { BusinessesScreen } from "@/components/BusinessesScreen";

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function BusinessesPage() {
  return <BusinessesScreen />;
}
