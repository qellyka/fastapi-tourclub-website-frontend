'use client';

import { useState, useEffect } from 'react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePathname } from 'next/navigation';
import { useModal } from '@/providers/ModalProvider';
import { Menu, MountainSnow } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

export default function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { showAuthModal } = useModal();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  const isHomePage = pathname === '/';

  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage]);

  const navLinks = [
    { href: '/archive/hikes', label: 'Походы' },
    { href: '/archive/passes', label: 'Перевалы' },
    { href: '/articles', label: 'Статьи' },
    { href: '/news', label: 'Новости' },
    { href: '/school', label: 'Школа' },
    { href: '/about', label: 'О клубе' },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
      isScrolled
        ? "bg-background/80 backdrop-blur-sm border-b border-border/50 shadow-sm"
        : "bg-transparent border-b border-transparent"
    )}>
      <nav className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center gap-6">
          <Link href="/" className={cn(
            "flex items-center gap-2 font-bold text-xl tracking-tighter transition-colors",
            !isScrolled && isHomePage && "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]"
          )}>
            <MountainSnow className="h-6 w-6 text-primary" />
            Ирбис
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center font-medium text-sm">
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "transition-colors",
                  pathname.startsWith(link.href) 
                    ? "font-semibold"
                    : "text-muted-foreground",
                  isScrolled
                    ? (pathname.startsWith(link.href) ? "text-foreground" : "hover:text-foreground")
                    : "text-white hover:text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {isLoading ? (
            <Skeleton className="h-9 w-20 rounded-md" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">{user.full_name}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile">Профиль</Link></DropdownMenuItem>
                {user.is_staff && <DropdownMenuItem asChild><Link href="/admin">Админка</Link></DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setTimeout(() => logout(), 0)}>
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={showAuthModal} size="sm">
              Войти
            </Button>
          )}
          
          {/* Mobile Navigation Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(!isScrolled && isHomePage && "text-white hover:text-white/90 hover:bg-white/10")}>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Открыть меню</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>Навигация</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-2 pt-8">
                  {navLinks.map(link => (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      className={cn(
                        "text-lg rounded-md p-3 transition-colors font-medium",
                        pathname.startsWith(link.href) 
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}