'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Hike } from '@/types';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatDateRange } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

async function fetchHikes(): Promise<any> {
  const { data } = await api.get('/archive/hikes');
  return data;
}

function HikeCard({ hike }: { hike: Hike }) {
  return (
    <Link href={`/archive/hikes/${hike.id}`} className="block group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors duration-300 mb-2">{hike.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2"><strong>Нитка:</strong> {hike.route}</p>
      </div>
      <div className="p-4 border-t border-gray-100 bg-gray-50 text-sm text-gray-700">
        <p><strong>Регион:</strong> {hike.region}</p>
        <p><strong>Сложность:</strong> {hike.complexity}</p>
        <p><strong>Даты:</strong> {formatDateRange(hike.start_date, hike.end_date)}</p>
      </div>
    </Link>
  );
}

export default function HikesPage() {
  const [regionFilter, setRegionFilter] = useState('all');
  const [complexityFilter, setComplexityFilter] = useState('all');

  const { data: hikes, isLoading, error } = useQuery<Hike[]>({
    queryKey: ['hikes'],
    queryFn: fetchHikes,
    select: (data) => data.detail,
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

  if (isLoading) return <div className="container mx-auto px-4 py-24 text-center">Загрузка походов...</div>;
  if (error) return <div className="container mx-auto px-4 py-24 text-center">Ошибка при загрузке походов.</div>;

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Архив походов</h1>
        <div className="flex gap-4">
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Регион" />
            </SelectTrigger>
            <SelectContent>
              {uniqueRegions.map(region => (
                <SelectItem key={region} value={region}>{region === 'all' ? 'Все регионы' : region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={complexityFilter} onValueChange={setComplexityFilter}>
            <SelectTrigger className="w-[180px]">
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
      {filteredHikes && filteredHikes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHikes.map((hike) => (
            <HikeCard key={hike.id} hike={hike} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg mt-6">
          <p className="text-lg font-medium text-gray-500">Походы не найдены</p>
          <p className="text-sm text-gray-400 mt-1">Попробуйте изменить фильтры или загляните позже.</p>
        </div>
      )}
    </div>
  );
}