import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { ModalProvider } from "@/providers/ModalProvider";
import { AuthModal } from "@/components/AuthModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Турклуб Ирбис",
  description: "Официальный сайт Турклуба Ирбис",
  icons: {
    icon: '/irbis.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={cn("font-sans antialiased flex flex-col min-h-screen", inter.className)}>
        <QueryProvider>
          <ModalProvider>
            <AuthProvider>
              <Header />
              <main className="flex-grow flex flex-col">
                <Suspense fallback={<div>Загрузка...</div>}>
                  {children}
                </Suspense>
              </main>
              <Footer />
              <AuthModal />
              <Toaster />
            </AuthProvider>
          </ModalProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
