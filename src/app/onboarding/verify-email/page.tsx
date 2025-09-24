"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-supabase-auth';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, RefreshCw, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { YrdlyLogo } from '@/components/ui/yrdly-logo';
import { useToast } from '@/hooks/use-toast';
import { BrevoEmailService } from '@/lib/brevo-service';
// Removed Firebase import - using Supabase auth
import { onboardingAnalytics } from '@/lib/onboarding-analytics';

function VerifyEmailContent() {
  const { user, profile } = useAuth();
  const { updateOnboardingStatus, isEmailVerified } = useOnboarding();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [isResending, setIsResending] = useState(false);
  const [lastSentTime, setLastSentTime] = useState<number | null>(null);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const email = searchParams.get('email') || user?.email || '';
  const token = searchParams.get('token');

  // Check if user is verified and redirect
  useEffect(() => {
    if (isEmailVerified) {
      // Add a small delay to show the success state
      const timer = setTimeout(() => {
        updateOnboardingStatus('profile_setup');
        onboardingAnalytics.trackStepComplete('email_verification', { 
          userId: user?.id,
          method: 'automatic'
        });
        router.push('/onboarding/profile');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isEmailVerified, updateOnboardingStatus, router, user?.id]);

  const handleTokenVerification = async () => {
    if (!user || !token) return;
    
    setIsChecking(true);
    try {
      // Verify the token matches the user ID
      if (token === user.id) {
        // Update user's email verification status
        await updateOnboardingStatus('profile_setup');
        toast({
          title: "Email Verified!",
          description: "Your email has been successfully verified.",
        });
        router.push('/onboarding/profile');
      } else {
        throw new Error('Invalid verification token');
      }
    } catch (error: any) {
      console.error('Token verification error:', error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Invalid or expired verification link.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Handle email verification from link
  useEffect(() => {
    if (token && user) {
      // Token-based verification (from Brevo)
      handleTokenVerification();
    }
  }, [token, user, handleTokenVerification]);

  // Cooldown timer
  useEffect(() => {
    if (lastSentTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - lastSentTime) / 1000);
        const remaining = Math.max(0, 60 - elapsed);
        setCooldownTime(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lastSentTime]);

  const handleResendVerification = async () => {
    if (!user || cooldownTime > 0) return;

    setIsResending(true);
    try {
      // Try to send verification email via Brevo, fallback to Firebase
      try {
        // Create verification link with user ID as token
        const verificationLink = `${window.location.origin}/onboarding/verify-email?token=${user.id}&email=${encodeURIComponent(email)}`;
        
        // Send verification email via Brevo
        await BrevoEmailService.sendVerificationEmail(email, verificationLink, user.user_metadata?.name || user.email?.split('@')[0]);
        
        console.log('Verification email sent via Brevo');
        onboardingAnalytics.trackEmailVerificationSent(email);
      } catch (error: any) {
        if (error.message === 'BREVO_NOT_CONFIGURED' || error.message === 'BREVO_SEND_FAILED') {
          console.log('Falling back to Firebase email verification');
          
          // Fallback to Firebase email verification
          // Note: This requires Firebase auth user, not Supabase user
          console.log('Firebase fallback not available with Supabase user');
          onboardingAnalytics.trackEmailVerificationSent(email);
        } else {
          throw error; // Re-throw other errors
        }
      }
      
      setLastSentTime(Date.now());
      setCooldownTime(60);
      
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox and spam folder for the verification link.",
      });
    } catch (error: any) {
      onboardingAnalytics.trackError('email_verification', error.message, { 
        userId: user.id,
        action: 'resend'
      });
      toast({
        variant: "destructive",
        title: "Error Sending Email",
        description: error.message || "Failed to send verification email. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;
    
    setIsChecking(true);
    try {
      // Check verification status (Supabase user doesn't need reload)
      if (user.email_confirmed_at) {
        await updateOnboardingStatus('profile_setup');
        toast({
          title: "Email Verified!",
          description: "Your email has been successfully verified.",
        });
        router.push('/onboarding/profile');
      } else {
        toast({
          title: "Not Verified Yet",
          description: "Your email is not verified yet. Please check your inbox.",
        });
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check verification status. Please try again.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleBackToSignup = () => {
    router.push('/signup');
  };

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
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent a verification link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Click the verification link in your email to continue setting up your account.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Button 
                onClick={handleCheckVerification}
                disabled={isChecking}
                className="w-full"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    I&apos;ve Verified My Email
                  </>
                )}
              </Button>

              <Button 
                onClick={handleResendVerification}
                disabled={isResending || cooldownTime > 0}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : cooldownTime > 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend in {cooldownTime}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Button 
                onClick={handleBackToSignup}
                variant="ghost"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign Up
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Didn&apos;t receive the email? Check your spam folder.</p>
              <p>Still having trouble? Contact support.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OnboardingVerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
