
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { CalendarDays, MapPin, Users, Plus, Search } from "lucide-react";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { useState, useEffect } from "react";
import type { Post as PostType } from "@/types";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

function EmptyEvents() {
    return (
        <div className="text-center py-16">
            <div className="inline-block bg-muted p-4 rounded-full mb-4">
                <CalendarDays className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">No upcoming events</h2>
            <p className="text-muted-foreground mt-2 mb-6">Be the first to organize something in your neighborhood!</p>
            {/* The button is now only in the header */}
        </div>
    )
}

export default function EventsPage() {
    const [events, setEvents] = useState<PostType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateEvent, setShowCreateEvent] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('category', 'Event')
                    .order('timestamp', { ascending: false });

                if (error) {
                    console.error('Error fetching events:', error);
                    return;
                }

                setEvents(data as PostType[] || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events:', error);
                setLoading(false);
            }
        };

        fetchEvents();

        // Set up real-time subscription
        const channel = supabase
            .channel('events')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'posts',
                filter: 'category=eq.Event'
            }, (payload) => {
                console.log('Events realtime change received!', payload);
                
                if (payload.eventType === 'INSERT') {
                    // Add new event to the beginning of the list
                    const newEvent = payload.new as PostType;
                    setEvents(prevEvents => [newEvent, ...prevEvents]);
                } else if (payload.eventType === 'UPDATE') {
                    // Update existing event in the list
                    const updatedEvent = payload.new as PostType;
                    setEvents(prevEvents => 
                        prevEvents.map(event => 
                            event.id === updatedEvent.id ? updatedEvent : event
                        )
                    );
                } else if (payload.eventType === 'DELETE') {
                    // Remove deleted event from the list
                    const deletedId = payload.old.id;
                    setEvents(prevEvents => 
                        prevEvents.filter(event => event.id !== deletedId)
                    );
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredEvents = events.filter(event =>
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.event_location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const featuredEvent = filteredEvents[0];
    const upcomingEvents = filteredEvents.slice(1);

    const formatEventDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays <= 7) return 'This Week';
        if (diffDays <= 14) return 'Next Week';
        return date.toLocaleDateString();
    };

    const handleRSVP = (eventId: string) => {
        // TODO: Implement RSVP functionality
        console.log('RSVP to event:', eventId);
    };

    if (loading) {
        return (
            <div className="p-4 space-y-6 pb-24">
                <div className="space-y-3">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-12 w-full" />
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="p-4">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 pb-24">
            {/* Page Header */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Events</h2>
                        <p className="text-muted-foreground">Discover events in your neighborhood</p>
                    </div>
                    <Button 
                        className="bg-primary text-primary-foreground hover:bg-primary/90 yrdly-shadow"
                        onClick={() => setShowCreateEvent(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search events..." 
                        className="pl-10 bg-background border-border"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredEvents.length === 0 ? (
                <EmptyEvents />
            ) : (
                <>
                    {/* Featured Event */}
                    {featuredEvent && (
                        <Card className="p-0 overflow-hidden yrdly-shadow-lg border-0">
                            <div className="yrdly-gradient p-6 text-white">
                                <div className="flex items-center gap-3 mb-4">
                                    <Avatar className="w-12 h-12 border-2 border-white/20">
                                        <AvatarImage src={featuredEvent.author_image || "/placeholder.svg"} />
                                        <AvatarFallback className="bg-white/20 text-white">
                                            {featuredEvent.author_name?.substring(0, 2).toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold">{featuredEvent.author_name || 'User'}</h3>
                                        <p className="text-white/80 text-sm">
                                            {new Date(featuredEvent.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Badge className="ml-auto bg-white/20 text-white border-white/20">Featured</Badge>
                                </div>
                                <h4 className="text-xl font-bold mb-2">{featuredEvent.title}</h4>
                                <p className="text-white/90 mb-4">{featuredEvent.content}</p>
                            </div>
                            <div className="p-6 bg-white space-y-4">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="text-sm">{featuredEvent.event_location?.address || 'Lagos, Nigeria'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <CalendarDays className="w-4 h-4 text-accent" />
                                    <span className="text-sm">
                                        {new Date(featuredEvent.event_date || featuredEvent.timestamp).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary" />
                                        <span className="text-sm text-muted-foreground">
                                            {featuredEvent.attendees_count || 0} attending
                                        </span>
                                    </div>
                                    <Button 
                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        onClick={() => handleRSVP(featuredEvent.id)}
                                    >
                                        RSVP
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Upcoming Events */}
                    {upcomingEvents.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Upcoming Events</h3>

                            {upcomingEvents.map((event) => (
                                <Card key={event.id} className="p-4 yrdly-shadow">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={event.author_image || "/placeholder.svg"} />
                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                {event.author_name?.substring(0, 2).toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-foreground">{event.title}</h4>
                                                <Badge variant="outline" className="text-primary border-primary bg-primary/10">
                                                    {formatEventDate(event.event_date || event.timestamp)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{event.content}</p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{event.event_location?.address || 'Lagos, Nigeria'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    <span>{event.attendees_count || 0} attending</span>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                                                onClick={() => handleRSVP(event.id)}
                                            >
                                                RSVP
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Create Event Modal */}
            <CreateEventDialog 
                open={showCreateEvent} 
                onOpenChange={setShowCreateEvent} 
            />
        </div>
    );
}
