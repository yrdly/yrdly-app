
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Filter, Navigation, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Business, Post } from '@/types';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

type MarkerData = {
    id: string;
    type: 'event' | 'business';
    position: { lat: number; lng: number; };
    title: string;
    address: string;
};

export default function MapPage() {
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'events' | 'businesses'>('all');
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const fetchedMarkers: MarkerData[] = [];

            const { data: eventsData, error: eventsError } = await supabase
                .from('posts')
                .select('*')
                .eq('category', 'Event')
                .not('event_location', 'is', null);
            
            if (!eventsError && eventsData) {
                eventsData.forEach(post => {
                    if (post.event_location?.geopoint) {
                        fetchedMarkers.push({
                            id: post.id,
                            type: 'event',
                            position: { lat: post.event_location.geopoint.latitude, lng: post.event_location.geopoint.longitude },
                            title: post.title || post.text,
                            address: post.event_location.address,
                        });
                    }
                });
            }

            // Fetch businesses
            const { data: businessesData, error: businessesError } = await supabase
                .from('businesses')
                .select('*')
                .not('location', 'is', null);
            
            if (!businessesError && businessesData) {
                businessesData.forEach(business => {
                    if (business.location?.geopoint) {
                        fetchedMarkers.push({
                            id: business.id,
                            type: 'business',
                            position: { lat: business.location.geopoint.latitude, lng: business.location.geopoint.longitude },
                            title: business.name,
                            address: business.location.address,
                        });
                    }
                });
            }
            
            setMarkers(fetchedMarkers);
            setLoading(false);
        };

        fetchData();
    }, []);

    const handleMarkerClick = (marker: MarkerData) => {
        setSelectedMarker(marker);
    };
    
    const handleInfoWindowClose = () => {
        setSelectedMarker(null);
    };

    const handleViewDetails = (marker: MarkerData) => {
        if (marker.type === 'event') {
            router.push(`/posts/${marker.id}`);
        } else {
            // You might want to create a dedicated page for business details later
            router.push(`/businesses`);
        }
    };

    const filteredMarkers = markers.filter(marker => {
        if (filterType === 'events') return marker.type === 'event';
        if (filterType === 'businesses') return marker.type === 'business';
        return true;
    });

    const eventCount = markers.filter(m => m.type === 'event').length;
    const businessCount = markers.filter(m => m.type === 'business').length;

    return (
        <div className="h-screen relative">
            {loading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            )}

            {/* Search Overlay */}
            <div className="absolute top-4 left-4 right-4 z-10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search locations..." 
                        className="pl-10 bg-card/95 backdrop-blur-sm border-border"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Map Controls */}
            <div className="absolute top-20 right-4 z-10 space-y-2">
                <Button 
                    size="icon" 
                    className={`bg-card/95 backdrop-blur-sm border border-border text-foreground hover:bg-card ${filterType === 'all' ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setFilterType('all')}
                >
                    <Filter className="w-4 h-4" />
                </Button>
                <Button 
                    size="icon" 
                    className={`bg-card/95 backdrop-blur-sm border border-border text-foreground hover:bg-card ${filterType === 'events' ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setFilterType('events')}
                >
                    <Layers className="w-4 h-4" />
                </Button>
                <Button 
                    size="icon" 
                    className={`bg-card/95 backdrop-blur-sm border border-border text-foreground hover:bg-card ${filterType === 'businesses' ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setFilterType('businesses')}
                >
                    <Navigation className="w-4 h-4" />
                </Button>
            </div>

            {/* Map Container */}
            <div className="h-full w-full">
                <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['places']}>
                    <Map
                        defaultCenter={{ lat: 6.5244, lng: 3.3792 }} // Default to Lagos
                        defaultZoom={10}
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        mapId="7bdaf6c131a6958be5380043f"
                    >
                        {filteredMarkers.map(marker => (
                            <AdvancedMarker key={marker.id} position={marker.position} onClick={() => handleMarkerClick(marker)}>
                                <Pin 
                                    background={marker.type === 'business' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                                    borderColor={'hsl(var(--background))'}
                                    glyphColor={'hsl(var(--primary-foreground))'}
                                />
                            </AdvancedMarker>
                        ))}

                        {selectedMarker && (
                            <InfoWindow position={selectedMarker.position} onCloseClick={handleInfoWindowClose}>
                                <Card className="border-none shadow-none">
                                    <CardHeader className="p-2">
                                        <CardTitle className="text-base">{selectedMarker.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-2">
                                        <p className="text-sm text-muted-foreground">{selectedMarker.address}</p>
                                        <Button size="sm" className="mt-2 w-full" onClick={() => handleViewDetails(selectedMarker)}>
                                            View Details
                                        </Button>
                                    </CardContent>
                                </Card>
                            </InfoWindow>
                        )}
                    </Map>
                </APIProvider>
            </div>

            {/* Location Info Card */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
                <Card className="p-4 yrdly-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-foreground">Your Neighborhood</h4>
                            <p className="text-sm text-muted-foreground">Lagos, Nigeria</p>
                            <div className="flex gap-2 mt-1">
                                <Badge className="bg-primary text-primary-foreground text-xs">
                                    {eventCount} Events
                                </Badge>
                                <Badge className="bg-accent text-accent-foreground text-xs">
                                    {businessCount} Businesses
                                </Badge>
                            </div>
                        </div>
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                            Explore
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
