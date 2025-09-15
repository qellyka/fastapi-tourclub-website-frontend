'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { useState } from 'react';

const participantSchema = z.object({
  description: z.string().min(1, "Описание обязательно"),
  avatar: z.instanceof(FileList).refine(files => files?.length === 1, "Аватар обязателен."),
});

type ParticipantFormValues = z.infer<typeof participantSchema>;

async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get('/users');
  // Assuming the API returns { detail: [...] }
  return data.detail;
}

export default function NewParticipantPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users, isLoading: isLoadingUsers, isError: isErrorUsers } = useQuery<User[]>({
    queryKey: ['all-users'],
    queryFn: fetchUsers,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantSchema),
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => api.post('/club/participants', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-club-participants'] });
      toast({
        title: 'Успех!',
        description: 'Участник клуба успешно создан.',
      });
      router.push('/admin/participants');
    },
    onError: (err: any) => {
      const errorDetail = err.response?.data?.detail;
      let errorMessage = "Произошла ошибка при создании участника.";
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

  const handleUserSelect = (userId: string) => {
    const user = users?.find(u => String(u.id) === userId);
    setSelectedUser(user || null);
  };

  const onSubmit = (data: ParticipantFormValues) => {
    if (!selectedUser) {
      toast({ title: 'Ошибка', description: 'Пожалуйста, выберите пользователя.', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    const participantData = {
      user_id: selectedUser.id,
      description: data.description,
    };

    formData.append('participant', JSON.stringify(participantData));
    formData.append('avatar', data.avatar[0]);
    
    mutation.mutate(formData);
  };

  if (isLoadingUsers) return <div className="container mx-auto px-4 py-24 text-center">Загрузка пользователей...</div>;
  if (isErrorUsers) return <div className="container mx-auto px-4 py-24 text-center">Не удалось загрузить пользователей.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Создать нового участника клуба</h1>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>1. Выберите существующий аккаунт</Label>
          <Select onValueChange={handleUserSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите пользователя из списка" />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={String(user.id)}>
                  {user.full_name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedUser && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 border-t pt-6 fade-in">
            <h2 className="text-xl font-semibold">2. Добавьте данные участника</h2>
            <p>Вы создаете участника для пользователя: <strong>{selectedUser.full_name}</strong></p>
            
            <div className="space-y-2">
              <Label htmlFor="description">Описание участника</Label>
              <Textarea id="description" {...register('description')} />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Аватар участника</Label>
              <Input id="avatar" type="file" accept="image/*" {...register('avatar')} />
              {errors.avatar && <p className="text-sm text-red-500">{errors.avatar.message as string}</p>}
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Создание...' : 'Создать участника'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
