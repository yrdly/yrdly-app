"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-supabase-auth';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { YrdlyLogo } from '@/components/ui/yrdly-logo';
import { useToast } from '@/hooks/use-toast';
import { BrevoEmailService } from '@/lib/brevo-service';
import { onboardingAnalytics } from '@/lib/onboarding-analytics';

export default function OnboardingWelcomePage() {
  const { user, profile } = useAuth();
  const { completeWelcome } = useOnboarding();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [welcomeSent, setWelcomeSent] = useState(false);

  useEffect(() => {
    const sendWelcomeMessage = async () => {
      if (!user || !profile || welcomeSent) return;

      try {
        // Send welcome email
        if (profile.email) {
          await BrevoEmailService.sendWelcomeEmail(
            profile.email,
            profile.name || 'User',
            {
              username: profile.name || 'User',
              location: profile.location?.state || 'your area'
            }
          );
          onboardingAnalytics.trackWelcomeMessageSent(profile.email);
        }

        // Mark welcome as sent
        await completeWelcome();
        setWelcomeSent(true);
        
        toast({
          title: "Welcome to Yrdly!",
          description: "A welcome email has been sent to your inbox.",
        });
      } catch (error) {
        console.error('Error sending welcome message:', error);
        // Don't show error to user, just continue
        await completeWelcome();
        setWelcomeSent(true);
      } finally {
        setIsLoading(false);
      }
    };

    sendWelcomeMessage();
  }, [user, profile, completeWelcome, welcomeSent, toast]);

  const handleTakeTour = () => {
    onboardingAnalytics.trackTourStarted();
    router.push('/onboarding/tour');
  };

  const handleSkipTour = () => {
    onboardingAnalytics.trackTourSkipped('skipped_from_welcome');
    router.push('/home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Setting up your account...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto mb-4">
            <YrdlyLogo />
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              🎉 Welcome, {profile?.name}!
            </CardTitle>
            <CardDescription>
              Your profile is complete. Let&apos;s get you started.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                A welcome email has been sent to <strong>{profile?.email}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold">What&apos;s Next?</h3>
                <p className="text-sm text-muted-foreground">
                  Take a quick tour to learn about Yrdly&apos;s features, or jump right in and start exploring your neighborhood.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleTakeTour}
                  className="w-full"
                >
                  Take a Quick Tour
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button 
                  onClick={handleSkipTour}
                  variant="outline"
                  className="w-full"
                >
                  Skip Tour & Start Exploring
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>You can always take the tour later from your profile settings.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
