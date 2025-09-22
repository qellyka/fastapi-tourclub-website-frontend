
'use client';

import { Suspense } from "react";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { ModalProvider } from "@/providers/ModalProvider";
import { AuthModal } from "@/components/AuthModal";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { GeistSans } from 'geist/font/sans';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={cn("font-sans antialiased flex flex-col min-h-screen", GeistSans.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ModalProvider>
              <AuthProvider>
                {!isAdminPage && <Header />}
                <main className="flex-grow">
                  <Suspense fallback={<div>Загрузка...</div>}>
                    {children}
                  </Suspense>
                </main>
                {!isAdminPage && <Footer />}
                <AuthModal />
                <Toaster />
              </AuthProvider>
            </ModalProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
