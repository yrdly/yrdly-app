
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post } from '@/types';
import { PostCard } from '@/components/PostCard';
import { EventCard } from '@/components/EventCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PostDetailPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const postRef = doc(db, 'posts', id);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          setPost({ id: postSnap.id, ...postSnap.data() } as Post);
        } else {
          setError('Post not found.');
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError('Failed to load the post.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const renderPost = () => {
    if (!post) return null;

    if (post.category === 'Event') {
      return <EventCard event={post} />;
    }
    return <PostCard post={post} />;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      )}

      {error && (
        <div className="text-center text-destructive p-4 border border-destructive/50 rounded-md">
          {error}
        </div>
      )}

      {!loading && !error && post && (
        renderPost()
      )}
    </div>
  );
}
