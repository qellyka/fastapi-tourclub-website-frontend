'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Article } from '@/types';
import RichTextRenderer from '@/components/RichTextRenderer';
import { use } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/providers/AuthProvider';
import { notFound } from 'next/navigation';

async function fetchArticleBySlug(slug: string): Promise<{ detail: Article }> {
  const { data } = await api.get(`/articles/${slug}`);
  return data;
}

export default function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = use(params);
  const { user } = useAuth();
  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: ['article', slug],
    queryFn: () => fetchArticleBySlug(slug),
    select: (data) => data.detail,
  });

  if (isLoading) return (
    <div className="container mx-auto px-4 py-24 pt-28 md:pt-32 max-w-4xl">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-6 w-1/4 mb-8" />
        <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-full mt-8" />
            <Skeleton className="h-6 w-2/3" />
        </div>
    </div>
  );
  if (error || !article) return notFound();

  const isPublished = article.status?.toLowerCase() === 'published';
  const isAdmin = user?.roles?.includes('admin');
  const isModerator = user?.roles?.includes('moderator');

  if (!isPublished && !isAdmin && !isModerator) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-24 pt-28 md:pt-32 max-w-4xl">
      <article>
        <header className="mb-8 pb-6 border-b">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-4">{article.title}</h1>
          <p className="text-base text-muted-foreground">Автор: {article.author}</p>
        </header>
        {article.content_html && 
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <RichTextRenderer html={article.content_html} />
            </div>
        }
      </article>
    </div>
  );
}