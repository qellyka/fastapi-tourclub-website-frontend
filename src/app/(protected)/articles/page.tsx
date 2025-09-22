'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Article } from '@/types';
import { ContentCard } from '@/components/ContentCard';
import { Skeleton } from '@/components/ui/skeleton';

async function fetchArticles(): Promise<{ detail: Article[] }> {
  const { data } = await api.get('/articles');
  return data;
}

const ArticlesSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[220px] w-full rounded-lg" />
            <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        </div>
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[220px] w-full rounded-lg" />
            <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        </div>
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[220px] w-full rounded-lg" />
            <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        </div>
    </div>
)

export default function ArticlesPage() {
  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ['articles'],
    queryFn: async () => (await fetchArticles()).detail,
  });

  return (
    <div className="container mx-auto px-4 py-24 pt-28 md:pt-32">
      <h1 className="text-4xl font-bold tracking-tighter mb-8">Статьи</h1>
      {isLoading && <ArticlesSkeleton />}
      {error && <div className="text-center py-16 text-destructive bg-destructive/10 p-4 rounded-lg">Не удалось загрузить статьи.</div>}
      {!isLoading && !error && articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((item) => (
            <ContentCard key={item.id} item={item} type="articles" />
          ))}
        </div>
      ) : (
        !isLoading && !error && (
            <div className="text-center py-16 border-2 border-dashed rounded-lg mt-6 border-muted-foreground/30">
                <p className="text-lg font-medium text-muted-foreground">Статей пока нет</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Загляните позже, мы обязательно что-нибудь опубликуем.</p>
            </div>
        )
      )}
    </div>
  );
}