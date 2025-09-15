'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import InitialArticleForm from '../InitialArticleForm';
import { useState } from 'react';
import { Article } from '@/types';

export default function NewArticlePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => api.post<Article>('/articles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      // The server returns the created article with its ID nested under 'detail'
      router.push(`/admin/articles/edit/${data.data.detail.id}`);
    },
    onError: (err: any) => {
      const errorDetail = err.response?.data?.detail;
      if (typeof errorDetail === 'string') {
        setError(errorDetail);
      } else if (errorDetail) {
        setError(JSON.stringify(errorDetail));
      } else {
        setError("Произошла неизвестная ошибка");
      }
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Создать новую статью</h1>
      <InitialArticleForm 
        onSubmit={mutation.mutate}
        isPending={mutation.isPending}
      />
      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
    </div>
  );
}
