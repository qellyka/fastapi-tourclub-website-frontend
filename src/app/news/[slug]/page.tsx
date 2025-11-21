'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { News } from '@/types';
import RichTextRenderer from '@/components/RichTextRenderer';
import { use } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useAuth } from '@/providers/AuthProvider';
import { notFound } from 'next/navigation';

async function fetchNewsBySlug(slug: string): Promise<{ detail: News }> {
  const { data } = await api.get(`/news/${slug}`);
  return data;
}

export default function NewsDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = use(params);
  const { user } = useAuth();
  const { data: newsItem, isLoading, error } = useQuery<News>({
    queryKey: ['news', slug],
    queryFn: async () => (await fetchNewsBySlug(slug)).detail,
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  if (isLoading) return (
    <div className="container mx-auto px-4 py-24 pt-28 md:pt-32 max-w-4xl">
        <Skeleton className="h-96 w-full mb-8" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-6 w-1/4 mb-8" />
        <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
        </div>
    </div>
  );
  if (error || !newsItem) return notFound();

  const isPublished = newsItem.status?.toLowerCase() === 'published';
  const isAdmin = user?.roles?.includes('admin');
  const isModerator = user?.roles?.includes('moderator');

  if (!isPublished && !isAdmin && !isModerator) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-24 pt-28 md:pt-32 max-w-4xl">
      <article>
        <header className="mb-8">
            {newsItem.cover_s3_url && (
                <div className="relative h-96 w-full rounded-lg overflow-hidden mb-8">
                    <Image 
                        src={newsItem.cover_s3_url}
                        alt={newsItem.title}
                        layout="fill"
                        objectFit="cover"
                    />
                </div>
            )}
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-4">{newsItem.title}</h1>
          {newsItem.summary && <p className="text-xl text-muted-foreground">{newsItem.summary}</p>}
        </header>
        {newsItem.content_html && 
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <RichTextRenderer html={newsItem.content_html} />
            </div>
        }
      </article>
    </div>
  );
}