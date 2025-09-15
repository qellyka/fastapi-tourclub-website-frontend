'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialArticleSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  author: z.string().min(1, "Автор обязателен"),
  cover: z.any()
    .refine((files) => files?.length === 1, "Обложка обязательна.")
    .refine((files) => files?.[0]?.size <= 5 * 1024 * 1024, `Максимальный размер файла 5MB.`)
    .refine(
      (files) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(files?.[0]?.type),
      "Поддерживаются только .jpg, .jpeg, .png и .webp форматы."
    ),
});

type InitialArticleFormValues = z.infer<typeof initialArticleSchema>;

interface InitialArticleFormProps {
  onSubmit: (data: FormData) => void;
  isPending: boolean;
}

export default function InitialArticleForm({ onSubmit, isPending }: InitialArticleFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<InitialArticleFormValues>({
    resolver: zodResolver(initialArticleSchema),
  });

  const handleFormSubmit = (data: InitialArticleFormValues) => {
    const formData = new FormData();
    const articleData = {
      title: data.title,
      author: data.author,
    };
    formData.append('article', JSON.stringify(articleData));
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
        <Label htmlFor="author">Автор</Label>
        <Input id="author" {...register('author')} />
        {errors.author && <p className="text-sm text-red-500">{errors.author.message}</p>}
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
