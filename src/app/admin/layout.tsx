'use client';

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This effect runs only on the client after hydration
    if (!isLoading && (!user || !user.roles.includes('admin'))) {
      router.push('/'); // Redirect to home page if not an admin
    }
  }, [user, isLoading, router]);

  // On the server, and on the initial client render, show a generic loading state
  // if we don't have the user information yet.
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Загрузка...</div>
      </div>
    );
  }

  // If the user is an admin, show the admin layout.
  // If not, this will be briefly rendered before the useEffect redirects.
  // To prevent even a flash of content, we can add the role check here too.
  if (!user.roles.includes('admin')) {
    // This will be the case for non-admin users on the client before redirect.
    // We can show the same loading screen to prevent any content flash.
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Проверка доступа...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
