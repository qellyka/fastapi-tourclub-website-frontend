'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createFaq } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import FaqForm, { FaqFormValues } from '../FaqForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewFaqPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: FaqFormValues) => createFaq(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      toast({ title: 'Успех!', description: 'FAQ успешно добавлен.' });
      router.push('/admin/faqs');
    },
    onError: (err: any) => {
      const errorDetail = err.response?.data?.detail;
      let errorMessage = "Произошла ошибка при добавлении FAQ.";
      if (typeof errorDetail === 'string') errorMessage = errorDetail;
      else if (errorDetail) errorMessage = JSON.stringify(errorDetail);
      toast({ title: 'Ошибка!', description: errorMessage, variant: 'destructive' });
    },
  });

  const onSubmit = (data: FaqFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить новый FAQ</CardTitle>
      </CardHeader>
      <CardContent>
        <FaqForm onSubmit={onSubmit} isPending={mutation.isPending} submitButtonText="Добавить FAQ" />
      </CardContent>
    </Card>
  );
}
