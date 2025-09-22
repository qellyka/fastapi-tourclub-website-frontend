
'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Pass, Hike } from '@/types';
import Link from 'next/link';
import { use, useState } from 'react';
import MapboxMap from '@/components/MapboxMap';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

async function fetchPassById(id: string): Promise<{ detail: Pass }> {
  const { data } = await api.get(`/archive/passes/${id}`);
  return data;
}

async function fetchHikesForPass(id: string): Promise<{ detail: Hike[] }> {
  const { data } = await api.get(`/archive/passes/${id}/hikes`);
  return data;
}

export default function PassDetailPage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: pass, isLoading: isLoadingPass, error: errorPass } = useQuery<Pass>({
    queryKey: ['pass', id],
    queryFn: () => fetchPassById(id),
    select: (data) => data.detail,
  });

  const { data: hikes, isLoading: isLoadingHikes, error: errorHikes } = useQuery<Hike[]>({
    queryKey: ['hikesForPass', id],
    queryFn: () => fetchHikesForPass(id),
    select: (data) => data.detail,
  });

  const passGeoJson = pass && pass.latitude && pass.longitude ? {
    type: 'FeatureCollection' as const,
    features: [{
      type: 'Feature' as const,
      properties: { name: pass.name },
      geometry: {
        type: 'Point' as const,
        coordinates: [pass.longitude, pass.latitude]
      }
    }]
  } : null;

  if (isLoadingPass) return (
    <div className="container mx-auto px-4 py-24 pt-28 md:pt-32">
        <Skeleton className="h-12 w-2/3 mx-auto mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 lg:h-[500px] w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
    </div>
  );
  if (errorPass) return <div className="container mx-auto px-4 py-24 text-center">Перевал не найден.</div>;
  if (!pass) return null;

  return (
    <main className="container mx-auto px-4 py-24 pt-28 md:pt-32">
      <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-8 text-center">Перевал {pass.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader><CardTitle>Информация</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-lg">
                    <p><strong>Регион:</strong> {pass.region}</p>
                    <p><strong>Сложность:</strong> {pass.complexity}</p>
                    <p><strong>Высота:</strong> {pass.height} м</p>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-3 h-96 lg:h-[500px] rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
          {passGeoJson ? (
            <MapboxMap geojson={passGeoJson} />
          ) : (
            <p className="text-muted-foreground">Карта недоступна (нет данных о координатах)</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {pass.description && (
          <Card>
            <CardHeader><CardTitle>Описание</CardTitle></CardHeader>
            <CardContent className="text-base whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {pass.description}
            </CardContent>
          </Card>
        )}

        {pass.photos && pass.photos.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Фотографии</CardTitle></CardHeader>
            <CardContent>
                <Carousel opts={{ align: "start", loop: true }}>
                <CarouselContent>
                    {pass.photos.map((photo, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
                        <div className="p-1">
                        <button onClick={() => setSelectedImage(photo)} className="w-full h-full rounded-lg overflow-hidden">
                            <Image src={photo} alt={`Фото перевала ${index + 1}`} width={400} height={400} className="w-full h-64 object-cover cursor-pointer transition-transform duration-300 hover:scale-105" />
                        </button>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
                </Carousel>
            </CardContent>
          </Card>
        )}

        {selectedImage && (
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-4xl h-auto bg-transparent border-0 shadow-none">
              <DialogTitle className="sr-only">Просмотр фотографии перевала</DialogTitle>
              <Image src={selectedImage} alt="Фото перевала" width={1920} height={1080} className="w-full h-full object-contain" />
            </DialogContent>
          </Dialog>
        )}

        <Card>
            <CardHeader><CardTitle>Походы через перевал</CardTitle></CardHeader>
            <CardContent>
                {isLoadingHikes && <p>Загрузка походов...</p>}
                {errorHikes && <p className="text-destructive">Не удалось загрузить походы.</p>}
                {hikes && hikes.length > 0 ? (
                    <div className="space-y-2">
                    {hikes.map(hike => (
                        <Link key={hike.id} href={`/archive/hikes/${hike.id}`} className="block border p-4 rounded-md hover:bg-secondary transition-colors">
                        <h3 className="font-semibold text-lg">{hike.name}</h3>
                        <p className="text-sm text-muted-foreground">{hike.region} / {new Date(hike.start_date).getFullYear()}</p>
                        </Link>
                    ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">Нет информации о походах через этот перевал.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
