"use client";

import { useAuth } from '@/hooks/use-supabase-auth';
import { useState, useEffect, useMemo } from 'react';
import type { User, Post as PostType } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Star,
  Edit,
  Share,
  MessageCircle,
  Heart,
  ShoppingBag,
  Briefcase,
  CalendarDays,
} from "lucide-react";
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [userItems, setUserItems] = useState<PostType[]>([]);
  const [userBusinesses, setUserBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = useMemo(() => user ? {
    id: user.id,
    uid: user.id,
    name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous',
    avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || `https://placehold.co/100x100.png`,
    bio: profile?.bio || '',
    location: profile?.location ? `${profile.location.lga}, ${profile.location.state}` : 'Lagos, Nigeria',
    joinDate: new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  } : null, [user, profile]);

  // Fetch user's posts, items, and businesses
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch user's posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(10);

        if (postsError) {
          console.error('Error fetching posts:', postsError);
        } else {
          setUserPosts(postsData as PostType[] || []);
        }

        // Fetch user's marketplace items
        const { data: itemsData, error: itemsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .eq('category', 'For Sale')
          .order('timestamp', { ascending: false })
          .limit(10);

        if (itemsError) {
          console.error('Error fetching items:', itemsError);
        } else {
          setUserItems(itemsData as PostType[] || []);
        }

        // Fetch user's businesses
        const { data: businessesData, error: businessesError } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (businessesError) {
          console.error('Error fetching businesses:', businessesError);
        } else {
          setUserBusinesses(businessesData || []);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-muted"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
      </div>

      {/* Profile Header */}
      <Card className="p-6 yrdly-shadow">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <Avatar className="w-24 h-24">
              <AvatarImage src={currentUser.avatarUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{currentUser.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{currentUser.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {currentUser.bio && (
              <p className="text-foreground">{currentUser.bio}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-primary border-primary bg-primary/10">
                Community Member
              </Badge>
              <Badge variant="outline" className="text-accent border-accent bg-accent/10">
                Active
              </Badge>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{userPosts.length}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{userItems.length}</div>
                <div className="text-sm text-muted-foreground">Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{userBusinesses.length}</div>
                <div className="text-sm text-muted-foreground">Businesses</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger
            value="posts"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Heart className="w-4 h-4 mr-1" />
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="items"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <ShoppingBag className="w-4 h-4 mr-1" />
            Items
          </TabsTrigger>
          <TabsTrigger
            value="businesses"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Briefcase className="w-4 h-4 mr-1" />
            Business
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <CalendarDays className="w-4 h-4 mr-1" />
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-3 mt-4">
          {loading ? (
            <div className="space-y-3">
              <Card className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </Card>
            </div>
          ) : userPosts.length > 0 ? (
            userPosts.map((post) => (
              <Card key={post.id} className="p-4 yrdly-shadow">
                <p className="text-foreground mb-2">{post.text}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post.liked_by?.length || 0}
                  </span>
                  <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="items" className="space-y-3 mt-4">
          {loading ? (
            <div className="space-y-3">
              <Card className="p-4">
                <div className="animate-pulse flex gap-3">
                  <div className="w-20 h-20 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </Card>
            </div>
          ) : userItems.length > 0 ? (
            userItems.map((item) => (
              <Card key={item.id} className="p-4 yrdly-shadow">
                <div className="flex gap-3">
                  <img
                    src={item.image_urls?.[0] || "/placeholder.svg"}
                    alt={item.title || item.text}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{item.title || item.text}</h4>
                    <p className="text-accent font-bold">₦{item.price?.toLocaleString() || '0'}</p>
                    <p className="text-sm text-muted-foreground">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No items for sale yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="businesses" className="space-y-3 mt-4">
          {loading ? (
            <div className="space-y-3">
              <Card className="p-4">
                <div className="animate-pulse flex gap-3">
                  <div className="w-16 h-16 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </Card>
            </div>
          ) : userBusinesses.length > 0 ? (
            userBusinesses.map((business) => (
              <Card key={business.id} className="p-4 yrdly-shadow">
                <div className="flex gap-3">
                  <img
                    src={business.image_urls?.[0] || "/placeholder.svg"}
                    alt={business.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{business.name}</h4>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-foreground">4.5</span>
                      <span className="text-muted-foreground">(0)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{business.category}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No businesses yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-3 mt-4">
          <div className="text-center py-8">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No events posted yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
