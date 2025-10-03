
"use client";

import { Button } from "@/components/ui/button";

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';
import { Input } from "@/components/ui/input";
import { Search, Plus, Briefcase, Star } from "lucide-react";
import { useState, useEffect } from "react";
import type { Business } from "@/types";
import { supabase } from "@/lib/supabase";
import { BusinessCardSkeleton } from "@/components/ui/post-skeleton";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { BusinessImage, AvatarImage } from "@/components/ui/optimized-image";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-supabase-auth";
import { CreateBusinessDialog } from "@/components/CreateBusinessDialog";
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
import { usePosts } from "@/hooks/use-posts";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

function BusinessCard({ business }: { business: Business }) {
    const { user } = useAuth();
    const { deleteBusiness } = usePosts();

    const handleDelete = () => {
        deleteBusiness(business.id);
    }

    return (
        <Card className="overflow-hidden flex flex-col h-full group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            {business.image_urls && business.image_urls.length > 0 ? (
                business.image_urls.length > 1 ? (
                    <Carousel className="w-full">
                        <CarouselContent>
                            {business.image_urls.map((url, index) => (
                                <CarouselItem key={index}>
                                    <AspectRatio ratio={16 / 9}>
                                        <BusinessImage
                                            src={url}
                                            alt={`${business.name} image ${index + 1}`}
                                            className="absolute inset-0 group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </AspectRatio>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Carousel>
                ) : (
                    <AspectRatio ratio={16 / 9}>
                        <BusinessImage
                            src={business.image_urls[0]}
                            alt={`${business.name} image 1`}
                            className="absolute inset-0 group-hover:scale-105 transition-transform duration-300"
                        />
                    </AspectRatio>
                )
            ) : (
                <AspectRatio ratio={16/9}>
                    <div className="bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center h-full group-hover:from-primary/10 group-hover:to-primary/5 transition-colors">
                        <Briefcase className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                </AspectRatio>
            )}
           
            <CardHeader className="flex-row items-start justify-between p-4 pb-3">
                <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors truncate">{business.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">{business.category}</CardDescription>
                </div>
                {user?.id === business.owner_id && (
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <CreateBusinessDialog postToEdit={business}>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                </CreateBusinessDialog>
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
                                    This action cannot be undone. This will permanently delete this business listing.
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
            <CardContent className="flex-grow p-4 pt-0">
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{business.description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-3 border-t border-border/50 bg-muted/30">
                 <div className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0"/>
                    <span className="truncate font-medium">{business.location.address}</span>
                </div>
            </CardFooter>
        </Card>
    )
}

function EmptyBusinesses() {
    return (
        <div className="text-center py-20">
            <div className="inline-block bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-2xl mb-6 shadow-sm">
                <Briefcase className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-3">No businesses yet</h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">Be the first to add a local business to the directory and help your neighbors discover great places!</p>
            <CreateBusinessDialog>
                <Button size="lg" className="shadow-sm">
                    <Plus className="mr-2 h-5 w-5" />
                    Add Your Business
                </Button>
            </CreateBusinessDialog>
        </div>
    )
}

export default function BusinessesPage() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryCounts, setCategoryCounts] = useState({
        food: 0,
        retail: 0,
        fitness: 0,
        beauty: 0
    });

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const { data, error } = await supabase
                    .from('businesses')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching businesses:', error);
                    return;
                }

                setBusinesses(data as Business[]);

                // Calculate category counts
                const counts = {
                    food: data?.filter(b => b.category?.toLowerCase().includes('food') || b.category?.toLowerCase().includes('restaurant')).length || 0,
                    retail: data?.filter(b => b.category?.toLowerCase().includes('retail') || b.category?.toLowerCase().includes('shop')).length || 0,
                    fitness: data?.filter(b => b.category?.toLowerCase().includes('fitness') || b.category?.toLowerCase().includes('gym')).length || 0,
                    beauty: data?.filter(b => b.category?.toLowerCase().includes('beauty') || b.category?.toLowerCase().includes('salon')).length || 0,
                };
                setCategoryCounts(counts);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching businesses:', error);
                setLoading(false);
            }
        };

        fetchBusinesses();

        // Set up real-time subscription
        const channel = supabase
            .channel('businesses')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'businesses'
            }, () => {
                fetchBusinesses();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Local Businesses</h2>
            <p className="text-muted-foreground">Discover and support businesses in your neighborhood</p>
          </div>
          <CreateBusinessDialog>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 yrdly-shadow">
              <Plus className="w-4 h-4 mr-2" />
              Add Business
            </Button>
          </CreateBusinessDialog>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search businesses..." className="pl-10 bg-card border-border focus:border-primary" />
        </div>
      </div>

      {/* Featured Business */}
      {businesses.length > 0 && (
        <Card className="p-0 overflow-hidden yrdly-shadow">
          <div className="relative h-32">
            <img
              src={businesses[0].image_urls?.[0] || "/placeholder.svg"}
              alt={businesses[0].name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-xl font-bold">{businesses[0].name}</h3>
              <p className="text-sm text-white/90">{businesses[0].category}</p>
            </div>
            <Button
              size="sm"
              className="absolute bottom-4 right-4 bg-white text-primary hover:bg-white/90"
            >
              Visit
            </Button>
          </div>
        </Card>
      )}

      {/* Business Categories */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Categories</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 yrdly-shadow hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-lg">🍽️</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Food & Dining</h4>
                <p className="text-sm text-muted-foreground">{categoryCounts.food} businesses</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 yrdly-shadow hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <span className="text-lg">🛍️</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Retail</h4>
                <p className="text-sm text-muted-foreground">{categoryCounts.retail} businesses</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 yrdly-shadow hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <span className="text-lg">💪</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Health & Fitness</h4>
                <p className="text-sm text-muted-foreground">{categoryCounts.fitness} businesses</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 yrdly-shadow hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <span className="text-lg">✂️</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Beauty</h4>
                <p className="text-sm text-muted-foreground">{categoryCounts.beauty} businesses</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Nearby Businesses */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Nearby Businesses</h3>

        {loading ? (
          <div className="space-y-4">
            <BusinessCardSkeleton />
            <BusinessCardSkeleton />
            <BusinessCardSkeleton />
          </div>
        ) : businesses.length > 0 ? (
          businesses.map((business) => (
            <Card key={business.id} className="p-4 yrdly-shadow">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={business.image_urls?.[0] || "/placeholder.svg"}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-foreground truncate">{business.name}</h4>
                    <Badge variant="outline" className="text-primary border-primary bg-primary/10 flex-shrink-0">
                      {business.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">4.5</span>
                    </div>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">0.3 km away</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{business.description}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => console.log('Visit business:', business.name)}
                    >
                      Visit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                    >
                      Call
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyBusinesses />
        )}
      </div>
    </div>
  );
}
