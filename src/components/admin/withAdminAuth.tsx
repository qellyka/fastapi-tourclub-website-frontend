'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function withAdminAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAdminAuth(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user?.roles?.some(role => ['admin', 'moderator'].includes(role))) {
        router.push('/admin');
      }
    }, [user, isLoading, router]);

    if (isLoading || !user?.roles?.some(role => ['admin', 'moderator'].includes(role))) {
      return (
        <div className="flex items-center justify-center h-screen bg-background">
          <div className="text-xl font-semibold text-foreground">Загрузка...</div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}