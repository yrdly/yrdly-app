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
import { supabase } from '@/lib/supabase';

function VerifyEmailContent() {
  const { user, profile, loading } = useAuth();
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

  // Redirect if user is not authenticated (with delay to allow session to establish)
  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, waiting for session...');
      // Wait a bit longer for the session to be established
      const timer = setTimeout(() => {
        if (!user) {
          console.log('Still no user after delay, redirecting to signup');
          router.push('/signup');
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

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
    console.log('Resend verification clicked', { user: !!user, cooldownTime, loading });
    if (!user || cooldownTime > 0 || loading) return;

    setIsResending(true);
    try {
      // Try to send verification email via Brevo, fallback to manual message
      try {
        // Create verification link with user ID as token
        const verificationLink = `${window.location.origin}/onboarding/verify-email?token=${user.id}&email=${encodeURIComponent(email)}`;
        
        // Send verification email via Brevo
        await BrevoEmailService.sendVerificationEmail(email, verificationLink, user.user_metadata?.name || user.email?.split('@')[0]);
        
        console.log('Verification email sent via Brevo');
        onboardingAnalytics.trackEmailVerificationSent(email);
      } catch (error: any) {
        console.log('Brevo email failed:', error.message);
        if (error.message === 'BREVO_NOT_CONFIGURED' || error.message === 'BREVO_SEND_FAILED') {
          console.log('Brevo not configured, showing manual instructions');
          
          // Show manual verification instructions since email service is not configured
          toast({
            title: "Email Service Not Configured",
            description: "Please contact support to resend your verification email, or check your email for the verification link.",
            variant: "destructive"
          });
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
    console.log('Check verification clicked', { user: !!user, emailConfirmed: user?.email_confirmed_at, loading });
    if (!user || loading) return;
    
    setIsChecking(true);
    try {
      // Check verification status - refresh user data first
      const { data: { user: refreshedUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting user:', error);
        throw error;
      }
      
      if (refreshedUser?.email_confirmed_at) {
        await updateOnboardingStatus('profile_setup');
        toast({
          title: "Email Verified!",
          description: "Your email has been successfully verified.",
        });
        router.push('/onboarding/profile');
      } else {
        toast({
          title: "Not Verified Yet",
          description: "Your email is not verified yet. Please check your inbox and click the verification link.",
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

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-4">
            <YrdlyLogo />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show waiting state if no user (but not loading)
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-4">
            <YrdlyLogo />
          </div>
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
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
