'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getNewsById, updateNews } from '@/lib/api';
import NewsForm, { NewsFormValues } from '../../NewsForm';
import { News } from '@/types';
import { toast } from '@/hooks/use-toast'; // Import toast

export default function EditNewsForm({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: news, isLoading } = useQuery<News>({
    queryKey: ['admin-news', id],
    queryFn: async () => (await getNewsById(Number(id))).detail,
  });

  const mutation = useMutation({
    mutationFn: (data: NewsFormValues) => updateNews(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['admin-news', id] });
      toast({
        title: 'Успех!',
        description: 'Новость успешно обновлена.',
      });
      // Optionally, you can still redirect after a short delay if needed, or remove it completely
      // router.push('/admin/news');
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

  if (isLoading) return <div>Загрузка данных новости...</div>;
  if (!news) return <div>Новость не найдена.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Редактировать новость</h1>
      <NewsForm 
        initialData={news}
        onSubmit={mutation.mutate}
        isPending={mutation.isPending}
        submitButtonText="Обновить"
      />
    </div>
  );
}
