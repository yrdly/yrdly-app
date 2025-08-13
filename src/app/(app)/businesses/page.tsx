"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import type { Business } from "@/types";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

function BusinessCard({ business }: { business: Business }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{business.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{business.category}</p>
            </CardHeader>
            <CardContent>
                <p>{business.description}</p>
                <div className="flex items-center text-sm text-muted-foreground mt-4">
                    <MapPin className="h-4 w-4 mr-1"/>
                    <span>{business.location.address}</span>
                </div>
            </CardContent>
        </Card>
    )
}

function EmptyBusinesses() {
    return (
        <div className="text-center py-16">
            <div className="inline-block bg-muted p-4 rounded-full mb-4">
                <Briefcase className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">No businesses yet</h2>
            <p className="text-muted-foreground mt-2 mb-6">Be the first to add a local business to the directory!</p>
             <Link href="/businesses/add">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Business
                </Button>
            </Link>
        </div>
    )
}

export default function BusinessesPage() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "businesses"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const businessesData = querySnapshot.docs.map(doc => {
                 const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                } as Business;
            });
            setBusinesses(businessesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline">Local businesses</h1>
            <p className="text-muted-foreground">Discover and support businesses in your neighborhood.</p>
        </div>
         <Link href="/businesses/add">
            <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Business
            </Button>
        </Link>
       </div>

        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search businesses..." className="pl-10" />
        </div>
        
        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        ) : businesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {businesses.map(business => (
                    <BusinessCard key={business.id} business={business} />
                ))}
            </div>
        ) : (
            <EmptyBusinesses />
        )}

    </div>
  );
}