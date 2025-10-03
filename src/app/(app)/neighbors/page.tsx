"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Heart, MessageCircle, Share, Search, Users, TrendingUp, Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-supabase-auth";
import type { Post as PostType } from "@/types";

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function NeighborsPage() {
  const { user } = useAuth();
  const [communityPosts, setCommunityPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [stats, setStats] = useState({
    neighbors: 0,
    activeToday: 0,
    newPosts: 0
  });

  // Fetch community posts and stats
  useEffect(() => {
    const fetchCommunityData = async () => {
      if (!user) return;

      try {
        // Fetch community posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(20);

        if (postsError) {
          console.error('Error fetching community posts:', postsError);
        } else {
          setCommunityPosts(postsData as PostType[] || []);
        }

        // Fetch neighbors count
        const { count: neighborsCount, error: neighborsError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (neighborsError) {
          console.error('Error fetching neighbors count:', neighborsError);
        } else {
          setStats(prev => ({ ...prev, neighbors: neighborsCount || 0 }));
        }

        // Fetch active users today (users who have been online in the last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const { count: activeCount, error: activeError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gte('last_seen', yesterday.toISOString());

        if (activeError) {
          console.error('Error fetching active users:', activeError);
        } else {
          setStats(prev => ({ ...prev, activeToday: activeCount || 0 }));
        }

        // Set new posts count
        setStats(prev => ({ ...prev, newPosts: postsData?.length || 0 }));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching community data:', error);
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [user]);

  const handleViewProfile = (post: PostType) => {
    // TODO: Navigate to user profile
    console.log('View profile:', post.author_name);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6 pb-24">
        <div className="space-y-3">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Community</h2>
            <p className="text-muted-foreground">What&apos;s happening in your neighborhood</p>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-20"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Page Header */}
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Community</h2>
          <p className="text-muted-foreground">What&apos;s happening in your neighborhood</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for neighbors..."
            className="pl-10 bg-card border-border focus:border-primary"
            onClick={() => setShowUserSearch(true)}
            readOnly
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center yrdly-shadow">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-lg font-bold text-foreground">{stats.neighbors.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Neighbors</div>
        </Card>
        <Card className="p-4 text-center yrdly-shadow">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          <div className="text-lg font-bold text-foreground">{stats.activeToday}</div>
          <div className="text-xs text-muted-foreground">Active Today</div>
        </Card>
        <Card className="p-4 text-center yrdly-shadow">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
            <Bell className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-lg font-bold text-foreground">{stats.newPosts}</div>
          <div className="text-xs text-muted-foreground">New Posts</div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Community Feed</h3>

        {communityPosts.length > 0 ? (
          communityPosts.map((post) => (
            <Card key={post.id} className="p-4 yrdly-shadow">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={post.author_image || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {post.author_name?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground truncate">{post.author_name}</h4>
                    {post.category === "Event" && (
                      <Badge className="bg-primary text-primary-foreground flex-shrink-0">Event</Badge>
                    )}
                    {post.category === "For Sale" && (
                      <Badge className="bg-accent text-accent-foreground flex-shrink-0">For Sale</Badge>
                    )}
                    {post.category === "General" && (
                      <Badge className="bg-green-100 text-green-700 flex-shrink-0">General</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(post.timestamp).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                {post.title && <h3 className="font-semibold text-foreground">{post.title}</h3>}
                <p className="text-muted-foreground text-sm leading-relaxed">{post.text}</p>

                {post.category === "Event" && post.event_date && (
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-foreground">{post.event_date}</span>
                    </div>
                    {post.event_location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{post.event_location.address}</span>
                      </div>
                    )}
                  </div>
                )}

                {post.category === "For Sale" && post.price && (
                  <div className="bg-accent/5 p-3 rounded-lg border border-accent/20">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-accent font-bold text-lg">₦{post.price.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{post.event_location?.address || 'Lagos, Nigeria'}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-border">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-red-500"
                  onClick={() => console.log('Like post:', post.id)}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  <span className="text-sm">{post.liked_by?.length || 0}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => console.log('Comment on post:', post.id)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">{post.comment_count || 0}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-accent"
                  onClick={() => console.log('Share post:', post.id)}
                >
                  <Share className="w-4 h-4 mr-1" />
                  <span className="text-sm">Share</span>
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No community posts yet</h3>
            <p className="text-muted-foreground">Be the first to share something with your neighbors!</p>
          </div>
        )}
      </div>
    </div>
  );
}