
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Article, News } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from './ui/badge';

// Define a common interface for content items
interface ContentItem {
  id: number | string;
  slug: string;
  title: string;
  summary?: string;
  cover_s3_url?: string;
  author?: string; // To accommodate article author
}

interface ContentCardProps {
  item: ContentItem;
  type: 'articles' | 'news';
}

export const ContentCard = ({ item, type }: ContentCardProps) => {
  const { slug, title, summary, cover_s3_url, author } = item;
  const link = `/${type}/${slug}`;

  return (
    <Link href={link} className="block group">
      <Card className="h-full flex flex-col border-2 border-transparent transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 bg-card">
        <div className="relative overflow-hidden rounded-t-lg aspect-[16/10]">
          <Image 
            src={cover_s3_url || '/placeholder-image.jpg'} 
            alt={title} 
            width={400}
            height={250}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-white leading-snug">{title}</h3>
          </div>
        </div>
        <CardContent className="flex-grow p-4 md:p-6">
          {summary && <p className="text-muted-foreground line-clamp-3 text-sm">{summary}</p>}
        </CardContent>
        <CardFooter className="p-4 md:p-6 pt-0 flex justify-between items-center">
            <Badge variant="secondary">{type === 'news' ? 'Новость' : 'Статья'}</Badge>
            <div className="flex items-center text-sm text-primary font-semibold">
                <span>Читать далее</span>
                <ArrowUpRight className="w-4 h-4 ml-1 transform-gpu transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
