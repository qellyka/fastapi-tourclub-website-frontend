'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { News } from '@/types';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ActivityCard } from '@/components/ActivityCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ContentCard } from '@/components/ContentCard';
import { FaqSection } from '@/components/FaqSection';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useModal } from '@/providers/ModalProvider';
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ActivityDetailModal } from '@/components/ActivityDetailModal';


// --- Data Fetching ---
async function fetchRecentNews(): Promise<News[]> {
  const { data } = await api.get('/news?limit=3&status=published');
  return data.detail;
}

// --- Data ---
const activities = [
    {
        slug: 'mountain-hikes',
        title: 'Горные походы',
        description: 'Откройте для себя величие гор, от простых восхождений до сложных категорийных маршрутов.',
        imageName: 'mountain-hikes.webp',
        content: (
          <div className="space-y-4">
            <p>
              Горный туризм — это не просто спорт, это возможность испытать себя, насладиться невероятными пейзажами и найти настоящих друзей. Мы организуем походы различных категорий сложности.
            </p>
            <h3 className="text-xl font-semibold">Что мы предлагаем:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Походы выходного дня для новичков и семей.</li>
              <li>Многодневные категорийные походы по Кавказу, Алтаю и другим горным системам.</li>
              <li>Обучение основам альпинизма и горного туризма.</li>
              <li>Сопровождение опытными и сертифицированными инструкторами.</li>
            </ul>
          </div>
        ),
    },
    {
        slug: 'water-rafting',
        title: 'Водные сплавы',
        description: 'Почувствуйте энергию воды, сплавляясь по рекам на байдарках и катамаранах.',
        imageName: 'water-rafting.webp',
        content: (
          <div className="space-y-4">
            <p>
              Водные походы — это динамичный и увлекательный вид активного отдыха, который дарит чувство свободы и единения с природой. Мы организуем сплавы на байдарках, катамаранах и рафтах.
            </p>
            <h3 className="text-xl font-semibold">Наши маршруты включают:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Короткие сплавы на 1-2 дня по рекам Ленинградской области и Карелии.</li>
              <li>Недельные экспедиции по знаменитым рекам России.</li>
              <li>Обучение технике гребли и безопасности на воде.</li>
              <li>Все необходимое снаряжение в аренду.</li>
            </ul>
          </div>
        ),
    },
    {
        slug: 'tourism-school',
        title: 'Школа туризма',
        description: 'Пройдите обучение от азов до продвинутого уровня под руководством опытных инструкторов.',
        imageName: 'tourism-school.webp',
        content: (
          <div className="space-y-4">
            <p>
              Наша Школа туризма — это место, где вы можете получить все необходимые знания и навыки для безопасных и увлекательных путешествий. Мы предлагаем комплексные программы обучения.
            </p>
            <h3 className="text-xl font-semibold">Программа обучения:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Теоретические лекции: навигация, первая помощь, планирование маршрутов.</li>
              <li>Практические занятия: работа с веревкой, установка лагеря.</li>
              <li>Специализированные курсы по горному, водному и пешеходному туризму.</li>
              <li>Учебно-тренировочные походы для закрепления навыков.</li>
            </ul>
          </div>
        ),
    },
    {
        slug: 'cycling-trips',
        title: 'Велопоходы',
        description: 'Исследуйте живописные маршруты и новые горизонты на двух колесах вместе с нами.',
        imageName: 'cycling-trips.webp',
        content: (
          <div className="space-y-4">
            <p>
              Велотуризм — это свобода передвижения, возможность охватить большие расстояния и увидеть множество интересных мест за короткое время. Мы приглашаем вас в увлекательные велопоходы.
            </p>
            <h3 className="text-xl font-semibold">Что вас ждет:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Однодневные и многодневные маршруты разной протяженности и сложности.</li>
              <li>Походы по асфальтированным дорогам и грунтовым тропам.</li>
              <li>Поддержка машины сопровождения на некоторых маршрутах.</li>
              <li>Компания единомышленников и незабываемая атмосфера.</li>
            </ul>
          </div>
        ),
    }
];
const loopedActivities = [...activities, ...activities];

// --- Skeleton Loader for News ---
const NewsSkeleton = () => (
  <div className="flex flex-col space-y-3">
    <Skeleton className="h-[220px] w-full rounded-lg" />
    <div className="space-y-2 pt-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<typeof activities[0] | null>(null);

  const { data: news, isLoading, error } = useQuery<News[]>({ 
    queryKey: ['recent-news'],
    queryFn: fetchRecentNews,
  });
  const router = useRouter();
  const { toast } = useToast();
  const { showAuthModal } = useModal();

  const handleActivityClick = (activity: typeof activities[0]) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('unauthenticated') === 'true') {
      toast({
        variant: "warning",
        title: "Требуется аутентификация",
        description: "Пожалуйста, войдите в систему, чтобы получить доступ к этой странице.",
      });
      router.replace('/', { scroll: false });
    }

    if (params.get('open_login') === 'true') {
      showAuthModal();
      router.replace('/', { scroll: false });
    }
  }, [router, toast, showAuthModal]);

  return (
    <>
      <ActivityDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activity={selectedActivity}
      />
      <div className="mt-[-80px]"> {/* Offset for fixed header */} 
        {/* Hero Section */}
        <section className="h-[80vh] md:h-screen w-full bg-[url('/root1.webp')] bg-cover bg-center flex flex-col justify-center items-center text-center relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="relative z-10 p-4 flex flex-col items-center mt-16">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-foreground">
              Откройте мир с &quot;Ирбисом&quot;
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground mb-8">
              Присоединяйтесь к сообществу энтузиастов, влюблённых в путешествия, приключения и открытия.
            </p>
          </div>
        </section>

        <div id="content" className="bg-background">
          {/* Activities Section */}
          <section className="py-16 md:py-24">
              <div className="container mx-auto px-4">
                  <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Направления нашей деятельности</h2>
                      <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Мы организуем походы, обучаем новичков и создаем дружное сообщество для обмена опытом.</p>
                  </div>
                   <Carousel
                    plugins={[Autoplay({ delay: 8000, stopOnInteraction: true })]}
                    opts={{
                      align: "start",
                      loop: true,
                    }}
                    className="w-full"
                  >
                    <CarouselContent>
                      {loopedActivities.map((activity, index) => (
                        <CarouselItem key={`${activity.slug}-${index}`} className="md:basis-1/2 lg:basis-1/3">
                          <div className="p-1">
                             <ActivityCard 
                                title={activity.title}
                                description={activity.description}
                                imageName={activity.imageName}
                                onCardClick={() => handleActivityClick(activity)}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="ml-8" />
                    <CarouselNext className="mr-8"/>
                  </Carousel>
              </div>
          </section>

          {/* Recent News Section */}
          <section className="py-16 md:py-24 bg-secondary/30">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Последние новости</h2>
                <Button variant="ghost" asChild>
                  <Link href="/news">Все новости <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              </div>
              
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <NewsSkeleton />
                  <NewsSkeleton />
                  <NewsSkeleton />
                </div>
              )}
              {error && <div className="text-center text-destructive">Не удалось загрузить новости.</div>}
              {news && Array.isArray(news) && news.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {news.map(item => <ContentCard key={item.slug} item={item} type="news" />)}
                </div>
              ) : (
                !isLoading && !error && <div className="text-center text-muted-foreground">Нет новостей для отображения.</div>
              )}
            </div>
          </section>

          {/* FAQ Section */}
          <FaqSection />
        </div>
      </div>
    </>
  );
}
