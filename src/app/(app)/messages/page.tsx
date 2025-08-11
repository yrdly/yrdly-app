
"use client";

import { ChatLayout } from '@/components/messages/ChatLayout';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import type { Conversation, User } from '@/types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function MessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    const currentUser: User | null = user ? {
        id: user.uid,
        uid: user.uid,
        name: user.displayName || 'Anonymous',
        avatarUrl: user.photoURL || 'https://placehold.co/100x100.png',
    } : null;

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, "conversations"), where("participants", "array-contains", user.uid));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            // Placeholder for fetching and mapping conversations
            // This would involve fetching participant details etc.
            setConversations([]); 
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading || !currentUser) {
        // You can return a loading spinner here
        return <div>Loading...</div>;
    }

    return <ChatLayout conversations={conversations} currentUser={currentUser} />;
}
