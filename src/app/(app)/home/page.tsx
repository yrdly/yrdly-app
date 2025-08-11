
"use client";

import { PostCard } from "@/components/PostCard";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Post as PostType, User } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      setLoading(true);
      const postsData: PostType[] = [];
      for (const postDoc of querySnapshot.docs) {
        const data = postDoc.data();
        let user: User | null = null;
        
        // Check if user is a subcollection or a reference
        if (data.userRef) {
            const userSnap = await getDoc(data.userRef);
            if (userSnap.exists()) {
                user = userSnap.data() as User;
            }
        } else if (data.user) { // Fallback for embedded user object
            user = data.user
        }
        
        if (user) {
            postsData.push({ 
              id: postDoc.id, 
              ...data,
              user: user,
              timestamp: data.timestamp?.toDate().toLocaleString() ?? new Date().toLocaleString(),
              comments: data.comments || [],
            } as PostType);
        }
      };
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-4">
           <CreatePostDialog />
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}
