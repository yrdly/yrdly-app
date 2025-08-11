"use client";
import { ChatLayout } from '@/components/messages/ChatLayout';
import { conversations, users } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';

export default function MessagesPage() {
    const { user } = useAuth();
    
    // This is a placeholder, you'd fetch the current user's data
    const currentUser = {
        id: user?.uid || 'u1',
        name: user?.displayName || 'Alice Johnson',
        avatarUrl: user?.photoURL || 'https://placehold.co/100x100.png',
    }

    return <ChatLayout conversations={conversations} currentUser={currentUser} />;
}
