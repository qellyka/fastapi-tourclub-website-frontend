'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Hike } from '@/types';
import MapboxMap from '@/components/MapboxMap';
import HikeParticipants from '@/components/HikeParticipants';
import { use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { notFound } from 'next/navigation';

async function fetchHikeById(id: string): Promise<{ detail: Hike }> {
  const { data } = await api.get(`/archive/hikes/${id}`);
  return data;
}

export default function HikeDetailPage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { data: hike, isLoading, error } = useQuery<Hike>({
    queryKey: ['hike', id],
    queryFn: () => fetchHikeById(id),
    select: (data) => data.detail,
  });

  if (isLoading) return (
    <div className="container mx-auto px-4 py-24 pt-28 md:pt-32">
        <Skeleton className="h-12 w-2/3 mx-auto mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 lg:h-[500px] w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
    </div>
  );
  if (error || !hike) return notFound();

  const isPublished = hike.status?.toLowerCase() === 'published';
  const isAdmin = user?.roles?.includes('admin');
  const isModerator = user?.roles?.includes('moderator');

  if (!isPublished && !isAdmin && !isModerator) {
    return notFound();
  }

  return (
    <main className="container mx-auto px-4 py-24 pt-28 md:pt-32">
      <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-8 text-center">{hike.name}</h1>

      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className="lg:w-2/5">
            <Card className="h-full flex flex-col">
                <CardHeader><CardTitle>Информация о походе</CardTitle></CardHeader>
                <CardContent className="flex-grow space-y-2 text-lg">
                    <p><strong>Тип:</strong> {hike.tourism_type}</p>
                    <p><strong>Регион:</strong> {hike.region}</p>
                    <p><strong>Сложность:</strong> {hike.complexity}</p>
                    <p><strong>Даты:</strong> {new Date(hike.start_date).toLocaleDateString()} - {new Date(hike.end_date).toLocaleDateString()}</p>
                    <p><strong>Продолжительность:</strong> {hike.duration_days} дней</p>
                    <p><strong>Протяженность:</strong> {hike.distance_km} км</p>
                    <p><strong>Количество участников:</strong> {hike.participants_count}</p>
                    {hike.leader_fullname && (
                        <p><strong>Руководитель:</strong>{' '}
                            <Link href={`/profile/${hike.leader_id}`} className="text-blue-500 hover:underline">
                                {hike.leader_fullname}
                            </Link>
                        </p>
                    )}
                    {hike.difficulty_distribution && Object.keys(hike.difficulty_distribution).length > 0 && (
                        <div>
                            <p><strong>Препятствия:</strong></p>
                            <ul className="list-disc list-inside pl-4">
                                {Object.entries(hike.difficulty_distribution).map(([difficulty, count]) => (
                                    <li key={difficulty}>{difficulty}: {count}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
                <div className="p-6 border-t mt-auto space-y-3">
                    <Button asChild size="lg" className="w-full">
                        <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/archive/hikes/${hike.id}/file/report`} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" /> Скачать PDF отчет
                        </a>
                    </Button>
                    <Button asChild size="lg" variant="secondary" className="w-full">
                        <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/archive/hikes/${hike.id}/file/route`} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" /> Скачать GPX маршрут
                        </a>
                    </Button>
                    {hike.photos_archive && (
                        <Button asChild size="lg" variant="secondary" className="w-full">
                            <a href={hike.photos_archive.startsWith('http') ? hike.photos_archive : `https://${hike.photos_archive}`} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" /> Архив с фото
                            </a>
                        </Button>
                    )}
                </div>
            </Card>
        </div>

        <div className="lg:w-3/5 min-h-[500px] rounded-lg overflow-hidden border bg-muted">
          {hike.geojson_data && <MapboxMap geojson={hike.geojson_data} />}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {(hike.description || hike.route) && (
            <Card>
                {hike.description && (
                    <>
                        <CardHeader><CardTitle>Описание</CardTitle></CardHeader>
                        <CardContent className="text-base whitespace-pre-wrap leading-relaxed text-muted-foreground">
                            {hike.description}
                        </CardContent>
                    </>
                )}
                {hike.route && (
                    <>
                        <CardHeader><CardTitle>Нитка маршрута</CardTitle></CardHeader>
                        <CardContent className="text-base whitespace-pre-wrap leading-relaxed text-muted-foreground">
                            {hike.route}
                        </CardContent>
                    </>
                )}
            </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Участники похода</CardTitle></CardHeader>
          <CardContent>
            <HikeParticipants hikeId={hike.id} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}