"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useAuth } from '@/hooks/use-supabase-auth';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, profile, loading } = useAuth();
  const { currentStep, isOnboardingComplete } = useOnboarding();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading or if user is not logged in
    if (loading || !user || !profile) return;

    // If onboarding is complete, don't redirect
    if (isOnboardingComplete) return;

    // Redirect based on current onboarding step
    switch (currentStep) {
      case 'email_verification':
        router.push('/onboarding/verify-email');
        break;
      case 'profile_setup':
        router.push('/onboarding/profile');
        break;
      case 'welcome':
        router.push('/onboarding/welcome');
        break;
      case 'tour':
        router.push('/onboarding/tour');
        break;
      case 'signup':
        router.push('/signup');
        break;
      default:
        // For completed step, redirect to home
        router.push('/home');
        break;
    }
  }, [currentStep, isOnboardingComplete, user, profile, loading, router]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not logged in, let the auth system handle it
  if (!user || !profile) {
    return <>{children}</>;
  }

  // If onboarding is not complete, don't render children (will redirect)
  if (!isOnboardingComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If onboarding is complete, render children
  return <>{children}</>;
}
