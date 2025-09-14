'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { User } from '@/types';

async function fetchParticipants(): Promise<any> {
  const { data } = await api.get('/club/participants');
  return data;
}

function ParticipantCard({ participant }: { participant: User }) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-500 ease-in-out hover:shadow-xl">
      {participant.avatar ? (
        <img 
          src={participant.avatar} 
          alt={participant.full_name} 
          className="w-full h-96 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" 
        />
      ) : (
        <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
          <span className="text-5xl font-bold text-gray-400">{participant.full_name ? participant.full_name.charAt(0) : '?'}</span>
        </div>
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

      {/* Text content */}
      <div className="absolute bottom-0 left-0 p-6 w-full">
        <div className="transform transition-all duration-500 ease-in-out">
          <h3 className="text-2xl font-bold text-white">{participant.full_name}</h3>
          {participant.description && <p className="text-sm text-white/90 mt-1">{participant.description}</p>}
        </div>
      </div>
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
    <div className="bg-gray-50">
      <main className="container mx-auto px-4 py-16 sm:py-24">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-4">
            О нашем клубе
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Мы — сообщество энтузиастов, объединенных страстью к приключениям, исследованиям и красоте дикой природы.
          </p>
        </section>

        {/* Our Mission Section */}
        <section className="mb-24">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
                <h2 className="text-4xl font-bold text-center text-gray-900 mb-8">Наша миссия</h2>
                <div className="text-gray-700 space-y-6 text-lg text-center leading-relaxed">
                    <p>Величественные цепи гор и завораживающие долины зовут нас каждый раз, когда глазам не хватает красоты, сознанию - свободы, а сердцу - покоя. Тоскует по напористому удару весла кристальная гладь озер и рек, а непокорные раскаты жаждут укрощения. Миллионы троп и дорог приглашают «двухколесных коней» прокатиться, даруя неповторимый ветер свободы в волосах, точно так же, как одинокие извилистые коридоры пещер рады гостям, награждая смельчаков своей звенящей тишиной и уникальной атмосферой.</p>
                    <p>Мир открыт для нас, так давайте же вместе делать шаги к нему навстречу, а именно: ходить в походы, открывая новые горизонты; организовывать познавательные поездки и вылазки, каждый раз вынося из них что-то новое и полезное; устраивать увлекательные соревнования и тренировки, укрепляя тем самым наш командный дух и совершенствуя свои навыки и умения; проводить лекционные занятия с целью углубления теоретических знаний в различных областях туризма!</p>
                </div>
            </div>
        </section>

        {/* Participants Section */}
        <section>
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Наши участники
          </h2>
          {isLoading ? (
            <div className="text-center text-lg">Загрузка участников...</div>
          ) : error ? (
            <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">Не удалось загрузить участников.</div>
          ) : participants && participants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {participants.map((participant) => (
                <ParticipantCard key={participant.username} participant={participant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <p className="text-lg font-medium text-gray-500">Информация об участниках клуба скоро появится</p>
              <p className="text-sm text-gray-400 mt-1">Мы работаем над этим разделом.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
