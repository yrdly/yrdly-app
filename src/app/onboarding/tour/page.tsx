"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Home, Search, Plus, User, CheckCircle } from 'lucide-react';
import { YrdlyLogo } from '@/components/ui/yrdly-logo';
import { useToast } from '@/hooks/use-toast';
import { onboardingAnalytics } from '@/lib/onboarding-analytics';

const tourSteps = [
  {
    id: 'feed',
    title: 'Discover Your Feed',
    description: 'Browse events, posts, and listings from your neighborhood',
    icon: Home,
    content: 'Your feed shows you the latest activity from your neighbors. You\'ll see events, marketplace listings, and community updates relevant to your area.',
    features: [
      'See posts from your local area',
      'Discover events happening nearby',
      'Find items for sale in your community'
    ]
  },
  {
    id: 'search',
    title: 'Search & Filter',
    description: 'Find exactly what you\'re looking for with location filters',
    icon: Search,
    content: 'Use the search feature to find specific posts, events, or people. Filter by location, category, or date to narrow down your results.',
    features: [
      'Search by keywords or categories',
      'Filter by location and distance',
      'Sort by date or relevance'
    ]
  },
  {
    id: 'create',
    title: 'Share with Neighbors',
    description: 'Create posts to share updates, events, or items for sale',
    icon: Plus,
    content: 'Share what\'s happening in your neighborhood. Post about events, sell items, or just share updates with your community.',
    features: [
      'Create event posts',
      'List items for sale',
      'Share community updates'
    ]
  },
  {
    id: 'profile',
    title: 'Your Profile',
    description: 'Manage your settings and view your activity',
    icon: User,
    content: 'Your profile is where you manage your account settings, view your posts, and connect with other neighbors.',
    features: [
      'Update your profile information',
      'View your posts and activity',
      'Manage notification settings'
    ]
  }
];

export default function OnboardingTourPage() {
  const { completeTour, skipTour } = useOnboarding();
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      onboardingAnalytics.trackTourCompleted(tourSteps.length, tourSteps.length);
      await completeTour();
      toast({
        title: "Tour Complete!",
        description: "You're all set to start using Yrdly.",
      });
      router.push('/home');
    } catch (error: any) {
      console.error('Error completing tour:', error);
      onboardingAnalytics.trackError('tour', error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete tour. Please try again.",
      });
    }
  };

  const handleSkip = async () => {
    try {
      onboardingAnalytics.trackTourSkipped('user_skipped');
      await skipTour();
      toast({
        title: "Tour Skipped",
        description: "You can always take the tour later from your profile.",
      });
      router.push('/home');
    } catch (error: any) {
      console.error('Error skipping tour:', error);
      onboardingAnalytics.trackError('tour_skip', error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to skip tour. Please try again.",
      });
    }
  };

  const IconComponent = currentTourStep.icon;

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
              <IconComponent className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{currentTourStep.title}</CardTitle>
            <CardDescription>{currentTourStep.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {currentStep + 1} of {tourSteps.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Content */}
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {currentTourStep.content}
              </p>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Key Features:</h4>
                <ul className="space-y-1">
                  {currentTourStep.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button 
                  onClick={handlePrevious}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              
              <Button 
                onClick={handleNext}
                className="flex-1"
              >
                {currentStep === tourSteps.length - 1 ? 'Complete Tour' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Skip button */}
            <Button 
              onClick={handleSkip}
              variant="ghost"
              className="w-full"
            >
              Skip Tour
            </Button>

            {/* Step indicators */}
            <div className="flex justify-center gap-2">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep 
                      ? 'bg-primary' 
                      : completedSteps.has(index) 
                        ? 'bg-green-500' 
                        : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
