'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { News } from '@/types';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bike, BookOpen, Mountain, Waves } from 'lucide-react';
import { ContentCard } from '@/components/ContentCard';
import { FaqSection } from '@/components/FaqSection';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useModal } from '@/providers/ModalProvider';

// --- Data Fetching ---
async function fetchRecentNews(): Promise<News[]> {
  const { data } = await api.get('/news?limit=3');
  return data.detail;
}

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

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="p-6 rounded-lg bg-secondary/50 border border-border/50">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
    </div>
);

export default function Home() {
  const { data: news, isLoading, error } = useQuery<News[]>({ 
    queryKey: ['recent-news'],
    queryFn: fetchRecentNews,
  });
  const router = useRouter();
  const { toast } = useToast();
  const { showAuthModal } = useModal();

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
    <div className="mt-[-80px]"> {/* Offset for fixed header */} 
      {/* Hero Section */}
      <section className="h-[80vh] md:h-screen w-full bg-[url('/root1.jpg')] bg-cover bg-center flex flex-col justify-center items-center text-center relative">
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
        {/* Features Section */}
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Направления нашей деятельности</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Мы организуем походы, обучаем новичков и создаем дружное сообщество для обмена опытом.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={<Mountain className="w-6 h-6" />} 
                        title="Горные походы"
                        description="Откройте для себя величие гор, от простых восхождений до сложных категорийных маршрутов."
                    />
                    <FeatureCard 
                        icon={<Waves className="w-6 h-6" />} 
                        title="Водные сплавы"
                        description="Почувствуйте энергию воды, сплавляясь по рекам на байдарках и катамаранах."
                    />
                    <FeatureCard 
                        icon={<BookOpen className="w-6 h-6" />} 
                        title="Школа туризма"
                        description="Пройдите обучение от азов до продвинутого уровня под руководством опытных инструкторов."
                    />
                </div>
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
  );
}
