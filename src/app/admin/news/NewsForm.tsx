'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TiptapEditor from '@/components/TiptapEditor';
import { News } from '@/types';

const newsSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  summary: z.string().min(1, "Сводка обязательна"),
  content_html: z.string().min(1, "Содержимое обязательно"),
  cover: z.any(), // Optional for edit
});

type NewsFormValues = z.infer<typeof newsSchema>;

interface NewsFormProps {
  initialData?: News;
  onSubmit: (data: FormData) => void;
  isPending: boolean;
  submitButtonText?: string;
}

export default function NewsForm({ initialData, onSubmit, isPending, submitButtonText = 'Сохранить' }: NewsFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: initialData?.title || '',
      summary: initialData?.summary || '',
      content_html: initialData?.content_html || '',
    },
  });

  const handleFormSubmit = (data: NewsFormValues) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('summary', data.summary);
    formData.append('content_html', data.content_html);
    if (data.cover && data.cover.length > 0) {
      formData.append('cover', data.cover[0]);
    }
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
        <Label htmlFor="cover">Обложка (оставьте пустым, чтобы не менять)</Label>
        <Input id="cover" type="file" {...register('cover')} />
        {errors.cover && <p className="text-sm text-red-500">{errors.cover.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label>Содержимое</Label>
        <Controller
          name="content_html"
          control={control}
          render={({ field }) => <TiptapEditor value={field.value} onChange={field.onChange} />}
        />
        {errors.content_html && <p className="text-sm text-red-500">{errors.content_html.message}</p>}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Сохранение...' : submitButtonText}
      </Button>
    </form>
  );
}
