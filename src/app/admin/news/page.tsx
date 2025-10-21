'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { News, ContentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/providers/AuthProvider';
import { getAllNews } from '@/lib/api';

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
                        <TableHead><Skeleton className="h-6 w-48" /></TableHead>
                        <TableHead><Skeleton className="h-6 w-48" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    </div>
)

export default function AdminNewsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ContentStatus>('published');
  const { user } = useAuth();

  const { data: news, isLoading, error } = useQuery<News[]> ({
    queryKey: ['admin-news', status],
    queryFn: async () => (await getAllNews(status)).detail,
  });

  const deleteMutation = useMutation({
    mutationFn: (newsId: number) => api.delete(`/news/${newsId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as ContentStatus);
  };

  const userRole = user?.roles.includes('admin') ? 'admin' : user?.roles.includes('moderator') ? 'moderator' : 'user';

  const getActionText = (itemStatus: ContentStatus) => {
    if (userRole === 'admin') {
      return 'Редактировать';
    }
    if (userRole === 'moderator') {
      return itemStatus === 'draft' ? 'Редактировать' : 'Просмотр';
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
            <TableHead>Статус</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {news?.map((item) => (
            <TableRow key={item.id} className="hover:bg-secondary">
              <TableCell>{item.id}</TableCell>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell><Badge variant={item.status === 'published' ? 'default' : 'secondary'}>{item.status}</Badge></TableCell>
              <TableCell className="text-muted-foreground">{item.slug}</TableCell>
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
                      <Link href={`/admin/news/edit/${item.id}`}>{getActionText(item.status)}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
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
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold">Управление новостями</h1>
            <p className="text-muted-foreground">Просмотр, создание, редактирование и удаление новостей.</p>
        </div>
        <Button asChild>
          <Link href="/admin/news/new">Создать новость</Link>
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