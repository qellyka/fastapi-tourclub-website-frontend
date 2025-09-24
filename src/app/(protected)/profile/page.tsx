
'use client';

import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import ProfileClientPage from "./ProfileClientPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarUploader } from "@/components/AvatarUploader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMe } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const profileFormSchema = z.object({
  first_name: z.string().min(1, "Имя не может быть пустым").optional().or(z.literal("")),
  last_name: z.string().min(1, "Фамилия не может быть пустой").optional().or(z.literal("")),
  middle_name: z.string().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      middle_name: user?.middle_name || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        middle_name: user.middle_name || "",
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно обновлены.",
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось обновить профиль: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  if (isAuthLoading || !user) {
    return <div className="container mx-auto px-4 py-24 text-center">Загрузка профиля...</div>;
  }

  const fallback = (user.first_name?.[0] || ' ') + (user.last_name?.[0] || ' ');

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Профиль пользователя</h1>
        <Button variant="destructive" onClick={logout}>Выйти</Button>
      </div>

      <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Ваши данные</CardTitle>
                {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                        Редактировать
                    </Button>
                )}
            </CardHeader>
            <CardContent className="flex items-start space-x-8">
                <AvatarUploader src={user.avatar} fallback={fallback} />
                <div className="space-y-3 pt-2 flex-grow">
                    {!isEditing ? (
                        <div className="space-y-3">
                            <p><strong>Полное имя:</strong> {user.full_name}</p>
                            <p><strong>Имя пользователя:</strong> {user.username}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="last_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Фамилия</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ваша фамилия" {...field} />
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
                                                <Input placeholder="Ваше имя" {...field} />
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
                                                <Input placeholder="Ваше отчество" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                                        {updateProfileMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => {
                                        setIsEditing(false);
                                        form.reset(); // Reset form to current user data
                                    }}>
                                        Отмена
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </div>
            </CardContent>
          </Card>
    
          <ProfileClientPage />
      </div>
    </div>
  );
}