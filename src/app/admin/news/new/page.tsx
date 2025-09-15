'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import InitialNewsForm from '../InitialNewsForm';
import { useState } from 'react';
import { News } from '@/types'; // Assuming a News type exists

export default function NewNewsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => api.post<News>('/news', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      // The server returns the created news with its ID nested under 'detail'
      router.push(`/admin/news/edit/${data.data.detail.id}`);
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
      <h1 className="text-2xl font-bold mb-6">Создать новую новость</h1>
      <InitialNewsForm 
        onSubmit={mutation.mutate}
        isPending={mutation.isPending}
      />
      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
    </div>
  );
}
