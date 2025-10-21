'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useMemo } from 'react';
import { ContentStatus, Hike, User, UserRole } from '@/types';
import { UserSearchCombobox } from '@/components/UserSearchCombobox';
import { PlusCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

const hikeFormSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  tourism_type: z.string().min(1, "Тип туризма обязателен"),
  complexity: z.string().min(1, "Сложность обязательна"),
  region: z.string().optional(),
  route: z.string().min(1, "Нитка маршрута обязательна"),
  start_date: z.string(),
  end_date: z.string(),
  description: z.string().optional(),
  participants_count: z.coerce.number().int().positive("Количество участников должно быть положительным числом"),
  duration_days: z.coerce.number().int().positive("Продолжительность должна быть положительным числом").optional(),
  distance_km: z.coerce.number().positive("Протяженность должна быть положительным числом").optional(),
  difficulty_distribution: z.array(z.object({
    name: z.string().min(1, "Название категории обязательно"),
    count: z.coerce.number().int().min(1, "Количество должно быть больше 0"),
  })).optional(),
  leader_id: z.string().min(1, "Руководитель обязателен"),
  photos_archive: z.string().url("Неверный формат URL").optional().or(z.literal('')),
  report_file: z.instanceof(FileList).optional(),
  gpx_file: z.instanceof(FileList).optional(),
});

type HikeFormValues = z.infer<typeof hikeFormSchema>;

async function fetchHikeById(id: string): Promise<{ detail: Hike }> {
  const { data } = await api.get(`/archive/hikes/${id}`);
  return data;
}

async function fetchUsers(): Promise<{ detail: User[] }> {
  const { data } = await api.get('/users');
  return data;
}

