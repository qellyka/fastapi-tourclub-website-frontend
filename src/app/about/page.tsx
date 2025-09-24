'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { User } from '@/types';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import TiltedCard from '@/components/TiltedCard';

async function fetchParticipants(): Promise<{ detail: User[] }> {
  const { data } = await api.get('/club/participants');
  return data;
}

function ParticipantCard({ participant }: { participant: User }) {
  // Prioritize avatar_club, fall back to avatar.
  let imageUrl = participant.avatar_club || participant.avatar;

  // If an image URL exists and it's a relative path, make it absolute.
  if (imageUrl && imageUrl.startsWith('/')) {
    imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${imageUrl}`;
  }

  // The content to be displayed over the image
  const overlayContent = (
    <div className="w-full h-full rounded-lg bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4 md:p-6">
      <h3 className="text-xl font-bold text-white">{participant.full_name}</h3>
      {participant.description && <p className="text-sm text-white/80 mt-1 max-w-prose">{participant.description}</p>}
    </div>
  );

  if (imageUrl) {
    return (
      <TiltedCard
        imageSrc={imageUrl}
        altText={participant.full_name}
        containerHeight="24rem" // h-96
        imageHeight="100%"
        imageWidth="100%"
        overlayContent={overlayContent}
        displayOverlayContent={true}
        showTooltip={false}
      />
    );
  }

  // Fallback for participants without an image
  return (
    <div className="group relative overflow-hidden rounded-lg bg-card shadow-sm border border-border/50">
      <div className="w-full h-96 bg-muted flex items-center justify-center">
        <span className="text-5xl font-bold text-muted-foreground">{participant.full_name ? participant.full_name.charAt(0) : '?'}</span>
      </div>
      {overlayContent}
    </div>
  );
}

export default function AboutPage() {
  const { data: participants, isLoading, error } = useQuery<User[]>({
    queryKey: ['club-participants'],
    queryFn: fetchParticipants,
    select: (data) => data.detail,
  });

  return (
    <div className="bg-background pt-20"> {/* Added padding top for fixed header */}
      <main className="container mx-auto px-4 py-16 sm:py-24">
        <section className="text-center mb-20 md:mb-28">
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tighter mb-4">
            О нашем клубе
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Мы — сообщество энтузиастов, объединенных страстью к приключениям, исследованиям и красоте дикой природы.
          </p>
        </section>

        <section className="mb-24">
            <div className="max-w-4xl mx-auto bg-secondary/30 rounded-xl p-8 md:p-12 border border-border/50">
                <h2 className="text-4xl font-bold text-center text-foreground mb-8">Наша миссия</h2>
                <div className="text-muted-foreground space-y-6 text-lg text-center leading-relaxed max-w-prose mx-auto">
                    <p>Величественные цепи гор и завораживающие долины зовут нас каждый раз, когда глазам не хватает красоты, сознанию - свободы, а сердцу - покоя. Тоскует по напористому удару весла кристальная гладь озер и рек, а непокорные раскаты жаждут укрощения.</p>
                    <p>Мир открыт для нас, так давайте же вместе делать шаги к нему навстречу: ходить в походы, открывая новые горизонты; организовывать познавательные поездки, каждый раз вынося из них что-то новое; устраивать увлекательные соревнования, укрепляя командный дух и совершенствуя свои навыки!</p>
                </div>
            </div>
        </section>

        <section>
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            Наши участники
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive bg-destructive/10 p-4 rounded-lg">Не удалось загрузить участников.</div>
          ) : participants && participants.length > 0 ? (
            (() => {
              const uniqueParticipants = participants.filter(
                (participant, index, self) =>
                  index === self.findIndex((p) => (
                    p.id ? p.id === participant.id : p.username === participant.username
                  ))
              );
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {uniqueParticipants.map((participant) => (
                    <ParticipantCard
                      key={participant.id || participant.username}
                      participant={participant}
                    />
                  ))}
                </div>
              );
            })()
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg border-muted-foreground/30">
              <p className="text-lg font-medium text-muted-foreground">Информация об участниках клуба скоро появится</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Мы работаем над этим разделом.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}