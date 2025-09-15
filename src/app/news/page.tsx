'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { News } from '@/types';
import ContentCard from '@/components/ContentCard';

async function fetchNews(): Promise<any> {
  const { data } = await api.get('/news');
  return data;
}

export default function NewsPage() {
  const { data: news, isLoading, error } = useQuery<any>({ 
    queryKey: ['news'], 
    queryFn: fetchNews, 
    select: (data) => data.detail,
  });

  if (isLoading) return <div className="container mx-auto px-4 py-24 text-center">Загрузка новостей...</div>;
  if (error) return <div className="container mx-auto px-4 py-24 text-center">Не удалось загрузить новости.</div>;

  return (
    <div className="container mx-auto px-4 py-24 flex-grow flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Новости</h1>
      {news && news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <ContentCard key={item.id} item={item} type="news" />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg mt-6">
          <p className="text-lg font-medium text-gray-500">Новостей пока нет</p>
          <p className="text-sm text-gray-400 mt-1">Загляните позже, мы обязательно что-нибудь опубликуем.</p>
        </div>
      )}
    </div>
  );
}
