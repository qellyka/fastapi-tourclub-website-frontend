'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getHikeById, updateHike } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';

const hikeFormSchema = z.object({
  name: z.string().min(1, "Название не может быть пустым"),
  complexity: z.string().min(1, "Сложность не может быть пустой"),
  route: z.string().min(1, "Маршрут не может быть пустым"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Неверный формат даты (YYYY-MM-DD)"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Неверный формат даты (YYYY-MM-DD)"),
  region: z.string().min(1, "Регион не может быть пустым"),
  description: z.string().min(1, "Описание не может быть пустым"),
  photos_archive: z.string().url("Неверный формат ссылки").optional().or(z.literal("")),
  gpx_file: z.any().optional(),
  report_file: z.any().optional(),
});

type HikeFormValues = z.infer<typeof hikeFormSchema>;

export default function EditHikePage() {
  const router = useRouter();
  const params = useParams();
  const hikeId = params.id as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: hikeData, isLoading: isHikeLoading, isError: isHikeError } = useQuery({
    queryKey: ['hikes', hikeId],
    queryFn: () => getHikeById(parseInt(hikeId)),
    enabled: !!hikeId,
  });

  const form = useForm<HikeFormValues>({
    resolver: zodResolver(hikeFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      complexity: "",
      route: "",
      start_date: "",
      end_date: "",
      region: "",
      description: "",
      photos_archive: "",
    },
  });

  useEffect(() => {
    if (hikeData?.detail) {
      const { name, complexity, route, start_date, end_date, region, description, photos_archive } = hikeData.detail;
      form.reset({
        name,
        complexity,
        route,
        start_date,
        end_date,
        region,
        description,
        photos_archive: photos_archive || "",
      });
    }
  }, [hikeData, form]);

  const updateHikeMutation = useMutation({
    mutationFn: ({ id, data, gpxFile, reportFile }: { id: number, data: HikeFormValues, gpxFile?: File, reportFile?: File }) => updateHike(id, data, gpxFile, reportFile),
    onSuccess: () => {
      toast({
        title: "Поход обновлен",
        description: "Данные похода успешно обновлены.",
      });
      queryClient.invalidateQueries({ queryKey: ['hikes'] });
      router.push('/admin/hikes');
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось обновить поход: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: HikeFormValues) => {
    const gpxFile = values.gpx_file?.[0];
    const reportFile = values.report_file?.[0];

    const updatePayload: HikeFormValues = { ...values };
    delete updatePayload.gpx_file; // Remove file objects from JSON payload
    delete updatePayload.report_file;

    updateHikeMutation.mutate({ id: parseInt(hikeId), data: updatePayload, gpxFile, reportFile });
  };

  if (isHikeLoading) {
    return <div className="container mx-auto px-4 py-24 text-center">Загрузка похода...</div>;
  }

  if (isHikeError || !hikeData?.detail) {
    return <div className="container mx-auto px-4 py-24 text-center text-red-500">Ошибка загрузки похода или поход не найден.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Редактировать поход: {hikeData.detail.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="complexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сложность</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="route"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Маршрут</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дата начала</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gpx_file"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>GPX файл</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept=".gpx"
                        onChange={(event) => onChange(event.target.files)}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept=".pdf"
                        onChange={(event) => onChange(event.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={updateHikeMutation.isPending}>
                  {updateHikeMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/admin/hikes')}>
                  Отмена
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
