'use client';

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || (!user?.roles?.includes('admin') && !user?.roles?.includes('moderator')))) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || (!user?.roles?.includes('admin') && !user?.roles?.includes('moderator'))) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-xl font-semibold text-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}