import { useState, useEffect, useCallback } from 'react';
// Removed Firebase imports - using Supabase

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isFirestoreOnline, setIsFirestoreOnline] = useState(true);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    // Supabase handles network status automatically
    setIsFirestoreOnline(true);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    // Supabase handles offline state automatically
  }, []);

  const toggleFirestoreNetwork = useCallback(async (enable: boolean) => {
    try {
      // Supabase handles network status automatically
      setIsFirestoreOnline(enable);
    } catch (error) {
      console.error('Error toggling network status:', error);
    }
  }, []);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return {
    isOnline,
    isFirestoreOnline,
    toggleFirestoreNetwork,
    // Helper to check if we should show offline UI
    shouldShowOfflineUI: !isOnline || !isFirestoreOnline,
    // Helper to check if we can make network requests
    canMakeRequests: isOnline
  };
}

