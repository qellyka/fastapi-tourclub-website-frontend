'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Hike } from '@/types';
import MapboxMap from '@/components/MapboxMap';
import HikeParticipants from '@/components/HikeParticipants';
import { use } from 'react';

async function fetchHikeById(id: string): Promise<Hike> {
  const { data } = await api.get(`/archive/hikes/${id}`);
  return data;
}

export default function HikeDetailPage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const { data: hike, isLoading, error } = useQuery<any>({ 
    queryKey: ['hike', id], 
    queryFn: () => fetchHikeById(id), 
    select: (data) => data.detail, // Extract the object from the response
  });

  if (isLoading) return <div className="container mx-auto px-4 py-24 text-center">Загрузка...</div>;
  if (error) return <div className="container mx-auto px-4 py-24 text-center">Поход не найден.</div>;
  if (!hike) return null;

  return (
    <main className="container mx-auto px-4 py-24">
      <h1 className="text-4xl lg:text-5xl font-bold mb-8 text-center">{hike.name}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top-Left: Info */}
        <div className="bg-gray-50 p-6 rounded-lg border h-full flex flex-col">
          <h2 className="text-3xl font-bold mb-4">Информация</h2>
          <div className="space-y-2 text-lg">
            <p><strong>Регион:</strong> {hike.region}</p>
            <p><strong>Сложность:</strong> {hike.complexity}</p>
            <p><strong>Даты:</strong> {new Date(hike.start_date).toLocaleDateString()} - {new Date(hike.end_date).toLocaleDateString()}</p>
          </div>
          <div className="mt-auto pt-6 space-y-4">
            <a href={`/hikes/${hike.id}/report`} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors text-lg font-semibold">
              Скачать PDF отчет
            </a>
            <a href={`/hikes/${hike.id}/route`} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-secondary text-secondary-foreground px-6 py-3 rounded-md hover:bg-secondary/90 transition-colors text-lg font-semibold">
              Скачать GPX маршрут
            </a>
            {hike.photos_archive && (
              <a href={hike.photos_archive.startsWith('http') ? hike.photos_archive : `https://${hike.photos_archive}`} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-secondary text-secondary-foreground px-6 py-3 rounded-md hover:bg-secondary/90 transition-colors text-lg font-semibold">
                Архив с фото
              </a>
            )}
          </div>
        </div>

        {/* Top-Right: Map */}
        <div className="h-96 lg:h-[500px] rounded-lg overflow-hidden border">
          {hike.geojson_data && <MapboxMap geojson={hike.geojson_data} />}
        </div>
      </div>

      {/* Bottom Area */}
      <div className="grid grid-cols-1 gap-8">
        {(hike.description || hike.route) && (
            <div className="bg-white p-8 rounded-lg border">
              {hike.description && (
                  <div>
                      <h2 className="text-3xl font-bold mb-4">Описание</h2>
                      <p className="text-lg whitespace-pre-wrap leading-relaxed">{hike.description}</p>
                  </div>
              )}
              {hike.route && (
                  <div className="mt-8">
                      <h2 className="text-3xl font-bold mb-4">Нитка маршрута</h2>
                      <p className="text-lg whitespace-pre-wrap leading-relaxed">{hike.route}</p>
                  </div>
              )}
            </div>
        )}

        <div className="bg-white p-8 rounded-lg border">
          <h2 className="text-3xl font-bold mb-4">Участники похода</h2>
          <HikeParticipants hikeId={hike.id} />
        </div>
      </div>
    </main>
  );
}
