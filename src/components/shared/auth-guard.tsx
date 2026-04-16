'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckComplete, setIsCheckComplete] = useState(false);

  // Use a separate effect to handle the logic to avoid infinite loops
  useEffect(() => {
    const isAuthPage = pathname?.startsWith('/auth');

    const checkAuth = () => {
      const status = isAuthenticated();
      
      if (!status && !isAuthPage) {
        // Not logged in and not on auth page -> Redirect to login
        router.replace('/auth/login');
      } else if (status && isAuthPage) {
        // Logged in but still on auth page -> Redirect to dashboard
        router.replace('/dashboard');
      } else {
        // Correct state
        setIsCheckComplete(true);
      }
    };

    checkAuth();

    // Listen for manual auth changes or storage changes from other tabs
    window.addEventListener('auth-change', checkAuth);
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, [pathname, router]);

  // Prevent flicker on navigation: If we are navigating between protected pages, 
  // we don't want to show the loader if we are already authenticated.
  if (!isCheckComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
