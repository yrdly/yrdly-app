
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center p-8">
            <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4 w-fit">
                    <Calendar className="h-10 w-10" />
                </div>
                <CardTitle>Events Coming Soon!</CardTitle>
                <CardDescription>This is where you'll find out about community gatherings and local events.</CardDescription>
            </CardHeader>
        </Card>
    </div>
  );
}
