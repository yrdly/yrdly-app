
"use client";

import { ConversationScreen } from "@/components/ConversationScreen";
import { useParams } from 'next/navigation';

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function ConversationPage() {
    const params = useParams();
    const conversationId = params?.convId as string;
    
    
    return <ConversationScreen conversationId={conversationId} />;
}
