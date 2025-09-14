'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

const hikeSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  complexity: z.string().min(1, "Сложность обязательна"),
  region: z.string().min(1, "Регион обязателен"),
  start_date: z.string().min(1, "Дата начала обязательна"),
  end_date: z.string().min(1, "Дата конца обязательна"),
  description: z.string().min(1, "Описание обязательно"),
  route_gpx: z.instanceof(FileList).refine(files => files?.length == 1, "GPX файл обязателен."),
  report_pdf: z.instanceof(FileList).refine(files => files?.length == 1, "PDF отчет обязателен."),
});

type HikeFormValues = z.infer<typeof hikeSchema>;

export default function NewHikePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<HikeFormValues>({
    resolver: zodResolver(hikeSchema),
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => api.post('/archive/hikes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hikes'] });
      router.push('/admin/hikes');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || "Произошла ошибка");
    },
  });

  const onSubmit = (data: HikeFormValues) => {
    setError(null);
    const formData = new FormData();
    
    const jsonData = {
        name: data.name,
        complexity: data.complexity,
        region: data.region,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
        description: data.description,
    };

    formData.append('hike_data', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));
    formData.append('route_gpx', data.route_gpx[0]);
    formData.append('report_pdf', data.report_pdf[0]);
    
    mutation.mutate(formData);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Добавить новый поход</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Название</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="complexity">Сложность</Label>
            <Input id="complexity" {...register('complexity')} />
            {errors.complexity && <p className="text-sm text-red-500">{errors.complexity.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Регион</Label>
          <Input id="region" {...register('region')} />
          {errors.region && <p className="text-sm text-red-500">{errors.region.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="start_date">Дата начала</Label>
            <Input id="start_date" type="date" {...register('start_date')} />
            {errors.start_date && <p className="text-sm text-red-500">{errors.start_date.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">Дата окончания</Label>
            <Input id="end_date" type="date" {...register('end_date')} />
            {errors.end_date && <p className="text-sm text-red-500">{errors.end_date.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Описание</Label>
          <Textarea id="description" {...register('description')} />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="route_gpx">GPX файл маршрута</Label>
          <Input id="route_gpx" type="file" accept=".gpx" {...register('route_gpx')} />
          {errors.route_gpx && <p className="text-sm text-red-500">{errors.route_gpx.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="report_pdf">PDF отчет</Label>
          <Input id="report_pdf" type="file" accept=".pdf" {...register('report_pdf')} />
          {errors.report_pdf && <p className="text-sm text-red-500">{errors.report_pdf.message as string}</p>}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Добавление...' : 'Добавить поход'}
        </Button>
      </form>
    </div>
  );
}
