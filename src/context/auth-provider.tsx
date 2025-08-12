
'use client';

import type { ReactNode, FC } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a mock user object
const mockUser: User = {
  uid: 'mock-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://placehold.co/100x100.png',
  providerId: 'google.com',
  emailVerified: true,
} as User;


export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate initial auth check
    const authStatus = localStorage.getItem('mock-auth-status');
    if (authStatus === 'logged-in') {
        setUser(mockUser);
    }
    setLoading(false);
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    setTimeout(() => {
      setUser(mockUser);
      localStorage.setItem('mock-auth-status', 'logged-in');
      setLoading(false);
    }, 500);
  };

  const signInWithApple = async () => {
    setLoading(true);
    setTimeout(() => {
        setUser(mockUser);
        localStorage.setItem('mock-auth-status', 'logged-in');
        setLoading(false);
    }, 500);
  };

  const signOut = async () => {
    setLoading(true);
    setTimeout(() => {
        setUser(null);
        localStorage.removeItem('mock-auth-status');
        setLoading(false);
        toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
    }, 500);
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signInWithApple,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
