'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import dynamic from 'next/dynamic';
const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false });
import { News } from '@/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const newsSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  summary: z.string().min(1, "Сводка обязательна"), // Removed author
  content_html: z.string().min(1, "Содержимое обязательно"),
  content_json: z.any(), // Added content_json
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

type NewsFormValues = z.infer<typeof newsSchema>;

interface NewsFormProps {
  initialData?: News;
  onSubmit: (data: NewsFormValues) => void; // Changed to send JSON object
  isPending: boolean;
  submitButtonText?: string;
}

export default function NewsForm({ initialData, onSubmit, isPending, submitButtonText = 'Сохранить' }: NewsFormProps) {
  console.log('NewsForm rendered'); // Added log
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: initialData?.title || '',
      summary: initialData?.summary || '',
      content_html: initialData?.content_html || '',
      content_json: initialData?.content_json || '', // Changed to empty string
    },
  });
  console.log('Form errors:', errors); // Added log

  const handleFormSubmit = (data: NewsFormValues) => {
    console.log('handleFormSubmit called', data); // Added log
    const updateData = {
      title: data.title,
      summary: data.summary, // Removed author
      content_html: data.content_html,
      content_json: data.content_json,
    };
    console.log('Calling onSubmit prop', updateData); // Added log
    onSubmit(updateData); // Submit JSON object
  };

  return (
    <form onSubmit={(e) => { console.log('Form onSubmit event fired'); handleSubmit(handleFormSubmit)(e); }} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Заголовок</Label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Сводка</Label>
        <Textarea id="summary" {...register('summary')} />
        {errors.summary && <p className="text-sm text-red-500">{errors.summary.message}</p>}
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
          render={({ field }) => (
              <TiptapEditor value={field.value} onChange={(content) => { field.onChange(content.html); setValue('content_json', content.json); }} />
          )}
        />
        {errors.content_html && <p className="text-sm text-red-500">{errors.content_html.message}</p>}
      </div>

      <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50">
        {isPending ? 'Сохранение...' : submitButtonText}
      </button>
    </form>
  );
}
