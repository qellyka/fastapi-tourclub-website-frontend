'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Pass } from '@/types';
import Link from 'next/link';

async function fetchPasses(): Promise<Pass[]> {
  const { data } = await api.get('/archive/passes');
  return data;
}

function PassCard({ pass }: { pass: Pass }) {
  return (
    <Link href={`/archive/passes/${pass.slug}`} className="block group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-4">
        <h3 className="text-lg font-bold group-hover:text-primary transition-colors duration-300">{pass.name}</h3>
        <p className="text-sm text-muted-foreground mt-2"><strong>Регион:</strong> {pass.region}</p>
        <p className="text-sm text-muted-foreground"><strong>Сложность:</strong> {pass.complexity}</p>
        <p className="text-sm text-muted-foreground"><strong>Высота:</strong> {pass.height} м</p>
      </div>
    </Link>
  );
}

export default function PassesPage() {
  const { data: passes, isLoading, error } = useQuery<any>({ 
    queryKey: ['passes'], 
    queryFn: fetchPasses, 
    select: (data) => data.detail, // Extract the array from the response object
  });

  if (isLoading) return <div>Загрузка перевалов...</div>;
  if (error) return <div>Ошибка при загрузке: {error.message}</div>;

  return (
    <main className="container mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold mb-6">Каталог перевалов</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {passes?.map((pass) => (
          <PassCard key={pass.slug} pass={pass} />
        ))}
      </div>
    </main>
  );
}
