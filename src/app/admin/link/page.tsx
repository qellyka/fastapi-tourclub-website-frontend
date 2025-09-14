'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hike, Pass } from '@/types';
import { useState } from 'react';

const linkSchema = z.object({
  hike_id: z.string().min(1, "Поход обязателен"),
  pass_id: z.string().min(1, "Перевал обязателен"),
});

type LinkFormValues = z.infer<typeof linkSchema>;

async function fetchAllHikes(): Promise<any> {
  const { data } = await api.get('/archive/hikes');
  return data;
}

async function fetchAllPasses(): Promise<any> {
  const { data } = await api.get('/archive/passes');
  return data;
}

export default function LinkHikePassPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: hikes, isLoading: isLoadingHikes } = useQuery<Hike[]>({
    queryKey: ['all-hikes'],
    queryFn: fetchAllHikes,
    select: (data) => data.detail,
  });

  const { data: passes, isLoading: isLoadingPasses } = useQuery<Pass[]>({
    queryKey: ['all-passes'],
    queryFn: fetchAllPasses,
    select: (data) => data.detail,
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: LinkFormValues) => api.post(`/archive/link?hike_id=${data.hike_id}&pass_id=${data.pass_id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hikes'] });
      queryClient.invalidateQueries({ queryKey: ['passes'] });
      alert('Поход успешно связан с перевалом!');
      router.push('/admin'); // Redirect to admin dashboard or relevant page
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || "Произошла ошибка при связывании");
    },
  });

  const onSubmit = (data: LinkFormValues) => {
    setError(null);
    mutation.mutate(data);
  };

  if (isLoadingHikes || isLoadingPasses) return <div>Загрузка данных...</div>;
  if (error) return <div>Ошибка при загрузке данных для связывания.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Связать поход с перевалом</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="hike_id">Поход</Label>
          <Select onValueChange={(value) => setValue('hike_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите поход" />
            </SelectTrigger>
            <SelectContent>
              {hikes?.map((hike) => (
                <SelectItem key={hike.id} value={String(hike.id)}>{hike.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.hike_id && <p className="text-sm text-red-500">{errors.hike_id.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pass_id">Перевал</Label>
          <Select onValueChange={(value) => setValue('pass_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите перевал" />
            </SelectTrigger>
            <SelectContent>
              {passes?.map((pass) => (
                <SelectItem key={pass.id} value={String(pass.id)}>{pass.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.pass_id && <p className="text-sm text-red-500">{errors.pass_id.message}</p>}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Связывание...' : 'Связать'}
        </Button>
      </form>
    </div>
  );
}
