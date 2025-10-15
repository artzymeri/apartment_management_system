"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/auth-api';

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  number?: string;
  role: 'admin' | 'property_manager' | 'tenant';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string, method?: 'email' | 'phone') => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  updateProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const isValid = await authAPI.verifyToken();

      if (isValid) {
        const response = await authAPI.getCurrentUser();
        if (response && response.success) {
          setUser(response.data);
          setIsLoading(false);
          return true;
        }
      }

      // Token invalid or no user - clear everything and redirect
      setUser(null);
      authAPI.removeToken();
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      authAPI.removeToken();
      setIsLoading(false);
      return false;
    }
  };

  const login = async (identifier: string, password: string, method: 'email' | 'phone' = 'email') => {
    try {
      const response = await authAPI.login(identifier, password, method);

      if (response.success && response.token) {
        // Store token
        authAPI.setToken(response.token);

        // Set user
        setUser(response.data);

        // Redirect based on role
        const roleRoutes = {
          admin: '/admin',
          property_manager: '/property_manager',
          tenant: '/tenant'
        };

        const redirectPath = roleRoutes[response.data.role as keyof typeof roleRoutes] || '/';
        router.push(redirectPath);

        return { success: true };
      } else {
        return {
          success: false,
          message: response.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Failed to connect to server'
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      authAPI.removeToken();
      router.push('/login');
    }
  };

  const updateProfile = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response && response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        checkAuth,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
