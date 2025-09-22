
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, Newspaper, Mountain, Map, FileText, Link as LinkIcon, Waves, BookOpen } from 'lucide-react';
import Link from "next/link";
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Skeleton } from "@/components/ui/skeleton";

// --- Statistics Data Fetching and Types ---
interface Statistics {
  totalHikes: number;
  totalPasses: number;
  totalArticles: number;
  totalUsers: number;
}

async function fetchStatistics(): Promise<Statistics> {
  const { data } = await api.get('/statistics');
  return data;
}

// --- Statistics Card Component ---
const StatisticsCard = ({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
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
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Панель администратора</h1>
        <p className="text-muted-foreground">Обзор и управление контентом сайта.</p>
      </div>

      {/* Statistics Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Общая статистика</h2>
        {isLoadingStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        )}
        {errorStats && <div className="text-center text-destructive bg-destructive/10 p-4 rounded-lg">Не удалось загрузить статистику.</div>}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatisticsCard title="Походы" value={stats.totalHikes} icon={Mountain} />
            <StatisticsCard title="Перевалы" value={stats.totalPasses} icon={Waves} />
            <StatisticsCard title="Статьи" value={stats.totalArticles} icon={BookOpen} />
            <StatisticsCard title="Пользователи" value={stats.totalUsers} icon={Users} />
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Разделы</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section) => (
            <Link href={section.href} key={section.title} className="no-underline">
                <Card className="h-full hover:border-primary hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-muted rounded-md">
                            <section.icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-semibold">{section.title}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <CardDescription>{section.description}</CardDescription>
                </CardContent>
                </Card>
            </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
