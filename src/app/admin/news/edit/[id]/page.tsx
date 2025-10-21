'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { getNewsById, updateNews } from '@/lib/api';
import NewsForm from '../../NewsForm';
import { toast } from '@/hooks/use-toast';
import { ContentStatus, News, UserRole } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
import { useMemo } from 'react';

export default function EditNewsPage() {
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: apiResponse, isLoading, isError } = useQuery<ApiResponse<News>>({
    queryKey: ['news-item', id],
    queryFn: () => getNewsById(id as string),
    enabled: !!id,
  });
  
  const newsItem = apiResponse?.detail;

  const mutation = useMutation({
    mutationFn: (updatedNews: any) => updateNews(id as string, updatedNews),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news-item', id] });
      toast({ title: "Новость успешно обновлена" });
      router.push('/admin/news');
    },
    onError: (error) => {
      toast({ title: "Ошибка при обновлении новости", description: error.message, variant: "destructive" });
    },
  });

  const statusUpdateMutation = useMutation({
    mutationFn: (status: ContentStatus) => updateNews(id as string, { status }),
    onSuccess: (data) => {
      queryClient.setQueryData(['news-item', id], data);
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      toast({ title: "Статус новости успешно обновлен" });
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
    if (!newsItem || !user) return false;
    const status = newsItem.status?.toLowerCase();
    const isAdmin = user.roles.includes('admin');
    const isModerator = user.roles.includes('moderator');

    if (status === 'draft' && (isAdmin || isModerator)) {
      return true;
    }
    if (status === 'review' && isAdmin) {
      return true;
    }
    return false;
  }, [newsItem, user]);

  if (isLoading) return <div>Загрузка...</div>;
  if (isError) return <div>Ошибка при загрузке новости.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Редактировать новость</h1>
      <NewsForm 
        initialData={newsItem} 
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