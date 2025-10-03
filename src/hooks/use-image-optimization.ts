"use client";

import { useState, useEffect, useCallback } from 'react';

interface UseImageOptimizationOptions {
  src: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
}

export function useImageOptimization({
  src,
  fallbackSrc = '/placeholder.svg',
  onLoad,
  onError,
  priority = false
}: UseImageOptimizationOptions) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    const element = document.querySelector(`[data-image-src="${src}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [src, priority, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setIsLoading(true);
    }
    
    onError?.();
  }, [fallbackSrc, imageSrc, onError]);

  // Reset state when src changes
  useEffect(() => {
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  return {
    imageSrc: isInView ? imageSrc : undefined,
    isLoading: isInView ? isLoading : true,
    hasError,
    isInView,
    handleLoad,
    handleError
  };
}

// Hook for preloading critical images
export function useImagePreloader() {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        setPreloadedImages(prev => new Set([...prev, src]));
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, [preloadedImages]);

  const preloadImages = useCallback(async (srcs: string[]): Promise<void> => {
    const promises = srcs.map(src => preloadImage(src));
    await Promise.allSettled(promises);
  }, [preloadImage]);

  return {
    preloadImage,
    preloadImages,
    preloadedImages: Array.from(preloadedImages)
  };
}

// Hook for responsive image loading
export function useResponsiveImage(src: string, sizes?: string) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    if (!sizes) return;

    // Generate responsive srcset based on device sizes
    const deviceSizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
    const imageSizes = [16, 32, 48, 64, 96, 128, 256, 384];
    
    // This would typically be handled by Next.js Image component
    // but we can provide fallback logic here
    setCurrentSrc(src);
  }, [src, sizes]);

  return currentSrc;
}


