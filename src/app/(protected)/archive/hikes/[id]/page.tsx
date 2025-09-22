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

async function fetchHikeById(id: string): Promise<{ detail: Hike }> {
  const { data } = await api.get(`/archive/hikes/${id}`);
  return data;
}

export default function HikeDetailPage({ params }: { params: { id: string } }) {
  const { id } = use(params);
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
  if (error) return <div className="container mx-auto px-4 py-24 text-center text-destructive">Поход не найден.</div>;
  if (!hike) return null;

  return (
    <main className="container mx-auto px-4 py-24 pt-28 md:pt-32">
      <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-8 text-center">{hike.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
        <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
                <CardHeader><CardTitle>Информация</CardTitle></CardHeader>
                <CardContent className="flex-grow space-y-2 text-lg">
                    <p><strong>Регион:</strong> {hike.region}</p>
                    <p><strong>Сложность:</strong> {hike.complexity}</p>
                    <p><strong>Даты:</strong> {new Date(hike.start_date).toLocaleDateString()} - {new Date(hike.end_date).toLocaleDateString()}</p>
                </CardContent>
                <div className="p-6 border-t mt-auto space-y-3">
                    <Button asChild size="lg" className="w-full">
                        <a href={`/hikes/${hike.id}/report`} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" /> Скачать PDF отчет
                        </a>
                    </Button>
                    <Button asChild size="lg" variant="secondary" className="w-full">
                        <a href={`/hikes/${hike.id}/route`} target="_blank" rel="noopener noreferrer">
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

        <div className="lg:col-span-3 h-96 lg:h-[500px] rounded-lg overflow-hidden border bg-muted">
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