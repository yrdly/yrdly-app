
"use client";

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post as PostType } from '@/types';
import { PostCard } from '@/components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function PostPage({ params }: { params: { postId: string } }) {
    const [post, setPost] = useState<PostType | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!params.postId) {
            setLoading(false);
            return;
        }

        const postRef = doc(db, 'posts', params.postId);
        const unsubscribe = onSnapshot(postRef, (docSnap) => {
            if (docSnap.exists()) {
                setPost({ id: docSnap.id, ...docSnap.data() } as PostType);
            } else {
                // Handle case where post doesn't exist, maybe redirect
                router.push('/home');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [params.postId, router]);

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-4">
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }
    
    if (!post) {
        return (
            <div className="max-w-2xl mx-auto text-center py-10">
                <h1 className="text-2xl font-bold">Post not found</h1>
                <p className="text-muted-foreground">The post you are looking for does not exist or has been deleted.</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <PostCard post={post} />
        </div>
    );
}
