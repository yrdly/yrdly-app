
"use client";

import type { Post } from "@/types";
import { MarketplaceImage } from "@/components/ui/optimized-image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface MarketplaceItemCardProps {
    item: Post;
}

export function MarketplaceItemCard({ item }: MarketplaceItemCardProps) {

    return (
        <Link href={`/posts/${item.id}`}>
            <Card className="overflow-hidden group cursor-pointer">
                <CardContent className="p-0">
                    <MarketplaceImage
                        src={item.image_urls?.[0] || `https://placehold.co/400x400.png`}
                        alt={item.text}
                        data-ai-hint="product image"
                    />
                </CardContent>
                <CardFooter className="p-3 flex-col items-start">
                    <p className="font-semibold truncate w-full">{item.text}</p>
                    <p className="text-sm font-semibold">{formatPrice(item.price)}</p>
                </CardFooter>
            </Card>
        </Link>
    );
}
