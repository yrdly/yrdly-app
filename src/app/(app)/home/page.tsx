
"use client";

import { HomeScreen } from "@/components/HomeScreen";

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function Home() {
  return <HomeScreen />;
}
