"use client";

import type { Post as PostType } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, LinkIcon, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, deleteDoc, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { timeAgo } from "@/lib/utils";
import { useRouter } from "next/navigation";
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
import { CreateEventDialog } from "./CreateEventDialog";
import { useToast } from "@/hooks/use-toast";

interface EventCardProps {
  event: PostType;
}

export function EventCard({ event }: EventCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendeeCount, setAttendeeCount] = useState(event.attendees?.length || 0);
  const [isAttending, setIsAttending] = useState(event.attendees?.includes(user?.uid || '') || false);
  const [loadingAttending, setLoadingAttending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!event.id) return;
    const eventRef = doc(db, "posts", event.id);
    const unsubscribe = onSnapshot(eventRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentAttendees = data.attendees || [];
        setAttendeeCount(currentAttendees.length);
        if (user) {
          setIsAttending(currentAttendees.includes(user.uid));
        }
      }
    });
    return () => unsubscribe();
  }, [event.id, user]);

  const handleAttendingToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push('/login');
      return;
    }

    setLoadingAttending(true);
    const eventRef = doc(db, "posts", event.id);

    try {
      if (isAttending) {
        await updateDoc(eventRef, { attendees: arrayRemove(user.uid) });
      } else {
        await updateDoc(eventRef, { attendees: arrayUnion(user.uid) });
        // Add a document to the "mail" collection to trigger an email.
        if (user.email) {
            await addDoc(collection(db, "mail"), {
              to: [user.email],
              template: {
                name: "eventConfirmation", // Use a simple name for the template
                data: {
                  eventName: event.title,
                  eventDate: event.eventDate,
                  eventTime: event.eventTime,
                  eventLocation: event.eventLocation?.address,
                  eventUrl: `${window.location.origin}/posts/${event.id}`,
                },
              },
            });
        }
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
    } finally {
      setLoadingAttending(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !event.id || user.uid !== event.userId) return;
    try {
        await deleteDoc(doc(db, "posts", event.id));
        toast({ title: "Event deleted", description: "Your event has been successfully removed." });
        router.push('/events'); // Navigate back to events list after deletion
    } catch (error) {
        console.error("Error deleting event:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete event." });
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking on interactive elements
    if ((e.target as HTMLElement).closest('a, button, [role="menu"]')) {
      return;
    }
    router.push(`/posts/${event.id}`);
  };

  return (
    <Card className="flex flex-col">
      <div onClick={handleCardClick} className="cursor-pointer">
        {event.imageUrl && (
          <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
            <Image
              src={event.imageUrl}
              alt={event.title || event.text}
              fill
              style={{ objectFit: "cover" }}
              data-ai-hint="event image"
            />
          </div>
        )}
        <CardHeader>
           <div className="flex items-center space-x-3 mb-4">
               <Avatar>
                   <AvatarImage src={event.authorImage} alt={event.authorName} data-ai-hint="person portrait"/>
                   <AvatarFallback>{event.authorName.charAt(0)}</AvatarFallback>
               </Avatar>
               <div className="flex-1">
                  <p className="text-sm font-semibold">{event.authorName}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(event.timestamp?.toDate())}</p>
               </div>
               {user?.uid === event.userId && (
                 <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="ml-auto">
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                             <CreateEventDialog postToEdit={event}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                            </CreateEventDialog>
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
                            This action cannot be undone. This will permanently delete your event.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
               )}
           </div>
          <h3 className="text-xl font-semibold">{event.title}</h3>
          <p className="text-sm text-muted-foreground pt-1">{event.text}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {event.eventLocation && (
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="mr-2 h-4 w-4" /> {event.eventLocation.address}
            </div>
          )}
          {(event.eventDate || event.eventTime) && (
              <div className="flex items-center text-muted-foreground text-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  {event.eventDate} {event.eventDate && event.eventTime ? 'at' : ''} {event.eventTime}
              </div>
          )}
          {event.eventLink && (
            <div className="flex items-center text-sm">
              <LinkIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(event.eventLink, '_blank', 'noopener,noreferrer');
                }}
                className="text-blue-600 hover:underline truncate text-left bg-transparent border-none p-0 cursor-pointer"
              >
                {event.eventLink}
              </button>
            </div>
          )}
        </CardContent>
      </div>
      <CardFooter className="flex justify-between items-center mt-auto">
        <Button
          variant={isAttending ? "secondary" : "default"}
          onClick={handleAttendingToggle}
          disabled={loadingAttending || !user}
        >
          {isAttending ? "Attending" : "Attend"}
        </Button>
        <span className="text-sm text-muted-foreground">{attendeeCount} {attendeeCount === 1 ? 'attending' : 'attendees'}</span>
      </CardFooter>
    </Card>
  );
}