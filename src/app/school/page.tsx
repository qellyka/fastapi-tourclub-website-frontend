
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMySchoolApplication } from "@/lib/api";
import ApplicationStatus from "./ApplicationStatus";
import ApplicationForm from "./ApplicationForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useAuth } from "@/providers/AuthProvider";
import { useModal } from "@/providers/ModalProvider";
import { AxiosError } from "axios";

function SchoolPageClient() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { showAuthModal } = useModal();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['mySchoolApplication'],
    queryFn: getMySchoolApplication,
    retry: false,
    enabled: isAuthenticated, // Запрос выполняется только если пользователь авторизован
  });

  const handleApplyClick = () => {
    if (isAuthenticated) {
      setIsFormOpen(true);
    } else {
      toast({
        variant: "warning",
        title: "Требуется авторизация",
        description: "Пожалуйста, войдите в систему, чтобы подать заявку.",
      });
    }
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['mySchoolApplication'] });
    setIsFormOpen(false);
    toast({
      title: "Заявка успешно отправлена!",
      description: "Мы скоро с вами свяжемся.",
    });
  };

  // Ошибку показываем только если это не 401, а реальная проблема с сервером
  const shouldShowError = isError && !(error instanceof AxiosError && error.response?.status === 401);

  if (isLoading && isAuthenticated) { // Скелетон показываем только для авторизованных юзеров, пока идет запрос
    return (
        <div className="container mx-auto px-4 py-24 pt-28 md:pt-32">
            <Skeleton className="h-48 w-full mb-12" />
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }

  if (shouldShowError) {
    return <p className="text-destructive text-center py-24">Ошибка при загрузке данных: {error.message}</p>;
  }

  const application = data?.detail;

  return (
    <div className="bg-background pt-20"> {/* Added padding top for fixed header */}
      <main className="container mx-auto px-4 py-16 sm:py-24">
        <section className="text-center mb-20 md:mb-28">
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tighter mb-4">
            Школа туризма
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Откройте для себя мир приключений, освойте новые навыки и найдите друзей на всю жизнь.
          </p>
        </section>

        <section className="mb-24">
            <div className="max-w-4xl mx-auto bg-secondary/30 rounded-xl p-8 md:p-12 border border-border/50">
                <h2 className="text-4xl font-bold text-center text-foreground mb-8">О школе</h2>
                <div className="text-muted-foreground space-y-6 text-lg text-center leading-relaxed max-w-prose mx-auto">
                    <p>Наша школа - это уникальная возможность для новичков погрузиться в захватывающий мир спортивного туризма, а для опытных туристов – освежить свои знания, отточить навыки и найти надежную команду для будущих походов и экспедиций.</p>
                    <p>Обучение построено на комбинации теоретических лекций и практических выездов. Вы научитесь работать со снаряжением, освоите ориентирование, получите навыки оказания первой помощи и научитесь работать в команде. Все занятия проводят опытные инструкторы и спортсмены с многолетним стажем.</p>
                </div>
            </div>
        </section>

        <section className="text-center">
          {isAuthenticated && application ? (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Ваша заявка уже в пути!</h2>
              <p className="text-lg text-muted-foreground mb-8">Ниже вы можете отслеживать ее статус.</p>
              <ApplicationStatus application={application} />
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Готовы присоединиться?</h2>
              <p className="text-lg text-muted-foreground mb-8">Отправьте заявку, и мы свяжемся с вами в ближайшее время.</p>
              <Button size="lg" className="text-lg px-8 py-6" onClick={handleApplyClick}>Подать заявку</Button>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Анкета для поступления в школу</DialogTitle>
                  </DialogHeader>
                  <ApplicationForm onSuccess={handleSuccess} />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function SchoolPage() {
  return (
      <SchoolPageClient />
  );
}
