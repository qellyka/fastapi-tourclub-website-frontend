import Link from 'next/link';
import { Article, News } from '@/types';

interface ContentCardProps {
  item: Article | News;
  type: 'articles' | 'news';
}

export default function ContentCard({ item, type }: ContentCardProps) {
  const isArticle = (i: Article | News): i is Article => type === 'articles';

  const title = item.title;
  const summary = 'summary' in item ? item.summary : ''; // News has summary, Article might not
  const coverUrl = item.cover_s3_url;
  const link = `/${type}/${item.slug}`;

  return (
    <Link href={link} className="block group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors duration-300 mb-2">{title}</h3>
        {summary && <p className="text-sm text-gray-600 line-clamp-3">{summary}</p>}
        {isArticle(item) && <p className="text-sm text-gray-500 mt-2">Автор: {item.author}</p>}
      </div>
    </Link>
  );
}
