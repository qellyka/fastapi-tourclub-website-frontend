'use client';

import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { Hike, User } from '@/types';
import { Trash2, PlusCircle } from 'lucide-react';
import { UserSearchCombobox } from '@/components/UserSearchCombobox';

import { withAdminAuth } from '@/components/admin/withAdminAuth';

const participantSchema = z.object({
  participant_id: z.string().min(1, "Выберите участника"),
  role: z.string().min(1, "Укажите роль"),
});

const addParticipantsSchema = z.object({
  hike_id: z.string().min(1, "Поход обязателен"),
  participants: z.array(participantSchema).min(1, "Добавьте хотя бы одного участника"),
});

type AddParticipantsFormValues = z.infer<typeof addParticipantsSchema>;

async function fetchAllHikes(): Promise<any> {
  const { data } = await api.get('/archive/hikes');
  return data;
}

async function fetchAllUsers(): Promise<any> {
  const { data } = await api.get('/users');
  return data;
}

function AddParticipantsToHikePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: hikes, isLoading: isLoadingHikes } = useQuery<Hike[]>({
    queryKey: ['all-hikes'],
    queryFn: fetchAllHikes,
    select: (data) => data.detail,
  });

  const { data: allParticipants, isLoading: isLoadingParticipants } = useQuery<User[]>({
    queryKey: ['all-users'],
    queryFn: fetchAllUsers,
    select: (data) => data.detail,
  });

  const { control, register, handleSubmit, formState: { errors } } = useForm<AddParticipantsFormValues>({
    resolver: zodResolver(addParticipantsSchema),
    defaultValues: {
      hike_id: '',
      participants: [{ participant_id: '', role: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "participants",
  });

  const mutation = useMutation({
    mutationFn: (data: AddParticipantsFormValues) => {
      const payload = data.participants.map(p => {
        const participantId = parseInt(p.participant_id, 10);
        const hikeId = parseInt(data.hike_id, 10);
        return {
          user_id: isNaN(participantId) ? 0 : participantId,
          hike_id: isNaN(hikeId) ? 0 : hikeId,
          role: p.role
        };
      });
      return api.post('/archive/participants', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hikes'] });
      queryClient.invalidateQueries({ queryKey: ['hike-participants'] });
      toast({
        title: 'Успех!',
        description: 'Участники успешно добавлены к походу!',
      });
      router.push('/admin/hikes');
    },
    onError: (err: any) => {
      let description = "Произошла ошибка при добавлении участников";
      const errorDetail = err.response?.data?.detail;

      if (typeof errorDetail === 'string') {
        description = errorDetail;
      } else if (Array.isArray(errorDetail)) {
        description = errorDetail.map(e => `${e.loc.join(' -> ')}: ${e.msg}`).join('\n');
      }

      toast({
        title: 'Ошибка!',
        description: description,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: AddParticipantsFormValues) => {
    mutation.mutate(data);
  };

  if (isLoadingHikes || isLoadingParticipants) return <div>Загрузка данных...</div>;
  if (!hikes || !allParticipants) return <div>Ошибка при загрузке данных.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Добавить участников к походу</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="hike_id">Поход</Label>
          <Controller
            name="hike_id"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите поход" />
                </SelectTrigger>
                <SelectContent>
                  {hikes.map((hike) => (
                    <SelectItem key={hike.id} value={String(hike.id)}>{hike.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.hike_id && <p className="text-sm text-red-500">{errors.hike_id.message}</p>}
        </div>

        <div className="space-y-4">
            <Label>Участники</Label>
            {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4 p-4 border rounded-lg bg-card">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor={`participants.${index}.participant_id`}>Участник</Label>
                        <Controller
                            name={`participants.${index}.participant_id`}
                            control={control}
                            render={({ field }) => (
                                <UserSearchCombobox 
                                    users={allParticipants}
                                    value={field.value}
                                    onSelect={field.onChange}
                                />
                            )}
                        />
                         {errors.participants?.[index]?.participant_id && <p className="text-sm text-red-500">{errors.participants?.[index]?.participant_id?.message}</p>}
                    </div>
                    <div className="flex-1 space-y-2">
                        <Label htmlFor={`participants.${index}.role`}>Роль</Label>
                        <Input
                            {...register(`participants.${index}.role`)}
                            placeholder="Например, Руководитель"
                        />
                        {errors.participants?.[index]?.role && <p className="text-sm text-red-500">{errors.participants?.[index]?.role?.message}</p>}
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="self-end mb-1 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
            ))}
             {errors.participants && <p className="text-sm text-red-500">{errors.participants.message}</p>}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ participant_id: '', role: '' })}
          className="w-full flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Добавить участника
        </Button>

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? 'Добавление...' : 'Сохранить участников'}
        </Button>
      </form>
    </div>
  );
}

export default withAdminAuth(AddParticipantsToHikePage);
