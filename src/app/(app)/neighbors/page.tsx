
"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, query, where, onSnapshot, getDocs, addDoc, serverTimestamp, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, UserPlus, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const NeighborSkeleton = () => (
    <Card>
        <CardContent className="p-4 flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-10 w-28" />
        </CardContent>
    </Card>
)

export default function NeighborsPage() {
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [allNeighbors, setAllNeighbors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [locationFilter, setLocationFilter] = useState("all");

    useEffect(() => {
        if (!currentUser) return;
        
        // Fetch all users except the current user
        const q = query(collection(db, "users"), where("uid", "!=", currentUser.uid));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const usersData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as User));
            setAllNeighbors(usersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const locations = useMemo(() => {
        const uniqueLocations = new Set(allNeighbors.map(n => n.location).filter(Boolean));
        return ["all", ...Array.from(uniqueLocations)];
    }, [allNeighbors]);

    const filteredNeighbors = useMemo(() => {
        if (locationFilter === 'all') {
            return allNeighbors;
        }
        return allNeighbors.filter(neighbor => neighbor.location === locationFilter);
    }, [allNeighbors, locationFilter]);


    const handleStartConversation = async (neighbor: User) => {
        if (!currentUser) {
            toast({ variant: "destructive", title: "You must be logged in." });
            return;
        }

        const conversationsRef = collection(db, "conversations");

        // Check if a conversation between these two users already exists
        const existingConvQuery = query(
            conversationsRef,
            where('participantIds', 'array-contains', currentUser.uid)
        );

        const querySnapshot = await getDocs(existingConvQuery);
        let existingConvId: string | null = null;
        
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.participantIds.includes(neighbor.uid)) {
                existingConvId = doc.id;
            }
        });

        if (existingConvId) {
            // If conversation exists, navigate to it
            router.push(`/messages?convId=${existingConvId}`);
        } else {
            // If not, create a new conversation
            try {
                const newConvDoc = await addDoc(conversationsRef, {
                    participantIds: [currentUser.uid, neighbor.uid],
                    createdAt: serverTimestamp(),
                    lastMessage: null,
                });
                router.push(`/messages?convId=${newConvDoc.id}`);
            } catch (error) {
                console.error("Error creating conversation: ", error);
                toast({ variant: "destructive", title: "Error", description: "Could not start a conversation." });
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-headline">Find Neighbors</h1>
                    <p className="text-muted-foreground">Connect with other members of your community.</p>
                </div>
                <Select onValueChange={setLocationFilter} defaultValue="all">
                    <SelectTrigger className="w-full md:w-[240px]">
                        <SelectValue placeholder="Filter by location" />
                    </SelectTrigger>
                    <SelectContent>
                        {locations.map(loc => (
                             <SelectItem key={loc} value={loc}>
                                {loc === 'all' ? 'All Locations' : loc}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="space-y-4">
                    <NeighborSkeleton />
                    <NeighborSkeleton />
                    <NeighborSkeleton />
                </div>
            ) : filteredNeighbors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredNeighbors.map(neighbor => (
                        <Card key={neighbor.id}>
                            <CardContent className="p-4 flex items-start gap-4">
                                <Avatar className="h-16 w-16 border">
                                    <AvatarImage src={neighbor.avatarUrl} alt={neighbor.name} />
                                    <AvatarFallback>{neighbor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-semibold text-lg">{neighbor.name}</h3>
                                    {neighbor.location && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4 mr-1"/>
                                            <span>{neighbor.location}</span>
                                        </div>
                                    )}
                                    <p className="text-sm text-muted-foreground pt-1">{neighbor.bio || "No bio yet."}</p>
                                </div>
                                <Button size="sm" onClick={() => handleStartConversation(neighbor)}>
                                    <MessageSquare className="mr-2 h-4 w-4" /> Message
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center p-16">
                     <div className="flex justify-center mb-4">
                        <UserPlus className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">No neighbors found</h2>
                    <p className="text-muted-foreground">
                        {locationFilter === 'all' 
                            ? "You're the first one here! Check back soon to see other neighbors as they join."
                            : "No neighbors found for this location. Try another filter."
                        }
                    </p>
                </Card>
            )}
        </div>
    );
}
