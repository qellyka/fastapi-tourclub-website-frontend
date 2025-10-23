'use client';

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-col flex-1">
        <header className="lg:hidden p-4 border-b border-border flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <span className="text-xl font-bold">Админ панель</span>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}