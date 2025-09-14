'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { News } from '@/types';
import RichTextRenderer from '@/components/RichTextRenderer';

import { use } from 'react';

async function fetchNewsBySlug(slug: string): Promise<News | null> {
  try {
    const { data } = await api.get(`/news/${slug}`);
    return data.detail; // Return detail directly
  } catch (error) {
    console.error(`Failed to fetch news item by slug ${slug}`, error);
    return null;
  }
}

export default function NewsDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = use(params);
  const { data: newsItem, isLoading, error } = useQuery<News | null>({ 
    queryKey: ['news', slug], 
    queryFn: () => fetchNewsBySlug(slug), 
  });

  if (isLoading) return <div>Загрузка...</div>;
  if (error || !newsItem) return <div>Новость не найдена.</div>;

  return (
    <div className="max-w-4xl mx-auto py-24 px-4">
      <article>
        {newsItem.content_html && <RichTextRenderer html={newsItem.content_html} />}
      </article>
    </div>
  );
}
