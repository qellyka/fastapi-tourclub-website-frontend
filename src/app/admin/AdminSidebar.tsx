'use client';

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Home, Newspaper, Users, Mountain, Link2, ClipboardList, MountainSnow } from "lucide-react";

const links = [
    { href: "/admin", label: "Главная", icon: Home },
    { href: "/admin/hikes", label: "Походы", icon: Mountain },
    { href: "/admin/passes", label: "Перевалы", icon: MountainSnow },
    { href: "/admin/news", label: "Новости", icon: Newspaper },
    { href: "/admin/articles", label: "Статьи", icon: Briefcase },
    { href: "/admin/users", label: "Пользователи", icon: Users },
    { href: "/admin/participants", label: "Участники", icon: Users },
    { href: "/admin/add-participants", label: "Прикрепление к походам", icon: Users },
    { href: "/admin/link", label: "Связи", icon: Link2 },
    { href: "/admin/school-applications", label: "Заявки в школу", icon: ClipboardList },
];

export function AdminSidebar() {
    const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
          Ирбис Админ
        </Link>
      </div>
      <nav className="flex-grow p-4">
        <ul className="space-y-1">
          {links.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-md transition-colors font-medium text-muted-foreground",
                    isActive 
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}