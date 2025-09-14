'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { News } from '@/types';
import { ChevronDown, Mountain, Waves, Bike, BookOpen } from 'lucide-react';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// --- Data Fetching ---
async function fetchRecentNews(): Promise<News[]> {
  const { data } = await api.get('/news?limit=3');
  return data.detail;
}

// --- FAQ Component ---
const FaqItem = ({ question, answer }: { question: string, answer: string }) => (
  <details className="border-b border-gray-200 py-4 group">
    <summary className="flex justify-between items-center font-semibold cursor-pointer list-none">
      {question}
      <ChevronDown className="w-5 h-5 transition-transform duration-300 group-open:-rotate-180" />
    </summary>
    <div className="mt-4 text-gray-600">
      {answer}
    </div>
  </details>
);

// --- News Card Component ---
const NewsCard = ({ newsItem }: { newsItem: News }) => (
  <Link href={`/news/${newsItem.slug}`} className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
    <div className="relative">
      <img src={newsItem.cover_s3_url || '/placeholder-image.jpg'} alt={newsItem.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"/>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold mb-2 text-gray-800">{newsItem.title}</h3>
      <p className="text-gray-600 mb-4">{newsItem.summary}</p>
      <span className="font-semibold text-blue-600">Подробнее →</span>
    </div>
  </Link>
);


export default function Home() {
  const { data: news, isLoading, error } = useQuery<News[]>({ 
    queryKey: ['recent-news'],
    queryFn: fetchRecentNews,
  });
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

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
  }, [router, toast]);

  const scrollToContent = () => {
    document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqData = [
    { q: 'Как присоединиться к клубу?', a: 'Чтобы присоединиться, просто зарегистрируйтесь на сайте и подайте заявку на участие в одном из наших походов. Мы всегда рады новым участникам!' },
    { q: 'Какой уровень подготовки нужен для походов?', a: 'У нас есть походы для любого уровня подготовки, от новичков до опытных туристов. Каждый маршрут имеет маркировку сложности.' },
    { q: 'Какое снаряжение мне понадобится?', a: 'Список необходимого снаряжения зависит от похода. Базовый список доступен на странице каждого похода. Мы также можем помочь с арендой.' },
    { q: 'Безопасно ли это?', a: 'Безопасность — наш главный приоритет. Все наши гиды — опытные инструкторы, а маршруты тщательно проработаны.' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="h-screen w-full bg-[url('/root1.jpg')] bg-cover bg-center text-white flex flex-col justify-center items-center text-center relative">
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 p-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">Астраханский турклуб "Ирбис"</h1>
          <blockquote className="text-lg md:text-xl italic text-gray-200 mb-6">
            "И нет таких вершин, что взять нельзя..."
            <cite className="block not-italic mt-1 text-gray-300">- Владимир В.</cite>
          </blockquote>
          <p className="text-lg md:text-2xl max-w-3xl mx-auto">
            Туристский Клуб «Ирбис» - сообщество, объединяющее опытных туристов и просто энтузиастов, влюблённых в путешествия, обладающих активной жизненной позицией, жаждущих приключений и открытий!
          </p>
        </div>
        <button onClick={scrollToContent} className="absolute bottom-12 z-10 animate-bounce">
          <ChevronDown className="w-10 h-10" />
        </button>
      </section>

      <div id="content" className="bg-gray-50">
        {/* Recent News Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Последние новости</h2>
            {isLoading && <div className="text-center">Загрузка новостей...</div>}
            {error && <div className="text-center text-red-500">Не удалось загрузить новости.</div>}
            {news && Array.isArray(news) && news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map(item => <NewsCard key={item.slug} newsItem={item} />)}
              </div>
            ) : (
              !isLoading && !error && <div className="text-center text-gray-500">Нет новостей для отображения.</div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Часто задаваемые вопросы</h2>
            <div className="space-y-2">
              {faqData.map(item => <FaqItem key={item.q} question={item.q} answer={item.a} />)}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}