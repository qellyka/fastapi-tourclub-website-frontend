'use client';

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

const adminNavItems = [
  { name: "Пользователи", href: "/admin/users" },
  { name: "Походы", href: "/admin/hikes" },
  { name: "Статьи", href: "/admin/articles" },
  { name: "Новости", href: "/admin/news" },
  { name: "Участники", href: "/admin/participants" },
  { name: "Связать поход с перевалом", href: "/admin/link" },
  { name: "Добавить участников к походу", href: "/admin/add-participants" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  // NOTE: In a real app, you'd also check for an admin role, e.g., if (!user || !user.isAdmin)
  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
      <aside className="md:col-span-1">
        <h2 className="text-xl font-bold mb-4">Админ-панель</h2>
        <nav className="flex flex-col space-y-2">
          {adminNavItems.map((item) => (
            <Link key={item.name} href={item.href} className="p-2 rounded-md hover:bg-gray-100">
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="md:col-span-4">
        {children}
      </main>
    </div>
  );
}
