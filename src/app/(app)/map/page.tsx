
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Loader2 } from "lucide-react";
import Image from "next/image";
import { PostCard } from "@/components/PostCard";
import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Post as PostType } from "@/types";

// A simple hashing function to generate a consistent position for a given post ID
const simpleHash = (s: string) => {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        const char = s.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

const generatePosition = (postId: string) => {
    const hash = simpleHash(postId);
    // Use hash to generate deterministic, but pseudo-random-looking positions
    const top = (Math.abs(hash) % 80) + 10; // Position between 10% and 90%
    const left = (Math.abs(simpleHash(postId.split("").reverse().join(""))) % 80) + 10; // Use a different hash for left
    return { top: `${top}%`, left: `${left}%` };
};


export default function MapPage() {
  const [allPosts, setAllPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, "posts"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as PostType))
        .filter(post => post.location); // Only include posts that have a location

      setAllPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredPosts = useMemo(() => {
    if (categoryFilter === 'all') {
      return allPosts;
    }
    return allPosts.filter(post => post.category === categoryFilter);
  }, [allPosts, categoryFilter]);

  const mapPins = useMemo(() => {
    return filteredPosts.map(post => ({
      ...post,
      position: generatePosition(post.id)
    }));
  }, [filteredPosts]);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold font-headline">Neighborhood Map</h1>
            <p className="text-muted-foreground">See what's happening around you.</p>
        </div>
        <div className="flex items-center gap-4">
            <Select onValueChange={setCategoryFilter} defaultValue="all">
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Posts</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Event">Events</SelectItem>
                    <SelectItem value="For Sale">For Sale</SelectItem>
                </SelectContent>
            </Select>
        </div>
       </div>

      <Card>
        <CardContent className="p-4">
            <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-muted">
                <Image src="https://placehold.co/1200x800.png" fill objectFit="cover" alt="Neighborhood map" data-ai-hint="city map" />

                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    mapPins.map(pin => (
                        <Popover key={pin.id}>
                            <PopoverTrigger asChild>
                                 <Button 
                                    variant="secondary" 
                                    size="icon" 
                                    className="absolute rounded-full w-10 h-10 shadow-lg border-2 border-background" 
                                    style={{ top: pin.position.top, left: pin.position.left, transform: 'translate(-50%, -50%)' }}
                                 >
                                    <MapPin className="h-5 w-5 text-primary" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0">
                                <PostCard post={pin} />
                            </PopoverContent>
                        </Popover>
                    ))
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
