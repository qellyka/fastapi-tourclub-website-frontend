'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from 'react';
import { useModal } from '@/providers/ModalProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

// --- Login Form --- //
const loginSchema = z.object({
  username: z.string().min(1, "Имя пользователя обязательно"),
  password: z.string().min(1, "Пароль обязателен"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const queryClient = useQueryClient();
  const { hideAuthModal } = useModal();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: LoginFormValues) => api.post('/auth/login', data),
    onSuccess: (response) => {
      const user = response.data.detail.user;
      queryClient.setQueryData(['user'], user);
      toast({ title: "Вход выполнен", description: `Добро пожаловать, ${user.username}!` });
      hideAuthModal();
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.detail;
      if (errorMessage === "user unauthorized") {
        setError("Неверный логин или пароль");
      } else {
        setError(errorMessage || "Произошла ошибка при входе");
      }
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setError(null);
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-username">Имя пользователя</Label>
        <Input id="login-username" {...register('username')} />
        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Пароль</Label>
        <Input id="login-password" type="password" {...register('password')} />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Вход...' : 'Войти'}
      </Button>
    </form>
  );
}

// --- Register Form --- //
const registerSchema = z.object({
  username: z.string().min(3, "Минимум 3 символа"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
  first_name: z.string().min(1, "Имя обязательно"),
  last_name: z.string().min(1, "Фамилия обязательна"),
  middle_name: z.string().optional(),
});
type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: RegisterFormValues) => api.post('/auth/register', data),
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || "Произошла ошибка при регистрации");
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    setError(null);
    mutation.mutate(data);
  };

  if (success) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-semibold">Регистрация успешна!</h3>
        <p className="text-sm text-muted-foreground mt-2">На вашу почту отправлено письмо для подтверждения аккаунта.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
       <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="last_name">Фамилия</Label>
          <Input id="last_name" {...register('last_name')} />
          {errors.last_name && <p className="text-sm text-red-500">{errors.last_name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="first_name">Имя</Label>
          <Input id="first_name" {...register('first_name')} />
          {errors.first_name && <p className="text-sm text-red-500">{errors.first_name.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Имя пользователя</Label>
        <Input id="username" {...register('username')} />
        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" type="password" {...register('password')} />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Регистрация...' : 'Создать аккаунт'}
      </Button>
    </form>
  );
}

// --- Main Auth Modal --- //
export function AuthModal() {
  const { isAuthModalOpen, hideAuthModal } = useModal();

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={hideAuthModal}>
      <DialogContent className="sm:max-w-[425px]">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="fade-in">
            <DialogHeader className="mb-4">
              <DialogTitle>Вход</DialogTitle>
              <DialogDescription>Войдите в свой аккаунт, чтобы продолжить</DialogDescription>
            </DialogHeader>
            <LoginForm />
          </TabsContent>
          <TabsContent value="register" className="fade-in">
            <DialogHeader className="mb-4">
              <DialogTitle>Регистрация</DialogTitle>
              <DialogDescription>Создайте аккаунт, чтобы стать частью клуба</DialogDescription>
            </DialogHeader>
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
