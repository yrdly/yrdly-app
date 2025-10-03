"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface PostSkeletonProps {
  showImage?: boolean;
  showMultipleImages?: boolean;
  className?: string;
}

export function PostSkeleton({ 
  showImage = true, 
  showMultipleImages = false,
  className 
}: PostSkeletonProps) {
  return (
    <Card className={`overflow-hidden mb-4 ${className}`}>
      <CardHeader className="flex flex-row items-center gap-3 p-3 pb-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </CardHeader>

      {showImage && (
        <div className="px-3 pb-2">
          {showMultipleImages ? (
            <div className="grid gap-1 grid-cols-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="aspect-square rounded-lg" />
            </div>
          ) : (
            <Skeleton className="w-full aspect-video rounded-lg" />
          )}
        </div>
      )}

      <CardContent className="p-3 pt-0">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-2 bg-background/50">
        <div className="flex justify-around w-full">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardFooter>
    </Card>
  );
}

export function MarketplaceItemSkeleton({ className }: { className?: string }) {
  return (
    <Card className={`overflow-hidden group ${className}`}>
      <CardContent className="p-0">
        <Skeleton className="w-full aspect-square" />
      </CardContent>
      <CardFooter className="p-3 flex-col items-start space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-20" />
      </CardFooter>
    </Card>
  );
}

export function BusinessCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={`overflow-hidden flex flex-col h-full ${className}`}>
      <Skeleton className="w-full aspect-video" />
      <CardHeader className="flex-row items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardFooter>
    </Card>
  );
}

export function EventCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={`flex flex-col ${className}`}>
      <Skeleton className="w-full h-48 rounded-t-lg" />
      <CardHeader>
        <div className="flex items-center space-x-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center mt-auto">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-20" />
      </CardFooter>
    </Card>
  );
}


