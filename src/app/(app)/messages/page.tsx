
"use client";

import { ChatLayout } from '@/components/messages/ChatLayout';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import type { Conversation, User } from '@/types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { users, conversations as mockConversations } from '@/lib/mock-data';

export default function MessagesPage() {
    const { user } = useAuth();
    // Using mock data for now. We will replace this with live data later.
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
    const [loading, setLoading] = useState(true);

    const currentUser: User | null = user ? {
        id: user.uid,
        uid: user.uid,
        name: user.displayName || 'Anonymous',
        avatarUrl: user.photoURL || 'https://placehold.co/100x100.png',
    } : users[0]; // Fallback to mock user for dev

    useEffect(() => {
        // In the future, this is where we will fetch live conversations from Firestore.
        // For now, we just set loading to false to show the mock data.
        setLoading(false);
    }, [user]);

    if (loading) {
        // You can return a loading spinner here
        return <div>Loading...</div>;
    }
    
    if (!currentUser) {
        // Handle case where user is not available
        return <div>Please log in to see messages.</div>;
    }

    return <ChatLayout conversations={conversations} currentUser={currentUser} />;
}
