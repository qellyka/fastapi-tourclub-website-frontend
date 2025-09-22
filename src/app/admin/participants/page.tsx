'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User } from '@/types'; // Assuming Participant has similar fields to User for display
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
import Link from 'next/link';

async function fetchParticipants(): Promise<any> {
  const { data } = await api.get('/club/participants');
  return data;
}

export default function AdminParticipantsPage() {
  const queryClient = useQueryClient();
  const { data: participants, isLoading, error } = useQuery<User[]>({
    queryKey: ['admin-club-participants'],
    queryFn: fetchParticipants,
    select: (data) => data.detail, // Assuming the same response structure
  });

  const deleteMutation = useMutation({
    mutationFn: (participantId: number) => api.delete(`/club/participants/${participantId}`), // Assuming DELETE /api/club/participants/{id}
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-club-participants'] });
    },
  });

  if (isLoading) return <div>Загрузка участников...</div>;
  if (error) return <div>Ошибка при загрузке: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление участниками клуба</h1>
        <Button asChild>
          <Link href="/admin/participants/new">Добавить участника</Link>
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Полное имя</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants?.map((participant, index) => (
              <TableRow key={participant.id || index} className="hover:bg-muted/50 transition-colors duration-150">
                <TableCell>{participant.id}</TableCell>
                <TableCell>{participant.full_name}</TableCell>
                <TableCell>{participant.username}</TableCell>
                <TableCell>{participant.email}</TableCell>
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
                        <Link href={`/admin/participants/edit/${participant.id}`}>Редактировать</Link>
                      </DropdownMenuItem> */}
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => {
                          if (participant.id && confirm('Вы уверены, что хотите удалить этого участника?')) {
                            deleteMutation.mutate(participant.id);
                          }
                        }}
                        disabled={!participant.id}
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
