'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function EmailVerifiedPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Перенаправляем на главную и добавляем параметр для открытия модального окна
      router.push('/?open_login=true');
    }, 5000); // 5 секунд

    // Очищаем таймер, если компонент размонтируется раньше времени
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 dark:bg-green-900/50 rounded-full p-3 w-fit">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="mt-4">Почта успешно подтверждена!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Через 5 секунд вы будете автоматически перенаправлены на главную страницу для входа в систему.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
