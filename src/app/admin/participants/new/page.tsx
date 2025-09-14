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
import { useState } from 'react';

const participantSchema = z.object({
  first_name: z.string().min(1, "Имя обязательно"),
  last_name: z.string().min(1, "Фамилия обязательна"),
  middle_name: z.string().optional(),
  email: z.string().email("Некорректный email"),
  phone: z.string().optional(),
  avatar: z.instanceof(FileList).refine(files => files?.length == 1, "Аватар обязателен."),
});

type ParticipantFormValues = z.infer<typeof participantSchema>;

export default function NewParticipantPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantSchema),
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => api.post('/club/participants', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-club-participants'] });
      router.push('/admin/participants');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || "Произошла ошибка");
    },
  });

  const onSubmit = (data: ParticipantFormValues) => {
    setError(null);
    const formData = new FormData();
    
    // Append JSON data as a Blob
    const jsonData = {
        first_name: data.first_name,
        last_name: data.last_name,
        middle_name: data.middle_name,
        email: data.email,
        phone: data.phone,
    };
    formData.append('participant_data', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));
    formData.append('avatar', data.avatar[0]);
    
    mutation.mutate(formData);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Добавить нового участника</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="last_name">Фамилия</Label>
            <Input id="last_name" {...register('last_name')} />
            {errors.last_name && <p className="text-sm text-red-500">{errors.last_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="first_name">Имя</Label>
            <Input id="first_name" {...register('first_name')} />
            {errors.first_name && <p className="text-sm text-red-500">{errors.first_name.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="middle_name">Отчество (необязательно)</Label>
          <Input id="middle_name" {...register('middle_name')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Телефон (необязательно)</Label>
          <Input id="phone" {...register('phone')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar">Аватар</Label>
          <Input id="avatar" type="file" accept="image/*" {...register('avatar')} />
          {errors.avatar && <p className="text-sm text-red-500">{errors.avatar.message as string}</p>}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Добавление...' : 'Добавить участника'}
        </Button>
      </form>
    </div>
  );
}
