'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getArticleById, updateArticle } from '@/lib/api';
import ArticleForm, { ArticleFormValues } from '../../ArticleForm';
import { Article } from '@/types';
import { toast } from '@/hooks/use-toast'; // Import toast

import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { ContentStatus } from '@/types';

export default function EditForm({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: ['admin-article', id],
    queryFn: async () => (await getArticleById(Number(id))).detail,
  });

  const mutation = useMutation({
    mutationFn: (data: ArticleFormValues) => updateArticle(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-article', id] });
      toast({
        title: 'Успех!',
        description: 'Статья успешно обновлена.',
      });
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

  const statusMutation = useMutation({
    mutationFn: (status: ContentStatus) => updateArticle(Number(id), { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-article', id] });
      toast({ title: 'Успех!', description: 'Статус статьи успешно обновлен.' });
    },
    onError: (err: any) => {
      const errorDetail = err.response?.data?.detail;
      let errorMessage = "Произошла ошибка при обновлении статуса.";
      if (typeof errorDetail === 'string') errorMessage = errorDetail;
      else if (errorDetail) errorMessage = JSON.stringify(errorDetail);
      toast({ title: 'Ошибка!', description: errorMessage, variant: 'destructive' });
    },
  });

  if (isLoading) return <div>Загрузка данных статьи...</div>;
  if (!article) return <div>Статья не найдена.</div>;

  const isAdmin = user?.roles?.includes('admin');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Редактировать статью</h1>
        <div className="flex gap-2">
          {isAdmin && article.status === 'review' && (
            <Button onClick={() => statusMutation.mutate('published')}>Одобрить</Button>
          )}
          {isAdmin && (article.status === 'review' || article.status === 'published') && (
            <Button variant="outline" onClick={() => statusMutation.mutate('draft')}>Отправить на доработку</Button>
          )}
          {isAdmin && article.status === 'published' && (
            <Button variant="destructive" onClick={() => statusMutation.mutate('archived')}>Архивировать</Button>
          )}
          {!isAdmin && article.status === 'draft' && (
            <Button onClick={() => statusMutation.mutate('review')}>Отправить на модерацию</Button>
          )}
        </div>
      </div>
      <ArticleForm 
        initialData={article}
        onSubmit={mutation.mutate}
        isPending={mutation.isPending}
        submitButtonText="Обновить"
      />
    </div>
  );
}
