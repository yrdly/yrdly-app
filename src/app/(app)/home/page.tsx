
"use client";

import { PostCard } from "@/components/PostCard";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useHaptics } from "@/hooks/use-haptics";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { Card, CardContent } from "@/components/ui/card";
import { DismissibleBanner } from "@/components/DismissibleBanner";
import { CommentThread } from "@/components/CommentThread";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Post as PostType } from "@/types";
import { PostSkeleton } from "@/components/ui/post-skeleton";
import { EmptyFeed } from "@/components/EmptyFeed";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { SuggestedNeighbors } from "@/components/SuggestedNeighbors";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { useAuth } from "@/hooks/use-supabase-auth";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal, 
  MapPin, 
  Calendar, 
  DollarSign, 
  AlertTriangle 
} from "lucide-react";

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function Home() {
  const { triggerHaptic } = useHaptics();
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showEmailBanner, setShowEmailBanner] = useState(true);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Fetch posts from Supabase
  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      if (data) {
        setPosts(data as PostType[]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  }, []);

  // Pull-to-refresh functionality
  const { containerRef, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      // Trigger haptic feedback
      triggerHaptic('medium');
      
      // Refresh data
      await fetchPosts();
      
      // Show success feedback
      triggerHaptic('success');
    },
    threshold: 80,
    enabled: true
  });

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  // Real-time subscription for live updates
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for posts...');
    
    const channel = supabase
      .channel('posts')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'posts' 
      }, (payload) => {
        console.log('Home page realtime change received!', payload);
        console.log('Event type:', payload.eventType);
        console.log('New data:', payload.new);
        console.log('Old data:', payload.old);
        
        if (payload.eventType === 'INSERT') {
          // Add new post to the beginning of the list
          const newPost = payload.new as PostType;
          console.log('Adding new post to home feed:', newPost);
          setPosts(prevPosts => [newPost, ...prevPosts]);
        } else if (payload.eventType === 'UPDATE') {
          // Update existing post in the list
          const updatedPost = payload.new as PostType;
          setPosts(prevPosts => 
            prevPosts.map(post => 
              post.id === updatedPost.id ? updatedPost : post
            )
          );
        } else if (payload.eventType === 'DELETE') {
          // Remove deleted post from the list
          const deletedId = payload.old.id;
          console.log('Removing post from home feed:', deletedId);
          setPosts(prevPosts => 
            prevPosts.filter(post => post.id !== deletedId)
          );
        }
      })
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription...');
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Helper functions
  const toggleComments = (postId: string) => {
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId],
    });
  };

  const handleLike = (postId: string) => {
    // TODO: Implement like functionality with Supabase
    console.log('Like post:', postId);
  };

  const handleReply = (postId: string, commentId: string, content: string) => {
    // TODO: Implement reply functionality with Supabase
    console.log('Reply to comment:', { postId, commentId, content });
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    // TODO: Implement comment like functionality with Supabase
    console.log('Like comment:', { postId, commentId });
  };

  const handleAvatarClick = (post: PostType) => {
    // TODO: Navigate to user profile
    console.log('View profile:', post.author_name);
  };

  return (
    <div ref={containerRef} className="p-4 space-y-4 pb-24 max-w-2xl mx-auto">
      {/* Email Verification Banner */}
      {showEmailBanner && (
        <DismissibleBanner className="p-4 bg-yellow-50 border-yellow-200" onDismiss={() => setShowEmailBanner(false)}>
          <div className="flex items-center gap-3 pr-8">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-yellow-800">Please verify your email address</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 bg-transparent flex-shrink-0"
            >
              Verify
            </Button>
          </div>
        </DismissibleBanner>
      )}

      {/* Welcome Banner */}
      {showWelcomeBanner && (
        <DismissibleBanner className="p-6 yrdly-gradient text-white" onDismiss={() => setShowWelcomeBanner(false)}>
          <div className="pr-8">
            <h2 className="text-xl font-bold mb-2">Welcome to your neighborhood!</h2>
            <p className="text-white/90 mb-4">Connect with neighbors, discover events, and support local businesses.</p>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" className="bg-white text-primary hover:bg-white/90">
                Explore
              </Button>
              <Button size="sm" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                Invite Friends
              </Button>
            </div>
          </div>
        </DismissibleBanner>
      )}

      {/* Create Post Card */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.user_metadata?.full_name?.substring(0, 2) || "U"}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            className="flex-1 justify-start text-muted-foreground bg-transparent"
            onClick={() => setShowCreatePost(true)}
          >
            What&apos;s happening in your neighborhood?
          </Button>
        </div>
          </Card>
          
      {/* Feed Posts */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
            <PostSkeleton showImage={true} />
            <PostSkeleton showImage={true} showMultipleImages={true} />
            <PostSkeleton showImage={false} />
            <PostSkeleton showImage={true} />
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
            <Card key={post.id} className="p-4 yrdly-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar
                    className="w-10 h-10 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => handleAvatarClick(post)}
                  >
                    <AvatarImage src={post.author_image || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {post.author_name?.substring(0, 2) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h4
                      className="font-semibold text-foreground truncate cursor-pointer hover:text-primary"
                      onClick={() => handleAvatarClick(post)}
                    >
                      {post.author_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{new Date(post.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                {post.category === 'For Sale' && (
                  <Badge className="bg-accent text-accent-foreground flex-shrink-0">For Sale</Badge>
                )}
                <Button variant="ghost" size="sm" className="flex-shrink-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              <div className="mb-3">
                {post.image_urls && post.image_urls.length > 0 && (
                  <img
                    src={post.image_urls[0]}
                    alt="Post image"
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                )}

                {post.category === 'Event' && (
                  <>
                    <p className="text-foreground mb-2">{post.text}</p>
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-semibold text-foreground">{post.title}</span>
                      </div>
                      {post.event_location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="break-words">{post.event_location.address}</span>
                        </div>
                      )}
                      {post.event_date && (
                        <div className="text-sm text-muted-foreground">{post.event_date}</div>
                      )}
                    </div>
                  </>
                )}

                {post.category === 'For Sale' && (
                  <>
                    <h4 className="font-semibold text-foreground mb-1">{post.title || post.text}</h4>
                    <p className="text-foreground mb-2">{post.description}</p>
                    {post.price && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-accent" />
                        <span className="font-bold text-accent text-lg">₦{post.price.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}

                {post.category === 'General' && <p className="text-foreground break-words">{post.text}</p>}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border flex-wrap gap-2">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-red-500"
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    <span className="text-sm">{post.liked_by?.length || 0}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">{post.comment_count || 0}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-accent">
                    <Share className="w-4 h-4 mr-1" />
                    <span className="text-sm">Share</span>
                  </Button>
                </div>
                {post.category === 'For Sale' && (
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Contact Seller
                  </Button>
                )}
              </div>

              <Collapsible open={expandedComments[post.id]} onOpenChange={() => toggleComments(post.id)}>
                <CollapsibleContent className="mt-4 pt-3 border-t border-border space-y-4">
                  {/* Comment Input */}
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user?.user_metadata?.full_name?.substring(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Write a comment..."
                        className="min-h-[60px] resize-none"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-primary text-primary-foreground">
                          Comment
                        </Button>
                        <Button size="sm" variant="outline">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
              ))
            ) : (
              <EmptyFeed />
            )}
        </div>

      {/* Create Post Dialog */}
      {showCreatePost && (
        <CreatePostDialog 
          open={showCreatePost} 
          onOpenChange={setShowCreatePost}
        />
      )}
    </div>
  );
}
