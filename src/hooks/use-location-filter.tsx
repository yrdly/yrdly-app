'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-supabase-auth';
import { LocationScopeService } from '@/lib/location-scope-service';

export interface UseLocationFilterReturn {
  state: string | null;
  lga: string | null;
  ward: string | null;
  setFilter: (state?: string | null, lga?: string | null, ward?: string | null) => void;
  reset: () => void;
  isDefault: boolean;
}

/**
 * Hook to manage location filter state
 * Defaults to user's location from profile
 * Allows temporary override for viewing content from other locations
 */
export function useLocationFilter(): UseLocationFilterReturn {
  const { profile } = useAuth();
  const [state, setState] = useState<string | null>(null);
  const [lga, setLga] = useState<string | null>(null);
  const [ward, setWard] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with user's location from profile
  useEffect(() => {
    if (!isInitialized && profile) {
      const userState = LocationScopeService.getUserState(profile);
      const userLga = LocationScopeService.getUserLga(profile);
      const userWard = LocationScopeService.getUserWard(profile);
      
      setState(userState);
      setLga(userLga);
      setWard(userWard);
      setIsInitialized(true);
    }
  }, [profile, isInitialized]);

  // Update when profile changes (if still using default)
  useEffect(() => {
    if (isInitialized) {
      const userState = LocationScopeService.getUserState(profile);
      const userLga = LocationScopeService.getUserLga(profile);
      const userWard = LocationScopeService.getUserWard(profile);
      
      // Only update if we're still using default (not overridden)
      // Check if current state matches user's state (meaning we're using default)
      if (state === userState || (state === null && userState === null)) {
        setState(userState);
        setLga(userLga);
        setWard(userWard);
      }
    }
  }, [profile, isInitialized, state]);

  const setFilter = useCallback((newState?: string | null, newLga?: string | null, newWard?: string | null) => {
    if (newState !== undefined) {
      setState(newState);
    }
    if (newLga !== undefined) {
      setLga(newLga);
    }
    if (newWard !== undefined) {
      setWard(newWard);
    }
    setIsInitialized(true);
  }, []);

  const reset = useCallback(() => {
    const userState = LocationScopeService.getUserState(profile);
    const userLga = LocationScopeService.getUserLga(profile);
    const userWard = LocationScopeService.getUserWard(profile);
    
    setState(userState);
    setLga(userLga);
    setWard(userWard);
  }, [profile]);

  const userState = LocationScopeService.getUserState(profile);
  const isDefault = state === userState || (state === null && userState === null);

  return {
    state,
    lga,
    ward,
    setFilter,
    reset,
    isDefault,
  };
}

