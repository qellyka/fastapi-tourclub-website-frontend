'use client';

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isLoggingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && !isLoggingOut) {
      router.push('/?unauthenticated=true');
    }
  }, [user, isLoading, router, isLoggingOut]);

  // While loading, or if there's no user (and redirect is about to happen),
  // show a loading indicator to prevent flashing of content.
  if (isLoading || !user) {
    return <div className="container mx-auto px-4 py-24 text-center">Загрузка...</div>;
  }

  // If user is loaded and present, render the protected content.
  return <>{children}</>;
}