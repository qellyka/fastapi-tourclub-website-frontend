'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { UserSearchCombobox } from '@/components/UserSearchCombobox';
import { User } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusCircle, XCircle } from 'lucide-react';

const hikeSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  tourism_type: z.string().min(1, "Тип туризма обязателен"),
  complexity: z.string().min(1, "Сложность обязательна"),
  region: z.string().optional(),
  route: z.string().min(1, "Нитка маршрута обязательна"),
  start_date: z.string().min(1, "Дата начала обязательна"),
  end_date: z.string().min(1, "Дата конца обязательна"),
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
  report_file: z.instanceof(FileList).refine(files => files?.length === 1, "Файл отчета обязателен."),
  gpx_file: z.instanceof(FileList).refine(files => files?.length === 1, "GPX трек обязателен."),
});

type HikeFormValues = z.infer<typeof hikeSchema>;

async function fetchUsers(): Promise<{ detail: User[] }> {
  const { data } = await api.get('/users');
  return data;
}

export default function NewHikePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: usersData, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    select: (data) => data.detail,
  });

  const form = useForm<HikeFormValues>({
    resolver: zodResolver(hikeSchema),
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
        duration_days: '',
        distance_km: '',
        difficulty_distribution: [],
        leader_id: '',
        photos_archive: '',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "difficulty_distribution"
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => api.post('/archive/hikes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hikes'] });
      toast({ title: 'Успех!', description: 'Поход успешно добавлен.' });
      router.push('/admin/hikes');
    },
    onError: (err: any) => {
      const errorDetail = err.response?.data?.detail;
      let errorMessage = "Произошла ошибка при добавлении похода.";
      if (typeof errorDetail === 'string') errorMessage = errorDetail;
      else if (errorDetail) errorMessage = JSON.stringify(errorDetail);
      toast({ title: 'Ошибка!', description: errorMessage, variant: 'destructive' });
    },
  });

  const onSubmit = (data: HikeFormValues) => {
    const formData = new FormData();

    const { report_file, gpx_file, difficulty_distribution, ...hikeData } = data;

    const jsonData: any = { ...hikeData };

    if (difficulty_distribution && difficulty_distribution.length > 0) {
        const distributionObject = difficulty_distribution.reduce((acc, item) => {
            if(item.name && item.count) acc[item.name] = item.count;
            return acc;
        }, {} as {[key: string]: number});
        jsonData.difficulty_distribution = distributionObject;
    }

    formData.append('hike', JSON.stringify(jsonData));

    if (report_file instanceof FileList && report_file.length > 0) {
        formData.append('report_file', report_file[0]);
    }
    if (gpx_file instanceof FileList && gpx_file.length > 0) {
        formData.append('gpx_file', gpx_file[0]);
    }

    mutation.mutate(formData);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Добавить новый поход</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <FormLabel>Файл отчета (PDF)</FormLabel>
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
                        <FormLabel>GPX трек</FormLabel>
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
                        <FormLabel>Ссылка на фотоархив (необязательно)</FormLabel>
                        <FormControl><Input type="url" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Добавление...' : 'Добавить поход'}
            </Button>
        </form>
      </Form>
    </div>
  );
}