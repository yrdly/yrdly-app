
"use client";

import { CommunityScreen } from "@/components/CommunityScreen";

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function NeighborsPage() {
  return <CommunityScreen />;
}
