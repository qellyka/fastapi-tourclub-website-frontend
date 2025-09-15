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
import { Menu, X } from 'lucide-react';

export default function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { showAuthModal } = useModal();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const headerClasses = `
    fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
    ${isMobileMenuOpen ? 'bg-white text-gray-800 rounded-b-xl shadow-lg' : isScrolled || !isHomePage ? 'bg-white text-gray-800 shadow-md' : 'bg-transparent text-white'}
  `;

  const navLinks = [
    { href: '/archive/hikes', label: 'Походы' },
    { href: '/archive/passes', label: 'Перевалы' },
    { href: '/articles', label: 'Статьи' },
    { href: '/news', label: 'Новости' },
    { href: '/about', label: 'О клубе' },
  ];

  const mobileMenuClasses = `
    md:hidden bg-white text-gray-800
    transition-all duration-300 ease-in-out overflow-hidden
    ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
  `;

  return (
    <header className={headerClasses}>
      <nav className="container mx-auto flex justify-between items-center p-4">
        <Link href="/" className="font-bold text-2xl tracking-tight">
          Ирбис
        </Link>
        <div className="hidden md:flex space-x-8 items-center font-medium">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="hover:text-blue-600 transition-colors">{link.label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
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
          <div className="md:hidden">
            <Button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} variant="ghost" size="icon">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </nav>
      <div className={mobileMenuClasses}>
        <div className="container mx-auto flex flex-col items-start space-y-2 p-4 pt-0">
          {navLinks.map(link => {
            const isActive = pathname.startsWith(link.href);
            const linkClasses = `
              w-full p-3 rounded-md transition-colors text-lg
              ${isActive ? 'bg-blue-50 font-semibold text-blue-700' : 'hover:bg-blue-50 hover:text-blue-700'}
            `;
            return (
              <Link key={link.href} href={link.href} className={linkClasses}>{link.label}</Link>
            )
          })}
        </div>
      </div>
    </header>
  );
}