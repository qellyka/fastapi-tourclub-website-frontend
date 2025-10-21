'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllArticles } from '@/lib/api';
import { Article, ContentStatus, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

const TableSkeleton = () => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
        </div>
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Skeleton className="h-6 w-12" /></TableHead>
                        <TableHead><Skeleton className="h-6 w-64" /></TableHead>
                        <TableHead><Skeleton className="h-6 w-32" /></TableHead>
                        <TableHead><Skeleton className="h-6 w-48" /></TableHead>
                        <TableHead><Skeleton className="h-6 w-24" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    </div>
)

export default function AdminArticlesPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ContentStatus>('published');
  const { user } = useAuth();

  const { data: articles, isLoading, error } = useQuery<Article[]> ({
    queryKey: ['admin-articles', status],
    queryFn: async () => (await getAllArticles(status)).detail,
  });

  const deleteMutation = useMutation({
    mutationFn: (articleId: number) => api.delete(`/articles/${articleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as ContentStatus);
  };

  const userRole = user?.roles.includes('admin') ? 'admin' : user?.roles.includes('moderator') ? 'moderator' : 'user';

  const getActionText = (articleStatus: ContentStatus) => {
    if (userRole === 'admin') {
      return 'Редактировать';
    }
    if (userRole === 'moderator') {
      return articleStatus === 'draft' ? 'Редактировать' : 'Просмотр';
    }
    return 'Просмотр';
  };

  const renderTable = () => (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Заголовок</TableHead>
            <TableHead>Автор</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles?.map((article) => (
            <TableRow key={article.id} className="hover:bg-secondary">
              <TableCell>{article.id}</TableCell>
              <TableCell className="font-medium">{article.title}</TableCell>
              <TableCell>{article.author}</TableCell>
              <TableCell><Badge variant={article.status === 'published' ? 'default' : 'secondary'}>{article.status}</Badge></TableCell>
              <TableCell className="text-muted-foreground">{article.slug}</TableCell>
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
                      <Link href={`/admin/articles/edit/${article.id}`}>{getActionText(article.status)}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
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
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold">Управление статьями</h1>
            <p className="text-muted-foreground">Просмотр, создание, редактирование и удаление статей.</p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">Создать статью</Link>
        </Button>
      </div>

      <Tabs value={status} onValueChange={handleStatusChange} className="w-full">
        <TabsList>
          <TabsTrigger value="published">Опубликованные</TabsTrigger>
          <TabsTrigger value="review">На проверке</TabsTrigger>
          <TabsTrigger value="draft">Черновики</TabsTrigger>
          <TabsTrigger value="archived">Архив</TabsTrigger>
        </TabsList>
        <TabsContent value="published">
          {isLoading ? <TableSkeleton /> : error ? <div className="text-destructive text-center py-16">Ошибка при загрузке: {error.message}</div> : renderTable()}
        </TabsContent>
        <TabsContent value="review">
          {isLoading ? <TableSkeleton /> : error ? <div className="text-destructive text-center py-16">Ошибка при загрузке: {error.message}</div> : renderTable()}
        </TabsContent>
        <TabsContent value="draft">
          {isLoading ? <TableSkeleton /> : error ? <div className="text-destructive text-center py-16">Ошибка при загрузке: {error.message}</div> : renderTable()}
        </TabsContent>
        <TabsContent value="archived">
          {isLoading ? <TableSkeleton /> : error ? <div className="text-destructive text-center py-16">Ошибка при загрузке: {error.message}</div> : renderTable()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

