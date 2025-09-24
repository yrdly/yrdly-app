"use client";

import { useEffect, useState, createContext, useContext } from 'react';
import { useAuth as useSupabaseAuth } from '@/hooks/use-supabase-auth';
import type { User } from '@/types';
import { onlineStatusService } from '@/lib/online-status';

interface AuthContextType {
  user: any | null; // Supabase user
  userDetails: User | null;
  loading: boolean;
  pendingRequestCount: number;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userDetails: null, 
  loading: true,
  pendingRequestCount: 0 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useSupabaseAuth();
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  useEffect(() => {
    if (user) {
      // Initialize online status tracking
      onlineStatusService.initialize(user.id);

      // TODO: Implement friend request counting with Supabase
      // For now, set to 0
      setPendingRequestCount(0);

      return () => {
        onlineStatusService.cleanup();
      };
    } else {
      setPendingRequestCount(0);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      userDetails: profile as any, // TODO: Fix type mismatch between Supabase profile and User type
      loading, 
      pendingRequestCount 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);