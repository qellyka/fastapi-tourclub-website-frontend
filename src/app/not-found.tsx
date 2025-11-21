import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden text-center text-white bg-black">
      <Image
        src="/root1.webp"
        alt="Туристический пейзаж"
        fill
        className="absolute top-0 left-0 z-0 object-cover w-full h-full opacity-30"
      />
      <div className="relative z-10 p-8 bg-black rounded-lg bg-opacity-60 backdrop-blur-sm">
        <h1 className="text-6xl font-bold tracking-tighter md:text-9xl font-mono">
          404
        </h1>
        <p className="mt-4 text-lg md:text-2xl">
          Кажется, вы сбились с тропы.
        </p>
        <p className="mt-2 text-md md:text-xl">
          Страница, которую вы ищете, не существует.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Вернуться на главную</Link>
        </Button>
      </div>
    </div>
  );
}
