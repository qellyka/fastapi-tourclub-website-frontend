'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Newspaper, Mountain, Map, FileText, Link as LinkIcon, Waves, BookOpen } from 'lucide-react';
import Link from "next/link";
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

// --- Statistics Data Fetching and Types ---
interface Statistics {
  totalHikes: number;
  totalPasses: number;
  totalArticles: number;
  totalUsers: number;
}

async function fetchStatistics(): Promise<Statistics> {
  const { data } = await api.get('/statistics'); // Assuming this endpoint exists
  return data;
}

// --- Statistics Card Component ---
const StatisticsCard = ({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType }) => (
  <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md text-center">
    <Icon className="w-10 h-10 text-blue-600 mb-3" />
    <p className="text-4xl font-bold text-gray-800">{value}</p>
    <p className="text-lg text-gray-600 mt-1">{title}</p>
  </div>
);

const adminSections = [
  { title: "Пользователи", href: "/admin/users", icon: Users, description: "Управление учетными записями" },
  { title: "Статьи", href: "/admin/articles", icon: FileText, description: "Создание и редактирование статей" },
  { title: "Новости", href: "/admin/news", icon: Newspaper, description: "Управление новостной лентой" },
  { title: "Походы", href: "/admin/hikes", icon: Mountain, description: "Информация о походах" },
  { title: "Перевалы", href: "/admin/passes", icon: Map, description: "База данных перевалов" },
  { title: "Участники", href: "/admin/participants", icon: Users, description: "Список участников клуба" },
  { title: "Связи", href: "/admin/link", icon: LinkIcon, description: "Привязка участников к походам" },
];

export default function AdminDashboardPage() {
  const { data: stats, isLoading: isLoadingStats, error: errorStats } = useQuery<Statistics>({
    queryKey: ['statistics'],
    queryFn: fetchStatistics,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Панель администратора</h1>
        <p className="text-gray-500">Выберите раздел для управления контентом.</p>
      </div>

      {/* Statistics Section */}
      <div className="py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Общая статистика</h2>
        {isLoadingStats && <div className="text-center">Загрузка статистики...</div>}
        {errorStats && <div className="text-center text-red-500">Не удалось загрузить статистику.</div>}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatisticsCard title="Походов" value={stats.totalHikes} icon={Mountain} />
            <StatisticsCard title="Перевалов" value={stats.totalPasses} icon={Waves} />
            <StatisticsCard title="Статей" value={stats.totalArticles} icon={BookOpen} />
            <StatisticsCard title="Пользователей" value={stats.totalUsers} icon={Users} />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Link href={section.href} key={section.title} className="no-underline">
            <Card className="h-full hover:border-primary hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1">
              <CardHeader className="flex flex-col items-start space-y-2">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-muted rounded-md">
                    <section.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{section.title}</CardTitle>
                </div>
                <CardDescription className="pt-2 text-sm text-gray-600">
                  {section.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}