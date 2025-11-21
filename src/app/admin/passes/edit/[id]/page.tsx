'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useEffect, use, useMemo } from 'react';
import { ContentStatus, Pass, UserRole } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
import { PhotoUploader } from '@/components/PhotoUploader';

const passSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  region: z.string().min(1, "Регион обязателен"),
  complexity: z.string().min(1, "Сложность обязательна"),
  height: z.preprocess((val) => Number(val), z.number().min(1, "Высота обязательна и должна быть числом")),
  description: z.string().min(1, "Описание обязательно"),
  latitude: z.preprocess((val) => Number(String(val).replace(',', '.')), z.number().min(-90, "Широта не может быть меньше -90").max(90, "Широта не может быть больше 90")),
  longitude: z.preprocess((val) => Number(String(val).replace(',', '.')), z.number().min(-180, "Долгота не может быть меньше -180").max(180, "Долгота не может быть больше 180")),
  photos: z.array(z.string()).optional(),
});

type PassFormValues = z.infer<typeof passSchema>;

async function fetchPassById(id: string): Promise<Pass> {
  const { data } = await api.get(`/archive/passes/${id}`);
  return data.detail;
}

export default function EditPassPage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: passData, isLoading, isError } = useQuery<Pass>({
    queryKey: ['pass', id],
    queryFn: () => fetchPassById(id),
  });

  const { control, register, handleSubmit, formState: { errors }, reset } = useForm<PassFormValues>({
    resolver: zodResolver(passSchema),
    defaultValues: {
      photos: [],
    }
  });

  useEffect(() => {
    if (passData) {
      reset({
        ...passData,
        photos: passData.photos || [],
      });
    }
  }, [passData, reset]);

  const mutation = useMutation({
    mutationFn: (data: any) => api.patch(`/archive/passes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-passes'] });
      queryClient.invalidateQueries({ queryKey: ['pass', id] });
      toast({
        title: 'Успех!',
        description: 'Перевал успешно обновлен.',
      });
      router.push('/admin/passes');
    },
    onError: (err: any) => {
      const errorDetail = err.response?.data?.detail;
      let errorMessage = "Произошла ошибка при обновлении перевала.";
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

  const statusUpdateMutation = useMutation({
    mutationFn: (status: ContentStatus) => api.patch(`/archive/passes/${id}`, { status }),
    onSuccess: (data) => {
      queryClient.setQueryData(['pass', id], data.data.detail);
      queryClient.invalidateQueries({ queryKey: ['admin-passes'] });
      toast({ title: "Статус перевала успешно обновлен" });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка при обновлении статуса", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: PassFormValues) => {
    mutation.mutate(data);
  };

  const handleStatusChange = (status: ContentStatus) => {
    statusUpdateMutation.mutate(status);
  };

  const userRole = user?.roles.includes('admin') ? 'admin' : user?.roles.includes('moderator') ? 'moderator' : 'user';

  const isEditable = useMemo(() => {
    if (!passData || !user) return false;
    const status = passData.status?.toLowerCase();
    const isAdmin = user.roles.includes('admin');
    const isModerator = user.roles.includes('moderator');

    if (status === 'draft' && (isAdmin || isModerator)) {
      return true;
    }
    if (status === 'review' && isAdmin) {
      return true;
    }
    return false;
  }, [passData, user]);

  const renderStatusButtons = () => {
    if (!user || !passData) return null;

    const isAdmin = user.roles.includes('admin');
    const isModerator = user.roles.includes('moderator');
    const status = passData.status;

    switch (status?.toLowerCase()) {
      case 'published':
        return isAdmin ? (
          <div className="flex items-center space-x-2">
            <Button type="button" onClick={() => handleStatusChange('draft')} disabled={statusUpdateMutation.isPending}>
              Отправить на редактирование
            </Button>
            <Button type="button" onClick={() => handleStatusChange('archived')} disabled={statusUpdateMutation.isPending} variant="secondary">
              Архивировать
            </Button>
          </div>
        ) : null;
      case 'draft':
        return (isAdmin || isModerator) ? (
          <div className="flex items-center space-x-2">
            <Button type="button" onClick={() => handleStatusChange('review')} disabled={statusUpdateMutation.isPending}>
              Отправить на проверку
            </Button>
            {isAdmin && (
                <Button type="button" onClick={() => handleStatusChange('archived')} disabled={statusUpdateMutation.isPending} variant="secondary">
                    Архивировать
                </Button>
            )}
          </div>
        ) : null;
      case 'review':
        return isAdmin ? (
          <div className="flex items-center space-x-2">
            <Button type="button" onClick={() => handleStatusChange('published')} disabled={statusUpdateMutation.isPending} variant="success">
              Опубликовать
            </Button>
            <Button type="button" onClick={() => handleStatusChange('draft')} disabled={statusUpdateMutation.isPending} variant="destructive">
              Отклонить
            </Button>
            <Button type="button" onClick={() => handleStatusChange('archived')} disabled={statusUpdateMutation.isPending} variant="secondary">
                Архивировать
            </Button>
          </div>
        ) : null;
      case 'archived':
        return isAdmin ? (
          <div className="flex items-center space-x-2">
            <Button type="button" onClick={() => handleStatusChange('draft')} disabled={statusUpdateMutation.isPending}>
              Разархивировать
            </Button>
          </div>
        ) : null;
      default:
        return null;
    }
  };

  if (isLoading) return <div className="container mx-auto px-4 py-24 text-center">Загрузка данных перевала...</div>;
  if (isError) return <div className="container mx-auto px-4 py-24 text-center">Не удалось загрузить данные перевала.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Редактировать перевал</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <fieldset disabled={!isEditable} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Название</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Регион</Label>
              <Input id="region" {...register('region')} />
              {errors.region && <p className="text-sm text-red-500">{errors.region.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="complexity">Сложность</Label>
              <Input id="complexity" {...register('complexity')} />
              {errors.complexity && <p className="text-sm text-red-500">{errors.complexity.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Высота (м)</Label>
              <Input id="height" type="number" step="1" {...register('height')} />
              {errors.height && <p className="text-sm text-red-500">{errors.height.message as string}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="latitude">Широта</Label>
                <Input id="latitude" type="text" {...register('latitude')} />
                {errors.latitude && <p className="text-sm text-red-500">{errors.latitude.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Долгота</Label>
                <Input id="longitude" type="text" {...register('longitude')} />
                {errors.longitude && <p className="text-sm text-red-500">{errors.longitude.message as string}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea id="description" {...register('description')} />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Фотографии</Label>
              <Controller
                control={control}
                name="photos"
                render={({ field }) => (
                  <PhotoUploader
                    value={field.value || []}
                    onChange={field.onChange}
                    isEditable={isEditable}
                  />
                )}
              />
              {errors.photos && <p className="text-sm text-red-500">{errors.photos.message}</p>}
            </div>
        </fieldset>

        <div className="flex justify-between items-center">
            {isEditable && (
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
            )}
            {renderStatusButtons()}
        </div>
      </form>
    </div>
  );
}