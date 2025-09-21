'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef, useLayoutEffect } from 'react';
import { useModal } from '@/providers/ModalProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
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
      <div className="text-center h-full flex flex-col justify-center">
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
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Регистрация...' : 'Создать аккаунт'}
      </Button>
    </form>
  );
}

// --- Main Auth Modal --- //
export function AuthModal() {
  const { isAuthModalOpen, hideAuthModal } = useModal();
  const [activeView, setActiveView] = useState('login');
  const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [activeView]);

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && hideAuthModal()}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">
            {activeView === 'login' ? 'Вход в аккаунт' : 'Создание аккаунта'}
          </DialogTitle>
          <DialogDescription>
            {activeView === 'login' 
              ? 'Войдите, чтобы получить доступ ко всем возможностям' 
              : 'Присоединяйтесь к нашему сообществу путешественников'}
          </DialogDescription>
        </DialogHeader>

        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full my-4">
            <button 
                onClick={() => setActiveView('login')} 
                className={cn("w-1/2 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", activeView === 'login' && 'bg-background text-foreground shadow-sm')}
            >
                Вход
            </button>
            <button 
                onClick={() => setActiveView('register')} 
                className={cn("w-1/2 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", activeView === 'register' && 'bg-background text-foreground shadow-sm')}
            >
                Регистрация
            </button>
        </div>

        <div 
          style={{ height: contentHeight, transition: 'height 0.3s ease-in-out' }} 
          className="overflow-hidden"
        >
          <div ref={contentRef}>
            {activeView === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>

        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