export default function EditHikePage() {
  const router = useRouter();
  const params = useParams();
  const hikeId = params.id as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: hikeData, isLoading: isHikeLoading, isError: isHikeError } = useQuery<Hike>({
    queryKey: ['hike', hikeId],
    queryFn: () => fetchHikeById(hikeId),
    enabled: !!hikeId,
    select: (data) => data.detail,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    select: (data) => data.detail,
  });

  const form = useForm<HikeFormValues>({
    resolver: zodResolver(hikeFormSchema),
    mode: "onChange",
    defaultValues: {
        name: '',
        tourism_type: '',
        complexity: '',
        region: '',
        route: '',
        start_date: '',
        end_date: '',
        description: '',
        participants_count: 1,
        duration_days: undefined,
        distance_km: undefined,
        difficulty_distribution: [],
        leader_id: '',
        photos_archive: '',
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "difficulty_distribution"
  });

  useEffect(() => {
    if (hikeData) {
      const distributionArray = hikeData.difficulty_distribution
        ? Object.entries(hikeData.difficulty_distribution).map(([name, count]) => ({ name, count }))
        : [];

      form.reset({
        ...hikeData,
        start_date: hikeData.start_date.split('T')[0],
        end_date: hikeData.end_date.split('T')[0],
        leader_id: String(hikeData.leader_id),
        difficulty_distribution: distributionArray,
        photos_archive: hikeData.photos_archive || '',
      });
    }
  }, [hikeData, form]);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => api.patch(`/archive/hikes/${hikeId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hike', hikeId] });
      queryClient.invalidateQueries({ queryKey: ['admin-hikes'] });
      toast({ title: 'Успех!', description: 'Поход успешно обновлен.' });
      router.push('/admin/hikes');
    },
    onError: (err: any) => {
      const errorDetail = err.response?.data?.detail;
      let errorMessage = "Произошла ошибка при обновлении похода.";
      if (typeof errorDetail === 'string') errorMessage = errorDetail;
      else if (errorDetail) errorMessage = JSON.stringify(errorDetail);
      toast({ title: 'Ошибка!', description: errorMessage, variant: 'destructive' });
    },
  });

  const statusUpdateMutation = useMutation({
    mutationFn: (status: ContentStatus) => api.patch(`/archive/hikes/${hikeId}`, { update_data: JSON.stringify({ status }) }),
    onSuccess: (data) => {
      queryClient.setQueryData(['hike', hikeId], data);
      queryClient.invalidateQueries({ queryKey: ['admin-hikes'] });
      toast({ title: "Статус похода успешно обновлен" });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка при обновлении статуса", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: HikeFormValues) => {
    const formData = new FormData();
    const changedFields = form.formState.dirtyFields;
    const jsonData: { [key: string]: any } = {};

    Object.keys(data).forEach(key => {
        const formKey = key as keyof HikeFormValues;
        if (changedFields[formKey]) {
            if (formKey === 'report_file' || formKey === 'gpx_file') {
                const fileList = data[formKey] as FileList | undefined;
                if (fileList && fileList.length > 0) {
                    formData.append(formKey, fileList[0]);
                }
            } else if (formKey === 'difficulty_distribution') {
                const distribution = data[formKey];
                if (distribution) {
                    const distributionObject = distribution.reduce((acc, item) => {
                        if(item.name && item.count) acc[item.name] = item.count;
                        return acc;
                    }, {} as {[key: string]: number});
                    jsonData[formKey] = distributionObject;
                }
            } else {
                jsonData[formKey] = data[formKey];
            }
        }
    });

    if (Object.keys(jsonData).length > 0) {
        formData.append('update_data', JSON.stringify(jsonData));
    }

    if (formData.has('update_data') || formData.has('report_file') || formData.has('gpx_file')) {
        mutation.mutate(formData);
    } else {
        toast({ title: 'Нет изменений', description: 'Вы не внесли никаких изменений.' });
    }
  };

  const handleStatusChange = (status: ContentStatus) => {
    statusUpdateMutation.mutate(status);
  };

  const userRole = user?.roles.includes('admin') ? 'admin' : user?.roles.includes('moderator') ? 'moderator' : 'user';

  const isEditable = useMemo(() => {
const status = hikeData.status?.toLowerCase() as ContentStatus;
    const isAdmin = user.roles.includes('admin');
    const isModerator = user.roles.includes('moderator');

    if (status === 'draft' && (isAdmin || isModerator)) {
      return true;
    }
    if (status === 'review' && isAdmin) {
      return true;
    }
    return false;
  }, [hikeData, user]);

  const renderStatusButtons = () => {
    if (!user || !hikeData) return null;

    const isAdmin = user.roles.includes('admin');
    const isModerator = user.roles.includes('moderator');
    const status = hikeData.status as ContentStatus;

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

  if (isHikeLoading || usersLoading) {
    return <div className="container mx-auto px-4 py-24 text-center">Загрузка...</div>;
  }

  if (isHikeError || !hikeData) {
    return <div className="container mx-auto px-4 py-24 text-center text-destructive">Ошибка загрузки похода.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader><CardTitle>Редактировать: {hikeData.name}</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <fieldset disabled={!isEditable} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Название</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tourism_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Тип туризма</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="complexity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Сложность</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="region"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Регион</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="route"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Нитка маршрута</FormLabel>
                                <FormControl><Textarea {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="start_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Дата начала</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="end_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Дата окончания</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Описание</FormLabel>
                                <FormControl><Textarea {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                            control={form.control}
                            name="participants_count"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Кол-во участников</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="duration_days"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Продолжительность (дни)</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="distance_km"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Протяженность (км)</FormLabel>
                                    <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <div className="flex flex-col">
                        <Label>Распределение сложностей</Label>
                        {fields.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-2 mt-2">
                                <Input {...form.register(`difficulty_distribution.${index}.name`)} placeholder="Категория (1А, 2Б...)" className="w-1/2" />
                                <Input type="number" {...form.register(`difficulty_distribution.${index}.count`)} placeholder="Количество" className="w-1/2" />
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" className="mt-2 w-fit" onClick={() => append({ name: '', count: 1 })}><PlusCircle className="h-4 w-4 mr-2"/>Добавить препятствие</Button>
                    </div>

                    <FormField
                        control={form.control}
                        name="leader_id"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Руководитель</FormLabel>
                                <UserSearchCombobox
                                    users={usersData || []}
                                    value={field.value}
                                    onSelect={field.onChange}
                                    placeholder={usersLoading ? "Загрузка..." : "Выберите руководителя"}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="report_file"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                            <FormItem>
                                <FormLabel>Новый файл отчета (PDF)</FormLabel>
                                <FormControl><Input type="file" accept=".pdf" onChange={e => onChange(e.target.files)} {...fieldProps} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gpx_file"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                            <FormItem>
                                <FormLabel>Новый GPX трек</FormLabel>
                                <FormControl><Input type="file" accept=".gpx" onChange={e => onChange(e.target.files)} {...fieldProps} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="photos_archive"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ссылка на фотоархив</FormLabel>
                                <FormControl><Input type="url" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </fieldset>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    {isEditable && (
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Сохранение..." : "Сохранить изменения"}
                        </Button>
                    )}
                    <Button type="button" variant="outline" onClick={() => router.push('/admin/hikes')}>
                    Отмена
                    </Button>
                </div>
                {renderStatusButtons()}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}