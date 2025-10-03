"use client";

import { NeighborChatLayout } from '@/components/messages/NeighborChatLayout';
import { MarketplaceChatLayout } from '@/components/messages/MarketplaceChatLayout';
import { useAuth } from '@/hooks/use-supabase-auth';
import { useState, useEffect, useMemo } from 'react';
import type { User, Conversation } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const MessagesLoading = () => (
    <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
        <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    </div>
);

// Client component to handle the interactive parts
export function MessagesPageClient({ selectedConversationId }: { selectedConversationId?: string }) {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const currentUser = useMemo(() => user ? {
        id: user.id,
        uid: user.id,
        name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous',
        avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || `https://placehold.co/100x100.png`,
    } as User : null, [user, profile]);

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            if (!user) return;
            
            try {
                const { data, error } = await supabase
                    .from('conversations')
                    .select(`
                        *,
                        participants:conversation_participants(
                            user_id,
                            profiles(id, name, avatarUrl, isOnline)
                        ),
                        messages(
                            id, content, image_url, timestamp, sender_id,
                            sender:profiles(id, name, avatarUrl)
                        )
                    `)
                    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                    .order('last_message_at', { ascending: false });

                if (error) {
                    console.error('Error fetching conversations:', error);
                    return;
                }

                const formattedConversations = data.map(conv => ({
                    ...conv,
                    participants: conv.participants.map((p: any) => p.profiles),
                    messages: conv.messages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
                }));

                setConversations(formattedConversations as Conversation[]);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching conversations:', error);
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user]);

    const filteredConversations = conversations.filter(conv => {
        if (!searchTerm) return true;
        const otherParticipant = conv.participants.find(p => p.id !== user?.id);
        return otherParticipant?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleOpenChat = (conversation: Conversation) => {
        // Navigate to the conversation
        window.location.href = `/messages/${conversation.id}`;
    };

    if (loading) {
        return <MessagesLoading />;
    }

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Please log in</h2>
                    <p className="text-gray-600">You need to be logged in to view your messages.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 pb-24">
            {/* Page Header */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Messages</h2>
                    <p className="text-muted-foreground">Chat with your neighbors</p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search conversations..." 
                        className="pl-10 bg-card border-border focus:border-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Conversations */}
            <div className="space-y-3">
                {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => {
                        const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
                        if (!otherParticipant) return null;

                        const lastMessage = conversation.messages?.[conversation.messages.length - 1];
                        const unreadCount = conversation.messages?.filter(m => 
                            m.sender_id !== user?.id && !m.read_at
                        ).length || 0;

                        return (
                            <Card
                                key={conversation.id}
                                className="p-4 yrdly-shadow hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleOpenChat(conversation)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage src={otherParticipant.avatarUrl || "/placeholder.svg"} />
                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                {otherParticipant.name?.substring(0, 2).toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        {otherParticipant.isOnline && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-foreground">{otherParticipant.name}</h4>
                                            <span className="text-xs text-muted-foreground">
                                                {lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                }) : ''}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {lastMessage?.content || "No messages yet"}
                                        </p>
                                    </div>
                                    {unreadCount > 0 && (
                                        <Badge className="bg-primary text-primary-foreground">{unreadCount}</Badge>
                                    )}
                                </div>
                            </Card>
                        );
                    })
                ) : (
                    <div className="text-center py-12">
                        <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                        <p className="text-muted-foreground">Start chatting with your neighbors!</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="fixed bottom-24 right-4 z-10">
                <Button
                    size="icon"
                    className="w-14 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 yrdly-shadow-lg"
                >
                    <MessageCircle className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
}
