'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { getArticleById, updateArticle } from '@/lib/api';
import ArticleForm from '../../ArticleForm';
import { toast } from '@/hooks/use-toast';
import { Article, ContentStatus, UserRole } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
import { useMemo } from 'react';

export default function EditArticlePage() {
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: apiResponse, isLoading, isError } = useQuery<ApiResponse<Article>>({
    queryKey: ['article', id],
    queryFn: () => getArticleById(id as string),
    enabled: !!id,
  });

  const article = apiResponse?.detail;

  const mutation = useMutation({
    mutationFn: (updatedArticle: any) => updateArticle(id as string, updatedArticle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', id] });
      toast({ title: "Статья успешно обновлена" });
      router.push('/admin/articles');
    },
    onError: (error) => {
      toast({ title: "Ошибка при обновлении статьи", description: error.message, variant: "destructive" });
    },
  });

  const statusUpdateMutation = useMutation({
    mutationFn: (status: ContentStatus) => updateArticle(id as string, { status }),
    onSuccess: (data) => {
      queryClient.setQueryData(['article', id], data);
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({ title: "Статус статьи успешно обновлен" });
    },
    onError: (error) => {
      toast({ title: "Ошибка при обновлении статуса", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (data: any) => {
    mutation.mutate(data);
  };

  const handleStatusChange = (status: ContentStatus) => {
    statusUpdateMutation.mutate(status);
  };

  const userRole = user?.roles.includes('admin') ? 'admin' : user?.roles.includes('moderator') ? 'moderator' : 'user';

  const isEditable = useMemo(() => {
    if (!article || !user) return false;
    const status = article.status?.toLowerCase();
    const isAdmin = user.roles.includes('admin');
    const isModerator = user.roles.includes('moderator');

    if (status === 'draft' && (isAdmin || isModerator)) {
      return true;
    }
    if (status === 'review' && isAdmin) {
      return true;
    }
    return false;
  }, [article, user]);

  if (isLoading) return <div>Загрузка...</div>;
  if (isError) return <div>Ошибка при загрузке статьи.</div>;


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Редактировать статью</h1>
      <ArticleForm
        initialData={article}
        onSubmit={handleSubmit}
        isPending={mutation.isPending}
        submitButtonText="Обновить"
        onStatusChange={handleStatusChange}
        isStatusUpdatePending={statusUpdateMutation.isPending}
        userRole={userRole as UserRole}
        isEditable={isEditable}
      />
    </div>
  );
}