
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function MarketplacePage() {
  return (
    <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center p-8">
            <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4 w-fit">
                    <ShoppingCart className="h-10 w-10" />
                </div>
                <CardTitle>Marketplace Coming Soon!</CardTitle>
                <CardDescription>This is where you'll be able to buy and sell items with your neighbors.</CardDescription>
            </CardHeader>
        </Card>
    </div>
  );
}
