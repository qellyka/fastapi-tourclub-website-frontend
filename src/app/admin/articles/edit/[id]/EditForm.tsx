'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ArticleForm, { ArticleFormValues } from '../../ArticleForm';
import { Article } from '@/types';
import { toast } from '@/hooks/use-toast'; // Import toast

async function fetchArticle(id: string): Promise<Article> {
  const { data } = await api.get(`/articles/${id}`); // Assuming the single article endpoint is /api/articles/{id}
  return data.detail; // Return the nested detail object
}

export default function EditForm({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: ['admin-article', id],
    queryFn: () => fetchArticle(id),
  });

  const mutation = useMutation({
    mutationFn: (data: ArticleFormValues) => api.patch(`/articles/${id}`, data), // Send JSON data
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-article', id] });
      toast({
        title: 'Успех!',
        description: 'Статья успешно обновлена.',
      });
      // Optionally, you can still redirect after a short delay if needed, or remove it completely
      // router.push('/admin/articles');
    },
    onError: (err: any) => {
      const errorDetail = err.response?.data?.detail;
      let errorMessage = "Произошла неизвестная ошибка";
      if (typeof errorDetail === 'string') {
        errorMessage = errorDetail;
      } else if (errorDetail) {
        errorMessage = JSON.stringify(errorDetail);
      }
      toast({
        title: 'Ошибка!',
        description: errorMessage,
        variant: 'destructive',
      });
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
    </div>
  );
}
