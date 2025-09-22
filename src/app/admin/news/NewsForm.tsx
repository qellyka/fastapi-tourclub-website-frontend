'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import dynamic from 'next/dynamic';
import { News } from '@/types';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false });

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const newsSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  summary: z.string().min(1, "Сводка обязательна"),
  content_html: z.string().min(1, "Содержимое обязательно"),
  content_json: z.any(),
  cover: z.any()
    .refine((files) => files?.length <= 1, "Не более одного файла.")
    .refine((files) => files?.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `Максимальный размер файла 5MB.`)
    .refine(
      (files) => files?.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Поддерживаются только .jpg, .jpeg, .png и .webp форматы."
    )
    .optional(),
});

type NewsFormValues = z.infer<typeof newsSchema>;

interface NewsFormProps {
  initialData?: News;
  onSubmit: (data: NewsFormValues) => void;
  isPending: boolean;
  submitButtonText?: string;
}

export default function NewsForm({ initialData, onSubmit, isPending, submitButtonText = 'Сохранить' }: NewsFormProps) {
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: initialData?.title || '',
      summary: initialData?.summary || '',
      content_html: initialData?.content_html || '',
      content_json: initialData?.content_json || undefined,
    },
  });

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Заголовок</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Сводка</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {!initialData && (
                <FormField
                    control={form.control}
                    name="cover"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Обложка</FormLabel>
                            <FormControl><Input type="file" onChange={e => field.onChange(e.target.files)} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            <FormField
                control={form.control}
                name="content_html"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Содержимое</FormLabel>
                        <FormControl>
                            <TiptapEditor 
                                value={field.value} 
                                onChange={(content) => { 
                                    field.onChange(content.html); 
                                    form.setValue('content_json', content.json); 
                                }}
                                bucketName="tkirbis-news-media"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Button type="submit" disabled={isPending}>
                {isPending ? 'Сохранение...' : submitButtonText}
            </Button>
        </form>
    </Form>
  );
}