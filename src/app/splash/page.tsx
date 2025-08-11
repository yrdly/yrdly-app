"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function Splash() {
    const [fade, setFade] = useState(false);
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            setFade(true);
        }, 100);

        const redirectTimer = setTimeout(() => {
             if (!loading) {
                if (user) {
                    router.replace('/home');
                } else {
                    router.replace('/login');
                }
            }
        }, 2500);

        return () => {
            clearTimeout(timer);
            clearTimeout(redirectTimer);
        }
    }, [user, loading, router]);


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground transition-opacity duration-1000 ease-in-out"
        style={{ opacity: fade ? 1 : 0 }}
    >
      <div className="flex items-center gap-4 mb-2 animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-primary"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-4-3-5.5s-3.5-2.5-5.5-3.5a7 7 0 0 0-7 7c0 2 1 4 3 5.5s3.5 2.5 5.5 3.5z"/><path d="M12 22v-1.5"/></svg>
        <h1 className="text-5xl font-bold font-headline">Yrdly</h1>
      </div>
      <p className="text-lg text-muted-foreground animate-fade-in-delay">
        Stay connected with your community
      </p>
    </div>
  );
}
