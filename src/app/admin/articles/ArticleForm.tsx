'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from 'next/dynamic';
import { Article } from '@/types';
import ErrorBoundary from '@/components/ErrorBoundary';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false });

// Schema for validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const articleSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  author: z.string().min(1, "Автор обязателен"),
  content_html: z.string().min(1, "Содержимое обязательно"),
  content_json: z.any(), // Added content_json to schema
  // Cover is optional
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
  onSubmit: (data: ArticleFormValues) => void; // Changed to send JSON object
  isPending: boolean;
  submitButtonText?: string;
}

export default function ArticleForm({ initialData, onSubmit, isPending, submitButtonText = 'Сохранить' }: ArticleFormProps) {
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: initialData?.title || '',
      author: initialData?.author || '',
      content_html: initialData?.content_html || '',
      content_json: initialData?.content_json || '', // Changed to empty string
    },
  });

  const handleFormSubmit = (data: ArticleFormValues) => {
    // Per user request, PATCH sends JSON.
    const updateData = {
      title: data.title,
      author: data.author,
      content_html: data.content_html,
      content_json: data.content_json, // Do not stringify content_json
    };
    onSubmit(updateData); // Submit a JSON object (reverted from wrapping in 'article' key)
  };

  return (
    <form onSubmit={(e) => { handleSubmit(handleFormSubmit)(e); }} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Заголовок</Label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">Автор</Label>
        <Input id="author" {...register('author')} />
        {errors.author && <p className="text-sm text-red-500">{errors.author.message}</p>}
      </div>

      {/* Cover input is removed from the edit form if initialData is present */}
      {!initialData && (
        <div className="space-y-2">
          <Label htmlFor="cover">Обложка (оставьте пустым, чтобы не менять)</Label>
          <Input id="cover" type="file" {...register('cover')} />
          {errors.cover && typeof errors.cover.message === 'string' && <p className="text-sm text-red-500">{errors.cover.message}</p>}
        </div>
      )}

      <div className="space-y-2">
        <Label>Содержимое</Label>
        <Controller
          name="content_html"
          control={control}
          render={({ field }) => {
            console.log('Control object in render prop:', control); // Added log
            return (
              <TiptapEditor value={field.value} onChange={(content) => { field.onChange(content.html); setValue('content_json', content.json); }} /> // Use setValue directly
            );
          }}
        />
        {errors.content_html && <p className="text-sm text-red-500">{errors.content_html.message}</p>}
      </div>

      <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50">
        {isPending ? 'Сохранение...' : submitButtonText}
      </button>
    </form>
  );
}
