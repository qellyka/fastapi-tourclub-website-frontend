'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { FAQItem, FAQCreateUpdate } from '@/types';
import { useEffect } from 'react';

const faqSchema = z.object({
  question_ru: z.string().min(1, "Вопрос на русском обязателен"),
  answer_ru: z.string().min(1, "Ответ на русском обязателен"),
  question_en: z.string().optional(),
  answer_en: z.string().optional(),
  order: z.coerce.number().int().min(0, "Порядок должен быть неотрицательным числом").optional(),
  is_active: z.boolean().default(true),
});

export type FaqFormValues = z.infer<typeof faqSchema>;

interface FaqFormProps {
  initialData?: FAQItem;
  onSubmit: (data: FaqFormValues) => void;
  isPending: boolean;
  submitButtonText?: string;
}

export default function FaqForm({
  initialData,
  onSubmit,
  isPending,
  submitButtonText = 'Сохранить',
}: FaqFormProps) {
  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question_ru: initialData?.question_ru || '',
      answer_ru: initialData?.answer_ru || '',
      question_en: initialData?.question_en || '',
      answer_en: initialData?.answer_en || '',
      order: initialData?.order ?? 0,
      is_active: initialData?.is_active ?? true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        question_ru: initialData.question_ru || '',
        answer_ru: initialData.answer_ru || '',
        question_en: initialData.question_en || '',
        answer_en: initialData.answer_en || '',
        order: initialData.order ?? 0,
        is_active: initialData.is_active ?? true,
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="question_ru"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Вопрос (RU)</FormLabel>
              <FormControl>
                <Textarea placeholder="Введите вопрос на русском" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="answer_ru"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ответ (RU)</FormLabel>
              <FormControl>
                <Textarea placeholder="Введите ответ на русском" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="question_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Вопрос (EN, необязательно)</FormLabel>
              <FormControl>
                <Textarea placeholder="Введите вопрос на английском" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="answer_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ответ (EN, необязательно)</FormLabel>
              <FormControl>
                <Textarea placeholder="Введите ответ на английском" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Порядок отображения</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Активен
                </FormLabel>
                <FormDescription>
                  Отображать этот вопрос в публичной части сайта.
                </FormDescription>
              </div>
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
