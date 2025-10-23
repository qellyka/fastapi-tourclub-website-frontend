'use client';

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Home, Newspaper, Users, Mountain, Link2, ClipboardList, MountainSnow, BarChart2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

const links = [
    { href: "/admin", label: "Главная", icon: Home },
    { href: "/admin/hikes", label: "Походы", icon: Mountain, roles: ['admin', 'moderator'] },
    { href: "/admin/passes", label: "Перевалы", icon: MountainSnow, roles: ['admin', 'moderator'] },
    { href: "/admin/news", label: "Новости", icon: Newspaper, roles: ['admin', 'moderator'] },
    { href: "/admin/articles", label: "Статьи", icon: Briefcase, roles: ['admin', 'moderator'] },
    { href: "/admin/users", label: "Пользователи", icon: Users, roles: ['admin'] },
    { href: "/admin/participants", label: "Участники", icon: Users, roles: ['admin'] },
{ href: "/admin/add-participants", label: "Прикрепление к походам", icon: Users, roles: ['admin', 'moderator'] },
    { href: "/admin/link", label: "Связи", icon: Link2, roles: ['admin', 'moderator'] },
    { href: "/admin/school-applications", label: "Заявки в школу", icon: ClipboardList, roles: ['admin'] },
    { href: "/admin/faqs", label: "FAQ", icon: ClipboardList, roles: ['admin', 'moderator'] },
    { href: "/admin/statistics", label: "Статистика", icon: BarChart2, roles: ['admin'] },
];

export function AdminSidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) {
    const pathname = usePathname();
    const { user } = useAuth();

    const availableLinks = links.filter(link => {
        if (!link.roles) {
            return true;
        }
        return user?.roles?.some(role => link.roles.includes(role));
    });

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 bg-card border-r border-border flex flex-col transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:translate-x-0 lg:w-64"
        )}
      >
        <div className="p-4 border-b border-border">
          <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
            Ирбис Админ
          </Link>
        </div>
        <nav className="flex-grow p-4">
          <ul className="space-y-1">
            {availableLinks.map((item) => {
              const isModerator = user?.roles?.includes('moderator') && !user?.roles?.includes('admin');
              let href = item.href;
              let label = item.label;

              

              const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
              return (
                <li key={item.label}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md transition-colors font-medium text-muted-foreground",
                      isActive 
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => setIsOpen(false)} // Close sidebar on link click
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                </li>
              );
                        })}
                      </ul>
                    </nav>
                  </aside>
                </>
              );
            }