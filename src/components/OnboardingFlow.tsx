"use client";

import { useOnboarding, OnboardingStep } from '@/hooks/use-onboarding';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Import onboarding step components (we'll create these)
// import { EmailVerificationStep } from './onboarding/EmailVerificationStep';
// import { ProfileSetupStep } from './onboarding/ProfileSetupStep';
// import { WelcomeStep } from './onboarding/WelcomeStep';
// import { ProductTourStep } from './onboarding/ProductTourStep';

interface OnboardingFlowProps {
  currentStep: OnboardingStep;
}

export function OnboardingFlow({ currentStep }: OnboardingFlowProps) {
  const router = useRouter();

  // Redirect to appropriate step based on current step
  useEffect(() => {
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
      case 'completed':
        router.push('/home');
        break;
      default:
        // For 'signup' step, redirect to signup page
        router.push('/signup');
        break;
    }
  }, [currentStep, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Individual step components will be created in separate files
