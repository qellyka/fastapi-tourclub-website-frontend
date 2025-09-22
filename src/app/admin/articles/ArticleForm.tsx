'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import dynamic from 'next/dynamic';
import { Article } from '@/types';
import { useState } from 'react';
import { MediaUploaderModal } from '@/components/MediaUploaderModal';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false });

// Schema for validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const articleSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  author: z.string().min(1, "Автор обязателен"),
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

type ArticleFormValues = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  initialData?: Article;
  onSubmit: (data: ArticleFormValues) => void;
  isPending: boolean;
  submitButtonText?: string;
}

export default function ArticleForm({ initialData, onSubmit, isPending, submitButtonText = 'Сохранить' }: ArticleFormProps) {
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: initialData?.title || '',
      author: initialData?.author || '',
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
                name="author"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Автор</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
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
                                bucketName="tkirbis-article-media"
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