
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface ActivityCardProps {
  title: string;
  description: string;
  imageName: string;
  className?: string;
  onCardClick: () => void;
}

export const ActivityCard = ({ title, description, imageName, className, onCardClick }: ActivityCardProps) => {
  const imageUrl = `/${imageName}`;

  return (
    <div onClick={onCardClick} className={cn("group block cursor-pointer", className)}>
      <Card className="overflow-hidden min-h-[480px] h-[480px] flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-[280px] w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

        </div>
        <CardContent className="p-6 pb-4 overflow-hidden">
          <h3 className="text-2xl font-bold tracking-tight mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
        <CardFooter className="p-6 pt-0 mt-auto">
           <div className="text-primary font-semibold flex items-center">
                Узнать больше
                <ArrowRight className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
            </div>
        </CardFooter>
      </Card>
    </div>
  );
};
