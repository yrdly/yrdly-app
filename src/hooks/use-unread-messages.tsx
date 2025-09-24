import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    // Set up real-time subscription for unread messages
    const channel = supabase
      .channel(`unread_messages_${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `to_user_id=eq.${user.id}&is_read=eq.false`
      }, (payload) => {
        // Re-fetch count on any change to relevant messages
        fetchUnreadCount();
      })
      .subscribe();

    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('to_user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread messages:', error);
        setUnreadCount(0);
      } else {
        setUnreadCount(count || 0);
      }
    };

    fetchUnreadCount();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return unreadCount;
};