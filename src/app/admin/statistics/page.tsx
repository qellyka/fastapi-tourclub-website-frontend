'use client';

import { useQuery } from '@tanstack/react-query';
import { getStatistics } from '@/lib/api';
import { StatisticsData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { withAdminAuth } from '@/components/admin/withAdminAuth';

const StatCard = ({ title, value }: { title: string; value: string | number }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const StatusDistributionCard = ({ title, data }: { title: string; data: { [key: string]: number } }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {Object.entries(data).map(([status, count]) => (
        <div key={status} className="flex justify-between">
          <span>{status.replace(/_/g, ' ').toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
          <span>{count}</span>
        </div>
      ))}
    </CardContent>
  </Card>
);

function AdminStatisticsPage() {
  const { data: stats, isLoading, error } = useQuery<StatisticsData>({
    queryKey: ['admin-statistics'],
    queryFn: () => getStatistics().then(res => res.detail),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold mb-4">Статистика</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[100px] w-full" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-[200px] w-full" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive text-center py-16">Ошибка при загрузке статистики: {error.message}</div>;
  }

  if (!stats) {
    return <div className="text-center py-16">Статистика не найдена.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">Статистика</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Всего пользователей" value={stats.total_users} />
        <StatCard title="Новых за 30 дней" value={stats.new_users_last_30_days} />
        <StatCard title="Всего походов" value={stats.total_hikes} />
        <StatCard title="Всего заявок в школу" value={stats.total_applications} />
        <StatCard title="Всего статей" value={stats.total_articles} />
        <StatCard title="Всего новостей" value={stats.total_news} />
        <StatCard title="Всего перевалов" value={stats.total_passes} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatusDistributionCard title="Походы по статусам" data={stats.hikes_by_status || {}} />
        <StatusDistributionCard title="Заявки в школу по статусам" data={stats.applications_by_status || {}} />
      </div>
    </div>
  );
}

export default withAdminAuth(AdminStatisticsPage);
