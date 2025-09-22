
"use client";

import { SchoolApplicationAdminItem, SchoolApplicationUpdateAdmin } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSchoolApplicationStatus } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import Link from 'next/link';

interface Props {
  applications: SchoolApplicationAdminItem[];
}

export default function ApplicationsTable({ applications }: Props) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { mutate } = useMutation({
    mutationFn: ({ id, data }: { id: number, data: SchoolApplicationUpdateAdmin }) => updateSchoolApplicationStatus(id, data),
    onSuccess: (data) => {
      toast({ title: "Успех", description: data.message });
      queryClient.invalidateQueries({ queryKey: ['allSchoolApplications'] });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.response?.data?.message || "Не удалось обновить статус", variant: "destructive" });
    }
  });

  const handleApprove = (id: number) => {
    mutate({ id, data: { status: 'approved', comment: '' } });
  };

  const handleReject = (id: number) => {
    mutate({ id, data: { status: 'rejected', comment } });
    setComment(""); // Reset comment after submission
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Пользователь</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Дата подачи</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow key={app.id}>
            <TableCell>{`${app.user.last_name} ${app.user.first_name}`}</TableCell>
            <TableCell>{app.user.email}</TableCell>
            <TableCell>{new Date(app.created_at).toLocaleDateString('ru-RU')}</TableCell>
            <TableCell className="text-right space-x-2">
                <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/school-applications/${app.id}`}>Посмотреть</Link>
                </Button>
              {app.status === 'pending' && (
                <>
                  <Button size="sm" variant="outline" onClick={() => handleApprove(app.id)}>Одобрить</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">Отклонить</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Отклонить заявку?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Вы можете указать причину отклонения. Пользователь увидит этот комментарий.
                        </AlertDialogDescription>
                        <Textarea 
                          placeholder="Причина отклонения..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleReject(app.id)}>Подтвердить</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              {app.status !== 'pending' && <span className="text-xs text-muted-foreground">Решение принято</span>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
