'use client';

import { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { User } from '@/types';
import api from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { useModal } from './ModalProvider';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isLoggingOut: false,
  logout: () => {},
});

async function fetchUser(): Promise<User | null> {
  try {
    const { data } = await api.get<{ detail: User }>('/users/me');
    return data.detail;
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const { hideAuthModal } = useModal();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: user, status } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: fetchUser,
    enabled: typeof window !== 'undefined' && !['/login', '/register'].includes(pathname),
    refetchOnWindowFocus: false,
  });

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Manual logout failed", error);
    } finally {
      queryClient.setQueryData(['user'], null);
      hideAuthModal();
      router.push('/');
      setTimeout(() => setIsLoggingOut(false), 500); // Reset after navigation
    }
  }, [queryClient, router, hideAuthModal]);

  const isLoading = status === 'pending';

  return (
    <AuthContext.Provider value={{ user: user || null, isAuthenticated: !!user, isLoading, isLoggingOut, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
