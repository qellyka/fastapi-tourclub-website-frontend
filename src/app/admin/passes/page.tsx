'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Pass } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

async function fetchPasses(): Promise<any> {
  const { data } = await api.get('/archive/passes');
  return data;
}

export default function AdminPassesPage() {
  const queryClient = useQueryClient();
  const { data: passes, isLoading, error } = useQuery<Pass[]>({
    queryKey: ['admin-passes'],
    queryFn: fetchPasses,
    select: (data) => data.detail, // Assuming the same response structure
  });

  const deleteMutation = useMutation({
    mutationFn: (passId: number) => api.delete(`/archive/passes/${passId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-passes'] });
    },
  });

  if (isLoading) return <div>Загрузка перевалов...</div>;
  if (error) return <div>Ошибка при загрузке: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление перевалами</h1>
        <Button asChild>
          <Link href="/admin/passes/new">Добавить перевал</Link>
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Регион</TableHead>
              <TableHead>Сложность</TableHead>
              <TableHead>Высота</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passes?.map((pass) => (
              <TableRow key={pass.id} className="hover:bg-gray-50 transition-colors duration-150">
                <TableCell>{pass.id}</TableCell>
                <TableCell>{pass.name}</TableCell>
                <TableCell>{pass.region}</TableCell>
                <TableCell>{pass.complexity}</TableCell>
                <TableCell>{pass.height} м</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <DotsHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Edit link will be added later */}
                      {/* <DropdownMenuItem asChild>
                        <Link href={`/admin/passes/edit/${pass.id}`}>Редактировать</Link>
                      </DropdownMenuItem> */}
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => {
                          if (confirm('Вы уверены, что хотите удалить этот перевал?')) {
                            deleteMutation.mutate(pass.id);
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
