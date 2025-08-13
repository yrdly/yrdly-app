export type PostCategory = 'General' | 'Event' | 'For Sale' | 'Business';

export interface Post {
  id: string;
  userId: string;
  authorName: string;
  authorImage: string;
  text: string;
  imageUrl?: string;
  timestamp: string;
  likes: number;
  commentCount: number;
  category: PostCategory;
  location?: string;
  eventDate?: string;
  eventTime?: string;
  eventLink?: string;
  attendees?: string[];
  likedBy?: string[];
}
