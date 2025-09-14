'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Article } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

async function fetchArticles(): Promise<any> {
  const { data } = await api.get('/articles');
  return data;
}

export default function AdminArticlesPage() {
  const queryClient = useQueryClient();
  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ['admin-articles'],
    queryFn: fetchArticles,
    select: (data) => data.detail, // Assuming the same response structure
  });

  const deleteMutation = useMutation({
    mutationFn: (articleId: number) => api.delete(`/articles/${articleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
  });

  if (isLoading) return <div>Загрузка статей...</div>;
  if (error) return <div>Ошибка при загрузке: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление статьями</h1>
        <Button asChild>
          <Link href="/admin/articles/new">Создать статью</Link>
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Заголовок</TableHead>
              <TableHead>Автор</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles?.map((article) => (
              <TableRow key={article.id} className="hover:bg-gray-50 transition-colors duration-150">
                <TableCell>{article.id}</TableCell>
                <TableCell>{article.title}</TableCell>
                <TableCell>{article.author}</TableCell>
                <TableCell>{article.slug}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <DotsHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/articles/edit/${article.id}`}>Редактировать</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => {
                          if (confirm('Вы уверены, что хотите удалить эту статью?')) {
                            deleteMutation.mutate(article.id);
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
