"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<'admin' | 'privileged' | 'tenant'>;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, checkAuth } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyAccess = async () => {
      // Wait for auth check to complete
      if (isLoading) return;

      // Not authenticated
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }

      // Check if user role is allowed
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on their role
        const roleRoutes = {
          admin: '/admin',
          privileged: '/privileged',
          tenant: '/tenant'
        };
        router.push(roleRoutes[user.role]);
        return;
      }

      // User is authenticated and authorized
      setIsAuthorized(true);
    };

    verifyAccess();
  }, [user, isLoading, isAuthenticated, allowedRoles, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthorized) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
