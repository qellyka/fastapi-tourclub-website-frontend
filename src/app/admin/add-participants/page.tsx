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
import { Hike, User } from '@/types';
import { useState } from 'react';

const addParticipantsSchema = z.object({
  hike_id: z.string().min(1, "Поход обязателен"),
  participant_ids: z.array(z.string()).min(1, "Выберите хотя бы одного участника"),
});

type AddParticipantsFormValues = z.infer<typeof addParticipantsSchema>;

async function fetchAllHikes(): Promise<any> {
  const { data } = await api.get('/archive/hikes');
  return data;
}

async function fetchAllParticipants(): Promise<any> {
  const { data } = await api.get('/club/participants');
  return data;
}

export default function AddParticipantsToHikePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: hikes, isLoading: isLoadingHikes } = useQuery<Hike[]>({
    queryKey: ['all-hikes'],
    queryFn: fetchAllHikes,
    select: (data) => data.detail,
  });

  const { data: participants, isLoading: isLoadingParticipants } = useQuery<User[]>({
    queryKey: ['all-club-participants'],
    queryFn: fetchAllParticipants,
    select: (data) => data.detail,
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<AddParticipantsFormValues>({
    resolver: zodResolver(addParticipantsSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: AddParticipantsFormValues) => api.post('/archive/participants', {
      hike_id: Number(data.hike_id),
      participant_ids: data.participant_ids.map(Number),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hikes'] });
      queryClient.invalidateQueries({ queryKey: ['hike-participants'] });
      alert('Участники успешно добавлены к походу!');
      router.push('/admin'); // Redirect to admin dashboard or relevant page
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || "Произошла ошибка при добавлении участников");
    },
  });

  const onSubmit = (data: AddParticipantsFormValues) => {
    setError(null);
    mutation.mutate(data);
  };

  if (isLoadingHikes || isLoadingParticipants) return <div>Загрузка данных...</div>;
  if (error) return <div>Ошибка при загрузке данных для добавления участников.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Добавить участников к походу</h1>
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
          <Label htmlFor="participant_ids">Участники</Label>
          {/* This would ideally be a multi-select component */}
          <Select onValueChange={(value) => setValue('participant_ids', [value])} multiple={true}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите участников" />
            </SelectTrigger>
            <SelectContent>
              {participants?.map((participant) => (
                <SelectItem key={participant.id} value={String(participant.id)}>{participant.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.participant_ids && <p className="text-sm text-red-500">{errors.participant_ids.message}</p>}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Добавление...' : 'Добавить участников'}
        </Button>
      </form>
    </div>
  );
}
