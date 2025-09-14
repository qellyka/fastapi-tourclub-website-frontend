'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { User } from '@/types'; // Assuming participant structure is similar to User
import Link from 'next/link';

async function fetchHikeParticipants(hikeId: number): Promise<any> {
  const { data } = await api.get(`/archive/hikes/${hikeId}/participants?hike_id=${hikeId}`);
  return data;
}

export default function HikeParticipants({ hikeId }: { hikeId: number }) {
  const { data: participants, isLoading, error } = useQuery<User[]>({
    queryKey: ['hike-participants', hikeId],
    queryFn: () => fetchHikeParticipants(hikeId),
    select: (data) => {
      if (!data?.detail) return [];
      // De-duplicate the array based on username to prevent key errors
      const uniqueParticipants = data.detail.filter((participant, index, self) => 
        index === self.findIndex((p) => p.username === participant.username)
      );
      return uniqueParticipants;
    },
  });

  if (isLoading) return <div>Загрузка участников...</div>;
  if (error) return <div>Не удалось загрузить участников.</div>;
  if (!participants || participants.length === 0) return <div>Участники не найдены.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {participants.map((participant) => (
        <div key={participant.username} className="border rounded-lg p-3 flex items-center space-x-3">
          {/* Assuming avatar_url or similar for participant */}
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
            {participant.full_name ? participant.full_name[0] : ''}
          </div>
          <div>
            <p className="font-semibold">{participant.full_name}</p>
            <p className="text-sm text-muted-foreground">{participant.username}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
