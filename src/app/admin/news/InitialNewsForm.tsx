'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const initialNewsSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  summary: z.string().min(1, "Сводка обязательна"), // Removed author
  cover: z.any()
    .refine((files) => files?.length === 1, "Обложка обязательна.")
    .refine((files) => files?.[0]?.size <= 5 * 1024 * 1024, `Максимальный размер файла 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Поддерживаются только .jpg, .jpeg, .png и .webp форматы."
    ),
});

type InitialNewsFormValues = z.infer<typeof initialNewsSchema>;

interface InitialNewsFormProps {
  onSubmit: (data: FormData) => void;
  isPending: boolean;
}

export default function InitialNewsForm({ onSubmit, isPending }: InitialNewsFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<InitialNewsFormValues>({
    resolver: zodResolver(initialNewsSchema),
  });

  const handleFormSubmit = (data: InitialNewsFormValues) => {
    const formData = new FormData();
    const newsData = {
      title: data.title,
      summary: data.summary, // Removed author
    };
    formData.append('news', JSON.stringify(newsData)); // Changed 'article' to 'news'
    formData.append('cover_file', data.cover[0]);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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

      <div className="space-y-2">
        <Label htmlFor="cover">Обложка</Label>
        <Input id="cover" type="file" {...register('cover')} />
        {errors.cover && typeof errors.cover.message === 'string' && <p className="text-sm text-red-500">{errors.cover.message}</p>}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Создание...' : 'Создать и перейти к редактированию'}
      </Button>
    </form>
  );
}
