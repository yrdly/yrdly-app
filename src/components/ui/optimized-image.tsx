"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useImageOptimization } from '@/hooks/use-image-optimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  showSkeleton?: boolean;
  skeletonClassName?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  quality = 85,
  sizes,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc = '/placeholder.svg',
  showSkeleton = true,
  skeletonClassName,
  ...props
}: OptimizedImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    imageSrc,
    isLoading,
    hasError,
    isInView,
    handleLoad,
    handleError
  } = useImageOptimization({
    src,
    fallbackSrc,
    onLoad,
    onError,
    priority
  });

  // Generate a simple blur data URL if none provided
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

  return (
    <div 
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      data-image-src={src}
    >
      {isLoading && showSkeleton && (
        <Skeleton 
          className={cn(
            'absolute inset-0 z-10',
            fill ? 'w-full h-full' : '',
            skeletonClassName
          )}
          style={!fill ? { width, height } : undefined}
        />
      )}
      
      {isInView && imageSrc && (
        <Image
          src={imageSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          priority={priority}
          quality={quality}
          sizes={sizes}
          placeholder={placeholder}
          blurDataURL={blurDataURL || defaultBlurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="w-8 h-8 mx-auto mb-2 opacity-50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
            </div>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Specialized components for common use cases
export function PostImage({ 
  src, 
  alt, 
  className,
  onClick,
  ...props 
}: Omit<OptimizedImageProps, 'fill' | 'sizes'> & { onClick?: () => void }) {
  return (
    <div 
      className={cn('relative w-full aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity', className)}
      onClick={onClick}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        {...props}
      />
    </div>
  );
}

export function AvatarImage({ 
  src, 
  alt, 
  className,
  size = 40,
  ...props 
}: Omit<OptimizedImageProps, 'fill' | 'width' | 'height'> & { size?: number }) {
  return (
    <div className={cn('relative rounded-full overflow-hidden', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        sizes={`${size}px`}
        className="object-cover"
        {...props}
      />
    </div>
  );
}

export function MarketplaceImage({ 
  src, 
  alt, 
  className,
  onClick,
  ...props 
}: Omit<OptimizedImageProps, 'fill' | 'sizes'> & { onClick?: () => void }) {
  return (
    <div 
      className={cn('relative w-full aspect-square overflow-hidden cursor-pointer group', className)}
      onClick={onClick}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        {...props}
      />
    </div>
  );
}

export function BusinessImage({ 
  src, 
  alt, 
  className,
  ...props 
}: Omit<OptimizedImageProps, 'fill' | 'sizes'>) {
  return (
    <div className={cn('relative w-full aspect-video overflow-hidden', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        className="object-cover"
        {...props}
      />
    </div>
  );
}
