'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getFaqById, updateFaq } from '@/lib/api';
import FaqForm, { FaqFormValues } from '../../FaqForm';
import { FAQItem } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditFaqPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const faqId = Number(params.id);

  const { data: faq, isLoading } = useQuery<FAQItem>({
    queryKey: ['admin-faq', faqId],
    queryFn: async () => (await getFaqById(faqId)).detail,
    enabled: !!faqId,
  });

  const mutation = useMutation({
    mutationFn: (data: FaqFormValues) => updateFaq(faqId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-faq', faqId] });
      toast({ title: 'Успех!', description: 'FAQ успешно обновлен.' });
      router.push('/admin/faqs');
    },
    onError: (err: any) => {
      const errorDetail = err.response?.data?.detail;
      let errorMessage = "Произошла ошибка при обновлении FAQ.";
      if (typeof errorDetail === 'string') errorMessage = errorDetail;
      else if (errorDetail) errorMessage = JSON.stringify(errorDetail);
      toast({ title: 'Ошибка!', description: errorMessage, variant: 'destructive' });
    },
  });

  const onSubmit = (data: FaqFormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) return <div>Загрузка данных FAQ...</div>;
  if (!faq) return <div>FAQ не найден.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Редактировать FAQ</CardTitle>
      </CardHeader>
      <CardContent>
        <FaqForm initialData={faq} onSubmit={onSubmit} isPending={mutation.isPending} submitButtonText="Обновить FAQ" />
      </CardContent>
    </Card>
  );
}
