'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserById, updateUser } from '@/lib/api';
import { User, UserAdminUpdate } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  email: z.string().email({ message: "Неверный формат email" }).optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  middle_name: z.string().optional(),
  description: z.string().optional(),
  phone_number: z.string().optional(),
  roles: z.array(z.string()).optional(),
});

const roleOptions = [
  { label: 'Guest', value: 'guest' },
  { label: 'Moderator', value: 'moderator' },
  { label: 'Admin', value: 'admin' },
];

export default function AdminUserEditPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User, Error>({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
        const response = await getUserById(userId);
        return response.detail;
    },
    enabled: !!userId,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      middle_name: '',
      description: '',
      phone_number: '',
      roles: [],
    },
  });

  const mutation = useMutation<User, Error, UserAdminUpdate>({
    mutationFn: (data) => updateUser(userId, data),
    onSuccess: () => {
      toast({ title: "Пользователь обновлен" });
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      router.push('/admin/users');
    },
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: 'destructive' });
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        middle_name: user.middle_name || '',
        description: user.description || '',
        phone_number: user.phone_number || '',
        roles: user.roles || [],
      });
    }
  }, [user, form.reset]);

  if (isLoading) return <div>Загрузка...</div>;
  if (!user) return <div>Пользователь не найден</div>;

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Редактировать пользователя {user.username}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Имя</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Фамилия</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="middle_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Отчество</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Описание</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Номер телефона</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="roles"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Роли</FormLabel>
                            <div className="space-y-2">
                                {roleOptions.map((option) => (
                                    <FormItem key={option.value} className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(option.value)}
                                                onCheckedChange={(checked) => {
                                                    const newValue = [...(field.value || [])];
                                                    if (checked) {
                                                        newValue.push(option.value);
                                                    } else {
                                                        const index = newValue.indexOf(option.value);
                                                        if (index > -1) {
                                                            newValue.splice(index, 1);
                                                        }
                                                    }
                                                    field.onChange(newValue);
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            {option.label}
                                        </FormLabel>
                                    </FormItem>
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </form>
        </Form>
      </CardContent>
    </Card>
  );
}