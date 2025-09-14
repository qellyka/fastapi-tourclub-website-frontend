'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Hike } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

async function fetchHikes(): Promise<any> {
  const { data } = await api.get('/archive/hikes');
  return data;
}

export default function AdminHikesPage() {
  const queryClient = useQueryClient();
  const { data: hikes, isLoading, error } = useQuery<Hike[]>({
    queryKey: ['admin-hikes'],
    queryFn: fetchHikes,
    select: (data) => data.detail, // Assuming the same response structure
  });

  const deleteMutation = useMutation({
    mutationFn: (hikeId: number) => api.delete(`/archive/hikes/${hikeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hikes'] });
    },
  });

  if (isLoading) return <div>Загрузка походов...</div>;
  if (error) return <div>Ошибка при загрузке: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление походами</h1>
        <Button asChild>
          <Link href="/admin/hikes/new">Добавить поход</Link>
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
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hikes?.map((hike) => (
              <TableRow key={hike.id} className="hover:bg-gray-50 transition-colors duration-150">
                <TableCell>{hike.id}</TableCell>
                <TableCell>{hike.name}</TableCell>
                <TableCell>{hike.region}</TableCell>
                <TableCell>{hike.complexity}</TableCell>
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
                        <Link href={`/admin/hikes/edit/${hike.id}`}>Редактировать</Link>
                      </DropdownMenuItem> */}
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => {
                          if (confirm('Вы уверены, что хотите удалить этот поход?')) {
                            deleteMutation.mutate(hike.id);
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
