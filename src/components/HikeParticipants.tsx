'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { HikeParticipant } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

async function fetchHikeParticipants(hikeId: number): Promise<{ detail: HikeParticipant[] }> {
  const { data } = await api.get(`/archive/hikes/${hikeId}/participants?hike_id=${hikeId}`);
  return data;
}

export default function HikeParticipants({ hikeId }: { hikeId: number }) {
  const { data: participants, isLoading, error } = useQuery<HikeParticipant[]>({
    queryKey: ['hike-participants', hikeId],
    queryFn: async () => (await fetchHikeParticipants(hikeId)).detail,
    select: (data) => {
      if (!data) return [];
      // De-duplicate the array based on username to prevent key errors
      const uniqueParticipants = data.filter((participant, index, self) => 
        index === self.findIndex((p) => p.username === participant.username)
      );
      return uniqueParticipants;
    },
  });

  if (isLoading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
    </div>
  );
  if (error) return <div className="text-destructive">Не удалось загрузить участников.</div>;
  if (!participants || participants.length === 0) return <div className="text-muted-foreground">Участники не найдены.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {participants.map((participant) => (
        <div key={participant.username} className="border rounded-lg p-3 flex items-center space-x-3 bg-secondary/50">
          <Avatar>
            <AvatarImage src={participant.avatar} alt={participant.full_name} />
            <AvatarFallback>{participant.full_name ? participant.full_name[0] : ''}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{participant.full_name}</p>
            <p className="text-xs text-muted-foreground">@{participant.username}</p>
            {participant.role && <p className="text-xs font-medium text-primary capitalize">{participant.role}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}