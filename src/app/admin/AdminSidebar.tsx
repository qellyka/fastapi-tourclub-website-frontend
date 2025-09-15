'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Newspaper, Users, Mountain, Map, FileText, Link2 } from 'lucide-react';

const adminNavItems = [
  { name: "Статьи", href: "/admin/articles", icon: Newspaper },
  { name: "Новости", href: "/admin/news", icon: FileText },
  { name: "Походы", href: "/admin/hikes", icon: Mountain },
  { name: "Перевалы", href: "/admin/passes", icon: Map },
  { name: "Пользователи", href: "/admin/users", icon: Users },
  { name: "Участники", href: "/admin/participants", icon: Users },
  { name: "Связи", href: "/admin/link", icon: Link2 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Link href="/admin" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
          Панель
        </Link>
      </div>
      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          {adminNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-gray-700 font-medium 
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
