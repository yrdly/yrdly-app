
import { ChatLayout, NoFriendsEmptyState } from '@/components/messages/ChatLayout';
import { MessagesPageClient } from './MessagesPageClient';

// For Next.js 15 compatibility, params is now async
export default async function MessagesPage({ params }: { params?: Promise<{ convId?: string }> }) {
    // Await the params for Next.js 15
    const resolvedParams = await params;
    const selectedConversationId = resolvedParams?.convId;
    
    console.log("MessagesPage rendered. Params:", resolvedParams);
    
    return <MessagesPageClient selectedConversationId={selectedConversationId} />;
}
