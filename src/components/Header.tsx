'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useModal } from '@/providers/ModalProvider';

export default function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { showAuthModal } = useModal();
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClasses = `
    fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
    ${isScrolled || !isHomePage ? 'bg-white text-gray-800 shadow-md' : 'bg-transparent text-white'}
  `;

  return (
    <header className={headerClasses}>
      <nav className="container mx-auto flex justify-between items-center p-4">
        <Link href="/" className="font-bold text-2xl tracking-tight">
          Ирбис
        </Link>
        <div className="hidden md:flex space-x-8 items-center font-medium">
          <Link href="/archive/hikes" className="hover:text-blue-600 transition-colors">Походы</Link>
          <Link href="/archive/passes" className="hover:text-blue-600 transition-colors">Перевалы</Link>
          <Link href="/articles" className="hover:text-blue-600 transition-colors">Статьи</Link>
          <Link href="/news" className="hover:text-blue-600 transition-colors">Новости</Link>
          <Link href="/about" className="hover:text-blue-600 transition-colors">О клубе</Link>
        </div>
        <div className="flex items-center">
          {isLoading ? (
            <div className="h-10 w-32 rounded-md bg-gray-200 animate-pulse" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">{user.full_name}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Профиль</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setTimeout(() => logout(), 0)}>
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={showAuthModal}>
              Войти
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}