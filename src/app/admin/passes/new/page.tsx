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

const passSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  region: z.string().min(1, "Регион обязателен"),
  complexity: z.string().min(1, "Сложность обязательна"),
  height: z.preprocess((val) => Number(val), z.number().min(1, "Высота обязательна и должна быть числом")),
  description: z.string().min(1, "Описание обязательно"),
});

type PassFormValues = z.infer<typeof passSchema>;

export default function NewPassPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<PassFormValues>({
    resolver: zodResolver(passSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: PassFormValues) => api.post('/archive/passes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-passes'] });
      router.push('/admin/passes');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || "Произошла ошибка");
    },
  });

  const onSubmit = (data: PassFormValues) => {
    setError(null);
    mutation.mutate(data);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Добавить новый перевал</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="space-y-2">
          <Label htmlFor="description">Описание</Label>
          <Textarea id="description" {...register('description')} />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Добавление...' : 'Добавить перевал'}
        </Button>
      </form>
    </div>
  );
}
