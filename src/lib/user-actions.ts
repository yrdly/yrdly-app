import { supabase } from './supabase';
import { User, FriendRequest } from '@/types';

type FriendshipStatus = 'friends' | 'request_sent' | 'request_received' | 'none';

export const getFriendshipStatus = async (currentUser: User, targetUser: User): Promise<FriendshipStatus> => {
    if (currentUser.friends?.includes(targetUser.id)) {
        return 'friends';
    }

    const { data: requests, error } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`from_user_id.eq.${currentUser.id},to_user_id.eq.${currentUser.id}`)
        .or(`from_user_id.eq.${targetUser.id},to_user_id.eq.${targetUser.id}`)
        .eq('status', 'pending');

    if (error) {
        console.error('Error fetching friendship status:', error);
        return 'none';
    }

    if (requests && requests.length > 0) {
        const request = requests[0] as FriendRequest;
        return request.from_user_id === currentUser.id ? 'request_sent' : 'request_received';
    }

    return 'none';
};