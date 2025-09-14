'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { News } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

async function fetchNews(): Promise<any> {
  const { data } = await api.get('/news');
  return data;
}

export default function AdminNewsPage() {
  const queryClient = useQueryClient();
  const { data: news, isLoading, error } = useQuery<News[]>({
    queryKey: ['admin-news'],
    queryFn: fetchNews,
    select: (data) => data.detail, // Assuming the same response structure
  });

  const deleteMutation = useMutation({
    mutationFn: (newsId: number) => api.delete(`/news/${newsId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
    },
  });

  if (isLoading) return <div>Загрузка новостей...</div>;
  if (error) return <div>Ошибка при загрузке: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление новостями</h1>
        <Button asChild>
          <Link href="/admin/news/new">Создать новость</Link>
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Заголовок</TableHead>
              <TableHead>Сводка</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news?.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.summary}</TableCell>
                <TableCell>{item.slug}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <DotsHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/news/edit/${item.id}`}>Редактировать</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => {
                          if (confirm('Вы уверены, что хотите удалить эту новость?')) {
                            deleteMutation.mutate(item.id);
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
      </div>
    </div>
  );
}
