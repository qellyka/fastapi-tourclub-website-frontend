
'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllHikes } from '@/lib/api';
import { Hike } from '@/types';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatDateRange } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function HikeCard({ hike }: { hike: Hike }) {
  return (
    <Link href={`/archive/hikes/${hike.slug}`} className="block group h-full">
      <Card className="h-full flex flex-col bg-card border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
        <CardHeader>
          <CardTitle className="group-hover:text-primary transition-colors duration-300">{hike.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-2"><strong>Нитка:</strong> {hike.route}</p>
        </CardContent>
        <CardFooter className="flex-col items-start text-sm text-muted-foreground bg-secondary/50 p-4">
          <p><strong>Регион:</strong> {hike.region}</p>
          <p><strong>Сложность:</strong> {hike.complexity}</p>
          <p><strong>Даты:</strong> {formatDateRange(hike.start_date, hike.end_date)}</p>
        </CardFooter>
      </Card>
    </Link>
  );
}

const HikesSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
    </div>
)

export default function HikesPage() {
  const [regionFilter, setRegionFilter] = useState('all');
  const [complexityFilter, setComplexityFilter] = useState('all');

  const { data: hikes, isLoading, error } = useQuery<Hike[]>({
    queryKey: ['hikes', 'published'],
    queryFn: async () => (await getAllHikes('published')).detail,
  });

  const uniqueRegions = useMemo(() => {
    if (!hikes) return [];
    return ['all', ...Array.from(new Set(hikes.map(h => h.region)))];
  }, [hikes]);

  const uniqueComplexities = useMemo(() => {
    if (!hikes) return [];
    return ['all', ...Array.from(new Set(hikes.map(h => h.complexity)))];
  }, [hikes]);

  const filteredHikes = useMemo(() => {
    if (!hikes) return [];
    return hikes.filter(hike => {
      const regionMatch = regionFilter === 'all' || hike.region === regionFilter;
      const complexityMatch = complexityFilter === 'all' || hike.complexity === complexityFilter;
      return regionMatch && complexityMatch;
    });
  }, [hikes, regionFilter, complexityFilter]);

  return (
    <div className="container mx-auto px-4 py-24 pt-28 md:pt-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold tracking-tighter">Архив походов</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Регион" />
            </SelectTrigger>
            <SelectContent>
              {uniqueRegions.map(region => (
                <SelectItem key={region} value={region}>{region === 'all' ? 'Все регионы' : region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={complexityFilter} onValueChange={setComplexityFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Сложность" />
            </SelectTrigger>
            <SelectContent>
              {uniqueComplexities.map(cat => (
                <SelectItem key={cat} value={cat}>{cat === 'all' ? 'Вся сложность' : cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading && <HikesSkeleton />}
      {error && <div className="text-center py-16 text-destructive bg-destructive/10 p-4 rounded-lg">Ошибка при загрузке походов.</div>}
      {!isLoading && !error && filteredHikes && filteredHikes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHikes.map((hike) => (
            <HikeCard key={hike.id} hike={hike} />
          ))}
        </div>
      ) : (
        !isLoading && !error && (
            <div className="text-center py-16 border-2 border-dashed rounded-lg mt-6 border-muted-foreground/30">
                <p className="text-lg font-medium text-muted-foreground">Походы не найдены</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Попробуйте изменить фильтры или загляните позже.</p>
            </div>
        )
      )}
    </div>
  );
}
