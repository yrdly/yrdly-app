import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { PostCard } from "@/components/PostCard";
import { posts } from "@/lib/mock-data";


const mapPins = [
    { id: 'p1', top: '25%', left: '30%', post: posts[0] },
    { id: 'p2', top: '50%', left: '55%', post: posts[1] },
    { id: 'p3', top: '65%', left: '20%', post: posts[2] },
]

export default function MapPage() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold font-headline">Neighborhood Map</h1>
            <p className="text-muted-foreground">See what's happening around you.</p>
        </div>
        <div className="flex items-center gap-4">
            <Select>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Posts</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="event">Events</SelectItem>
                    <SelectItem value="for-sale">For Sale</SelectItem>
                </SelectContent>
            </Select>
        </div>
       </div>

      <Card>
        <CardContent className="p-4">
            <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-muted">
                <Image src="https://placehold.co/1200x800.png" fill objectFit="cover" alt="Neighborhood map" data-ai-hint="city map" />

                {mapPins.map(pin => (
                    <Popover key={pin.id}>
                        <PopoverTrigger asChild>
                             <Button 
                                variant="secondary" 
                                size="icon" 
                                className="absolute rounded-full w-10 h-10 shadow-lg border-2 border-background" 
                                style={{ top: pin.top, left: pin.left }}
                             >
                                <MapPin className="h-5 w-5 text-primary" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0">
                            <PostCard post={pin.post} />
                        </PopoverContent>
                    </Popover>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
