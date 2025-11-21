'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
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

export default function NewPassPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { control, register, handleSubmit, formState: { errors } } = useForm<PassFormValues>({
    resolver: zodResolver(passSchema),
    defaultValues: {
      photos: [],
    }
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/archive/passes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-passes'] });
      toast({
        title: 'Успех!',
        description: 'Перевал успешно добавлен.',
      });
      router.push('/admin/passes');
    },
    onError: (err: any) => {
      const errorDetail = err.response?.data?.detail;
      let errorMessage = "Произошла ошибка при добавлении перевала.";
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

  const onSubmit = (data: PassFormValues) => {
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
                />
            )}
            />
            {errors.photos && <p className="text-sm text-red-500">{errors.photos.message}</p>}
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Добавление...' : 'Добавить перевал'}
        </Button>
      </form>
    </div>
  );
}
