'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Article } from '@/types';
import ContentCard from '@/components/ContentCard';

async function fetchArticles(): Promise<Article[]> {
  const { data } = await api.get('/articles');
  return data;
}

export default function ArticlesPage() {
  const { data: articles, isLoading, error } = useQuery<any>({ 
    queryKey: ['articles'], 
    queryFn: fetchArticles, 
    select: (data) => data.detail, // Extract the array from the response object
  });

  if (isLoading) return <div>Загрузка статей...</div>;
  if (error) return <div>Ошибка при загрузке статей: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold mb-6">Статьи</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles?.map((item) => (
          <ContentCard key={item.id} item={item} type="articles" />
        ))}
      </div>
    </div>
  );
}
