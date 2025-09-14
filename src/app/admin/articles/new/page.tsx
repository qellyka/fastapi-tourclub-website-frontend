'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ArticleForm from '../ArticleForm';
import { useState } from 'react';

export default function NewArticlePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => api.post('/articles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      router.push('/admin/articles');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || "Произошла ошибка");
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Создать новую статью</h1>
      <ArticleForm 
        onSubmit={mutation.mutate}
        isPending={mutation.isPending}
        submitButtonText="Создать"
      />
      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
    </div>
  );
}
