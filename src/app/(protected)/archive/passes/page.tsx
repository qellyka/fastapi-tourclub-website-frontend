'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Pass } from '@/types';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

async function fetchPasses(): Promise<Pass[]> {
  const { data } = await api.get('/archive/passes');
  return data;
}

function PassCard({ pass }: { pass: Pass }) {
  return (
    <Link href={`/archive/passes/${pass.slug}`} className="block group h-full">
      <Card className="h-full flex flex-col bg-card border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
        <CardHeader>
          <CardTitle className="group-hover:text-primary transition-colors duration-300">{pass.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground"><strong>Регион:</strong> {pass.region}</p>
        </CardContent>
        <CardFooter className="flex-col items-start text-sm text-muted-foreground bg-secondary/50 p-4">
          <p><strong>Сложность:</strong> {pass.complexity}</p>
          <p><strong>Высота:</strong> {pass.height} м</p>
        </CardFooter>
      </Card>
    </Link>
  );
}

export default function PassesPage() {
  const { data: passes, isLoading, error } = useQuery<any>({ 
    queryKey: ['passes'], 
    queryFn: fetchPasses, 
    select: (data) => data.detail, // Extract the array from the response object
  });

  if (isLoading) return <div className="container mx-auto px-4 py-24 text-center">Загрузка перевалов...</div>;
  if (error) return <div className="container mx-auto px-4 py-24 text-center text-destructive">Ошибка при загрузке: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-24 pt-28 md:pt-32">
      <h1 className="text-3xl font-bold mb-6">Каталог перевалов</h1>
      {passes && passes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passes.map((pass) => (
            <PassCard key={pass.slug} pass={pass} />
          ))}
        </div>
      ) : (
        !isLoading && !error && (
            <div className="text-center py-16 border-2 border-dashed rounded-lg mt-6 border-muted-foreground/30">
                <p className="text-lg font-medium text-muted-foreground">Перевалы не найдены</p>
                <p className="text-sm text-muted-foreground/70 mt-1">В данный момент в каталоге нет перевалов. Попробуйте зайти позже.</p>
            </div>
        )
      )}
    </div>
  );
}