'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminFaqs, deleteFaq } from '@/lib/api';
import { FAQItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { withAdminAuth } from '@/components/admin/withAdminAuth';

const TableSkeleton = () => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
        </div>
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Skeleton className="h-6 w-12" /></TableHead>
                        <TableHead><Skeleton className="h-6 w-full" /></TableHead>
                        <TableHead><Skeleton className="h-6 w-24" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    </div>
)

function AdminFaqsPage() {
  const queryClient = useQueryClient();
  const { data: faqs, isLoading, error } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: () => getAdminFaqs().then(res => res.detail),
  });

  const deleteMutation = useMutation({
    mutationFn: (faqId: number) => deleteFaq(faqId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
    },
  });

  if (isLoading) return <TableSkeleton />;
  if (error) return <div className="text-destructive text-center py-16">Ошибка при загрузке: {error.message}</div>;

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Управление FAQ</h1>
            <Button asChild><Link href="/admin/faqs/new">Добавить FAQ</Link></Button>
        </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Вопрос (RU)</TableHead>
              <TableHead>Активен</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs?.map((faq) => (
              <TableRow key={faq.id} className="hover:bg-secondary">
                <TableCell>{faq.id}</TableCell>
                <TableCell className="font-medium">{faq.question_ru}</TableCell>
                <TableCell>{faq.is_active ? 'Да' : 'Нет'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Открыть меню</span>
                        <DotsHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/faqs/${faq.id}/edit`}>Редактировать</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          if (confirm('Вы уверены, что хотите удалить этот FAQ?')) {
                            deleteMutation.mutate(faq.id);
                          }
                        }}
                      >
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default withAdminAuth(AdminFaqsPage);
