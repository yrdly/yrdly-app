"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export interface Notification {
    id: string;
    userId: string;
    type: string;
    senderId: string;
    relatedId: string;
    message: string;
    isRead: boolean;
    createdAt: string; // Using string for Supabase timestamps
}

export const useNotifications = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        // Set up real-time subscription for notifications
        const channel = supabase
            .channel(`notifications_${user.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                // Handle real-time updates
                if (payload.new) {
                    const newNotification = payload.new as Notification;
                    setNotifications(prev => {
                        const existing = prev.filter(n => n.id !== newNotification.id);
                        return [newNotification, ...existing].sort((a, b) => 
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        );
                    });
                } else if (payload.eventType === 'DELETE') {
                    setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
                }
            })
            .subscribe();

        // Also fetch notifications initially
        const fetchNotifications = async () => {
            const { data: notificationsData, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (!error && notificationsData) {
                const newNotifications = notificationsData as Notification[];
                const newUnreadCount = newNotifications.filter(n => !n.isRead).length;

                // Optional: Show a toast for new, unread notifications
                if (newUnreadCount > unreadCount) {
                     const latestNotification = newNotifications[0];
                     if (latestNotification && !latestNotification.isRead) {
                        // Check if this notification was already seen in this session
                        const seenNotifs = sessionStorage.getItem('seenNotifications');
                        const seen = seenNotifs ? JSON.parse(seenNotifs) : [];
                        if (!seen.includes(latestNotification.id)) {
                            toast({
                                title: "New Notification",
                                description: latestNotification.message,
                            });
                            sessionStorage.setItem('seenNotifications', JSON.stringify([...seen, latestNotification.id]));
                        }
                     }
                }

                setNotifications(newNotifications);
                setUnreadCount(newUnreadCount);
            }
            setLoading(false);
        };
        
        fetchNotifications();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [user, toast, unreadCount]);

    const markAsRead = async (notificationId: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
        
        if (error) throw error;
    };

    const markAllAsRead = async () => {
        if (!user) return;
        const unread = notifications.filter(n => !n.isRead);
        const promises = unread.map(n => markAsRead(n.id));
        await Promise.all(promises);
    };

    const clearAllNotifications = async () => {
        if (!user) return;
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', user.id);
        
        if (error) throw error;
    };

    return { notifications, unreadCount, loading, markAsRead, markAllAsRead, clearAllNotifications };
};
