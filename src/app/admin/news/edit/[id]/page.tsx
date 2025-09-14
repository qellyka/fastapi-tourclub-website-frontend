'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import api from '@/lib/api';
import NewsForm from './NewsForm';
import { News } from '@/types';
import { useState } from 'react';

async function fetchNews(id: string): Promise<News> {
  const { data } = await api.get(`/news/${id}`); // Assuming the single news endpoint is /api/news/{id}
  return data;
}

export default function EditNewsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: newsItem, isLoading } = useQuery<News>({
    queryKey: ['admin-news-item', id],
    queryFn: () => fetchNews(id),
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => api.patch(`/news/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['admin-news-item', id] });
      router.push('/admin/news');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || "Произошла ошибка");
    },
  });

  if (isLoading) return <div>Загрузка данных новости...</div>;
  if (!newsItem) return <div>Новость не найдена.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Редактировать новость</h1>
      <NewsForm 
        initialData={newsItem}
        onSubmit={mutation.mutate}
        isPending={mutation.isPending}
        submitButtonText="Обновить"
      />
      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
    </div>
  );
}
