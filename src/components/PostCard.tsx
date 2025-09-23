
"use client";

import type { User, Post } from "@/types";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, MapPin, Briefcase, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { useAuth } from "@/hooks/use-supabase-auth";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "./ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CreatePostDialog } from "./CreatePostDialog";
import { useToast } from "@/hooks/use-toast";
import { CommentSection } from "./CommentSection";
import { timeAgo, formatPrice } from "@/lib/utils";
import { UserProfileDialog } from "./UserProfileDialog";
import { useRouter } from "next/navigation";
import { useHaptics } from "@/hooks/use-haptics";


interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { triggerHaptic } = useHaptics();
  const [author, setAuthor] = useState<User | null>(null);
  const [loadingAuthor, setLoadingAuthor] = useState(true);
  const [likes, setLikes] = useState(post.liked_by?.length || 0);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    // Since we're using Supabase, the post already contains author information
    // No need to fetch from Firebase
    setLoadingAuthor(false);
    setAuthor({ 
      id: post.user_id || 'unknown',
      uid: post.user_id || 'unknown',
      name: post.author_name || 'Anonymous User', 
      avatarUrl: post.author_image || 'https://placehold.co/100x100.png'
    });
  }, [post.user_id, post.author_name, post.author_image]);

  useEffect(() => {
    if (!post.id) return;
    
    // Set initial values from post data
    setLikes(post.liked_by?.length || 0);
    setCommentCount(post.comment_count || 0);
    if (currentUser && post.liked_by) {
      setIsLiked(post.liked_by.includes(currentUser.id));
    }

    // Set up real-time subscription for this post
    const channel = supabase
      .channel(`post-${post.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${post.id}`,
        },
        (payload) => {
          console.log('Post update received:', payload);
                 if (payload.new) {
                   const postData = payload.new as any;
                   setLikes(postData.liked_by?.length || 0);
                   setCommentCount(postData.comment_count || 0);
                   if (currentUser && postData.liked_by) {
                     setIsLiked(postData.liked_by.includes(currentUser.id));
                   }
                 }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id, post.liked_by, post.comment_count, currentUser]);

  const handleLike = async () => {
    if (!currentUser || !post.id) return;
    
    // Trigger haptic feedback
    triggerHaptic('light');
    
    try {
      // Get current post data
      const { data: postData, error: fetchError } = await supabase
        .from('posts')
        .select('liked_by')
        .eq('id', post.id)
        .single();

      if (fetchError) {
        console.error('Error fetching post:', fetchError);
        return;
      }

      const currentLikedBy = postData.liked_by || [];
      const userHasLiked = currentLikedBy.includes(currentUser.id);

      let newLikedBy;
      if (userHasLiked) {
        // Remove user from liked_by array
        newLikedBy = currentLikedBy.filter((id: string) => id !== currentUser.id);
      } else {
        // Add user to liked_by array
        newLikedBy = [...currentLikedBy, currentUser.id];
      }

      // Update the post
      const { error: updateError } = await supabase
        .from('posts')
        .update({ liked_by: newLikedBy })
        .eq('id', post.id);

      if (updateError) {
        console.error('Error updating post:', updateError);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleDelete = async () => {
    if (!currentUser || !post.id || currentUser.id !== post.user_id) return;
    try {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', post.id);
        
        if (error) {
          throw error;
        }
        toast({ title: "Post deleted", description: "Your post has been successfully removed." });
    } catch (error) {
        console.error("Error deleting post:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete post." });
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Event":
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">{category}</Badge>;
      case "For Sale":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{category}</Badge>;
      case "Business":
         return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1"><Briefcase className="h-3 w-3"/>{category}</Badge>;
      case "General":
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  }

  const handleShare = async () => {
    // Trigger haptic feedback
    triggerHaptic('light');
    
    const postUrl = `${window.location.origin}/posts/${post.id}`;
    const shareData = {
      title: `Post by ${author?.name || 'a user'} on Yrdly`,
      text: post.text,
      url: postUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: "Post shared!" });
      } catch {
        // Don't show an error toast if the user cancels the share dialog
      }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        toast({ title: "Link copied!", description: "The post link has been copied to your clipboard." });
      } catch {
        toast({ variant: "destructive", title: "Error", description: "Could not copy link to clipboard." });
      }
    }
  };
  
    const handleMessageSeller = async () => {
        if (!currentUser || !author || currentUser.id === author.id) return;

        // Trigger haptic feedback
        triggerHaptic('medium');

        const sortedParticipantIds = [currentUser.id, author.id].sort();
        
        try {
            // Check if conversation already exists
            const { data: existingConversations, error: fetchError } = await supabase
                .from('conversations')
                .select('id')
                .eq('participant_ids', sortedParticipantIds)
                .limit(1);

            if (fetchError) {
                console.error("Error fetching conversations:", fetchError);
                toast({ variant: "destructive", title: "Error", description: "Could not open conversation." });
                return;
            }

            let conversationId: string;

            if (existingConversations && existingConversations.length > 0) {
                conversationId = existingConversations[0].id;
            } else {
                // Create new conversation
                const { data: newConversation, error: createError } = await supabase
                    .from('conversations')
                    .insert({
                        participant_ids: sortedParticipantIds,
                        last_message: null,
                        created_at: new Date().toISOString(),
                    })
                    .select('id')
                    .single();

                if (createError) {
                    console.error("Error creating conversation:", createError);
                    toast({ variant: "destructive", title: "Error", description: "Could not create conversation." });
                    return;
                }

                conversationId = newConversation.id;
            }
            
            router.push(`/messages/${conversationId}`);
        } catch (error) {
            console.error("Error handling message action:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not open conversation." });
        }
    };

  const openProfile = () => {
    if (author && author.id !== currentUser?.id) {
        setSelectedUser(author);
    }
  };

  const renderMarketplaceContent = () => (
    <CardContent className="p-4 pt-2">
        <h2 className="text-3xl font-bold">{formatPrice(post.price)}</h2>
        <h3 className="text-xl font-semibold mt-2">{post.text}</h3>
        
        <div className="mt-6">
            <h4 className="font-semibold text-md mb-2">Description</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">{post.description || "No description provided."}</p>
        </div>
        
        <div className="mt-6 border-t pt-4">
            <h4 className="font-semibold text-md mb-2">Seller Information</h4>
            <button onClick={openProfile} className="flex items-center gap-3 hover:bg-muted p-2 rounded-lg w-full text-left">
                <Avatar>
                    <AvatarImage src={author?.avatarUrl} alt={author?.name} />
                    <AvatarFallback>{author?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{author?.name}</p>
                    <p className="text-xs text-muted-foreground">Joined {timeAgo(author?.timestamp ? (typeof author.timestamp === 'string' ? new Date(author.timestamp) : author.timestamp.toDate()) : null)}</p>
                </div>
            </button>
        </div>

        {currentUser?.id !== post.user_id && (
            <Button className="w-full mt-4" onClick={handleMessageSeller}>
                <MessageCircle className="mr-2 h-4 w-4" /> Message Seller
            </Button>
        )}

    </CardContent>
  );

  const renderDefaultContent = () => (
     <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-wrap">{post.text}</p>
        {post.eventLocation && (
            <div className="flex items-center text-sm text-muted-foreground mt-2">
                <MapPin className="h-4 w-4 mr-1"/>
                <span>{post.eventLocation.address}</span>
            </div>
        )}
    </CardContent>
  );

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, a, [role="dialog"], [role="menu"]')) {
        return;
    }
    // also don't navigate if text is selected
    if (window.getSelection()?.toString()) {
        return;
    }

    if (!isCommentsOpen) {
      router.push(`/posts/${post.id}`);
    }
  };

  return (
    <Card className="overflow-hidden">
       <div onClick={handleCardClick} className="cursor-pointer">
      {selectedUser && (
          <UserProfileDialog 
              user={selectedUser} 
              open={!!selectedUser} 
              onOpenChange={(wasChanged) => {
                  if (wasChanged) {
                    // Logic to refetch or update state if a change (like block/unfriend) happened
                  }
                  setSelectedUser(null)
              }} 
          />
      )}
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        {loadingAuthor ? (
            <div className="flex items-center gap-4 w-full">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[100px]" />
                </div>
            </div>
        ) : author ? (
            <>
                <button onClick={openProfile} className="cursor-pointer">
                    <Avatar>
                        <AvatarImage src={author.avatarUrl} alt={author.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{author.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </button>
                <div className="flex-1">
                    <button onClick={openProfile} className="cursor-pointer">
                        <p className="font-semibold hover:underline">{author.name}</p>
                    </button>
                    <p className="text-xs text-muted-foreground">{timeAgo(post.timestamp ? new Date(post.timestamp) : null)}</p>
                </div>
                {getCategoryBadge(post.category)}
            </>
        ) : null}
        {currentUser?.id === post.user_id && (
             <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-auto">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         <CreatePostDialog postToEdit={post}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </DropdownMenuItem>
                        </CreatePostDialog>
                         <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your post and all its comments.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
      </CardHeader>

      <Collapsible open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        {post.image_urls && post.image_urls.length > 0 && (
            <div className="relative w-full aspect-video">
            <Image
                src={post.image_urls[0]}
                alt="Post image"
                fill
                className="object-cover"
                priority
                data-ai-hint="neighborhood street"
            />
            </div>
        )}
        
        {post.category === 'For Sale' ? renderMarketplaceContent() : renderDefaultContent()}

        <CardFooter className="p-2 bg-background/50">
            <div className="flex justify-around w-full">
            <Button variant="ghost" className="flex-1 gap-2" onClick={handleLike}>
                <Heart className={`h-5 w-5 ${isLiked ? "text-red-500 fill-current" : ""}`} />
                <span className="text-sm">{likes}</span>
            </Button>
             <CollapsibleTrigger asChild>
                 <Button variant="ghost" className="flex-1 gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm">{commentCount}</span>
                </Button>
             </CollapsibleTrigger>
            <Button variant="ghost" className="flex-1 gap-2" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
                <span className="text-sm">Share</span>
            </Button>
            </div>
        </CardFooter>
        <CollapsibleContent>
            <div className="p-4 pt-0">
                <CommentSection postId={post.id} />
            </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
    </Card>
  );
}
