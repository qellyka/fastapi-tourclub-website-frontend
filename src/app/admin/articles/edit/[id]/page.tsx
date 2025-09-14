'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import api from '@/lib/api';
import ArticleForm from '../../ArticleForm';
import { Article } from '@/types';
import { useState } from 'react';

async function fetchArticle(id: string): Promise<Article> {
  const { data } = await api.get(`/articles/${id}`); // Assuming the single article endpoint is /api/articles/{id}
  return data;
}

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: ['admin-article', id],
    queryFn: () => fetchArticle(id),
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => api.patch(`/articles/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-article', id] });
      router.push('/admin/articles');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || "Произошла ошибка");
    },
  });

  if (isLoading) return <div>Загрузка данных статьи...</div>;
  if (!article) return <div>Статья не найдена.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Редактировать статью</h1>
      <ArticleForm 
        initialData={article}
        onSubmit={mutation.mutate}
        isPending={mutation.isPending}
        submitButtonText="Обновить"
      />
      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
    </div>
  );
}
