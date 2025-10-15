'use client';

import { useQuery } from '@tanstack/react-query';
import { use } from 'react';
import api from '@/lib/api';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface UserHike {
  id: number;
  user_id: number;
  hike_id: number;
  role: string;
  hike_name: string;
}

async function fetchUserByUsername(username: string): Promise<{ detail: User }> {
  const { data } = await api.get(`/users/${username}`);
  return data;
}

async function fetchUserHikes(userId: number): Promise<UserHike[]> {
    const { data } = await api.get(`/users/${userId}/hikes`);
    return data;
}

function UserHikesList({ userId }: { userId: number }) {
    const { data: hikes, isLoading, error } = useQuery<UserHike[]>({
        queryKey: ['user-hikes', userId],
        queryFn: () => fetchUserHikes(userId),
        enabled: !!userId,
    });

    if (isLoading) return <Skeleton className="h-48 w-full" />;
    if (error) return <p className="text-destructive">Не удалось загрузить походы.</p>;
    if (!hikes || hikes.length === 0) return <p className="text-muted-foreground">Пользователь еще не участвовал в походах.</p>;

    return (
        <ul className="space-y-2">
            {hikes.map(hike => (
                <li key={hike.id}>
                    <Link href={`/archive/hikes/${hike.hike_id}`}>
                        <div className="block p-3 rounded-md border bg-secondary/50 hover:bg-secondary/80 transition-colors">
                            <p className="font-semibold">{hike.hike_name}</p>
                            <p className="text-sm text-muted-foreground">{hike.role}</p>
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const { username } = use(params);
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['user', username],
    queryFn: () => fetchUserByUsername(username),
    select: (data) => data.detail,
    enabled: !!username,
  });

  if (isLoading) return (
    <div className="container mx-auto px-4 py-24 pt-28 md:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    </div>
  );
  if (error) return <div className="container mx-auto px-4 py-24 text-center text-destructive">Пользователь не найден.</div>;
  if (!user) return null;

  const isClubMember = user.roles && user.roles.includes('club_member');

  return (
    <main className="container mx-auto px-4 py-24 pt-28 md:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-8">
                <Card>
                    <CardContent className="pt-6 flex flex-col items-center gap-4">
                        <Avatar className="h-32 w-32 border-4 border-primary/50">
                          <AvatarImage src={user.avatar_club || user.avatar} alt={user.full_name} />
                          <AvatarFallback>{user.full_name ? user.full_name[0] : ''}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold">{user.full_name}</h1>
                            <p className="text-md text-muted-foreground">@{user.username}</p>
                        </div>
                        {isClubMember && <Badge>Участник клуба</Badge>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>О себе</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                            {user.description || 'Пользователь еще не добавил описание.'}
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Контактная информация</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-muted-foreground">
                            <strong>Email:</strong>{' '}
                            <a href={`mailto:${user.email}`} className="text-blue-500 hover:underline">
                                {user.email}
                            </a>
                        </p>
                        {user.phone_number && (
                            <p className="text-muted-foreground">
                                <strong>Телефон:</strong>{' '}
                                <a href={`tel:${user.phone_number}`} className="text-blue-500 hover:underline">
                                    {user.phone_number}
                                </a>
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader><CardTitle>Походы</CardTitle></CardHeader>
                    <CardContent>
                        <UserHikesList userId={user.id} />
                    </CardContent>
                </Card>
            </div>
        </div>
    </main>
  );
}
