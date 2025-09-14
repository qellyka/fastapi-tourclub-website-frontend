'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Pass, Hike } from '@/types';
import Link from 'next/link';
import { use } from 'react';
import MapboxMap from '@/components/MapboxMap'; // Import Map component

async function fetchPassById(id: string): Promise<Pass> {
  const { data } = await api.get(`/archive/passes/${id}`);
  return data;
}

async function fetchHikesForPass(id: string): Promise<Hike[]> {
  const { data } = await api.get(`/archive/passes/${id}/hikes`);
  return data;
}

export default function PassDetailPage({ params }: { params: { id: string } }) {
  const { id } = use(params);

  const { data: pass, isLoading: isLoadingPass, error: errorPass } = useQuery<any>({ 
    queryKey: ['pass', id], 
    queryFn: () => fetchPassById(id), 
    select: (data) => data.detail, // Extract the object from the response
  });

  const { data: hikes, isLoading: isLoadingHikes, error: errorHikes } = useQuery<any>({ 
    queryKey: ['hikesForPass', id], 
    queryFn: () => fetchHikesForPass(id),
    select: (data) => data.detail, // Extract the array from the response object
  });

  // Placeholder for pass location - to be replaced with actual data when available
  const passGeoJson = pass && pass.latitude && pass.longitude ? {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [pass.longitude, pass.latitude]
      }
    }]
  } : null;

  if (isLoadingPass) return <div className="container mx-auto px-4 py-24 text-center">Загрузка...</div>;
  if (errorPass) return <div className="container mx-auto px-4 py-24 text-center">Перевал не найден.</div>;
  if (!pass) return null;

  return (
    <main className="container mx-auto px-4 py-24">
      <h1 className="text-4xl lg:text-5xl font-bold mb-8 text-center">Перевал {pass.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top-Left: Info */}
        <div className="bg-gray-50 p-6 rounded-lg border h-full flex flex-col">
          <h2 className="text-3xl font-bold mb-4">Информация</h2>
          <div className="space-y-2 text-lg">
            <p><strong>Регион:</strong> {pass.region}</p>
            <p><strong>Сложность:</strong> {pass.complexity}</p>
            <p><strong>Высота:</strong> {pass.height} м</p>
          </div>
        </div>

        {/* Top-Right: Map or Photo Placeholder */}
        <div className="h-96 lg:h-[500px] rounded-lg overflow-hidden border bg-gray-200 flex items-center justify-center">
          {passGeoJson ? (
            <MapboxMap geojson={passGeoJson} />
          ) : (
            <p className="text-gray-500">Карта недоступна (нет данных о координатах)</p>
          )}
        </div>
      </div>

      {/* Bottom Area */}
      <div className="grid grid-cols-1 gap-8">
        {pass.description && (
          <div className="bg-white p-8 rounded-lg border">
            <h2 className="text-3xl font-bold mb-4">Описание</h2>
            <p className="text-lg whitespace-pre-wrap leading-relaxed">{pass.description}</p>
          </div>
        )}

        <div className="bg-white p-8 rounded-lg border">
          <h2 className="text-3xl font-bold mb-4">Походы через перевал</h2>
          {isLoadingHikes && <p>Загрузка походов...</p>}
          {errorHikes && <p>Не удалось загрузить походы.</p>}
          {hikes && hikes.length > 0 ? (
            <div className="space-y-4">
              {hikes.map(hike => (
                <Link key={hike.id} href={`/archive/hikes/${hike.id}`} className="block border p-4 rounded-lg hover:bg-gray-100 transition-colors">
                  <h3 className="font-semibold text-lg">{hike.name}</h3>
                  <p className="text-sm text-gray-600">{hike.region} / {new Date(hike.start_date).getFullYear()}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p>Нет информации о походах через этот перевал.</p>
          )}
        </div>
      </div>
    </main>
  );
}