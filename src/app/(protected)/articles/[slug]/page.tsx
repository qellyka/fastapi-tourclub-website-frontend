'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Article } from '@/types';
import RichTextRenderer from '@/components/RichTextRenderer';

import { use } from 'react';

async function fetchArticleBySlug(slug: string): Promise<any> {
  try {
    const { data } = await api.get(`/articles/${slug}`);
    return data;
  } catch (error) {
    console.error(`Failed to fetch article by slug ${slug}`, error);
    return { detail: null };
  }
}

export default function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = use(params);
  const { data: article, isLoading, error } = useQuery<any>({ 
    queryKey: ['article', slug], 
    queryFn: () => fetchArticleBySlug(slug), 
    select: (data) => data.detail, // Extract the object from the response
  });

  if (isLoading) return <div>Загрузка...</div>;
  if (error || !article) return <div>Статья не найдена.</div>;

  return (
    <div className="max-w-4xl mx-auto py-24 px-4 flex-grow flex flex-col">
      <article>
        <div className="mb-6 pb-4 border-b">
          <p className="text-sm text-muted-foreground">Автор: {article.author}</p>
        </div>
        {article.content_html && <RichTextRenderer html={article.content_html} />}
      </article>
    </div>
  );
}
