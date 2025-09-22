
"use client";

import { SchoolApplication } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  application: SchoolApplication;
}

const statusMap: Record<SchoolApplication['status'], { text: string; variant: "default" | "destructive" | "secondary" }> = {
  pending: { text: "В обработке", variant: "secondary" },
  approved: { text: "Одобрена", variant: "default" },
  rejected: { text: "Отклонена", variant: "destructive" },
};

export default function ApplicationStatus({ application }: Props) {
  const { text, variant } = statusMap[application.status];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center gap-2">
            <CardTitle>Ваша заявка в школу</CardTitle>
            <Badge variant={variant}>{text}</Badge>
        </div>
        <CardDescription>Подана: {new Date(application.created_at).toLocaleDateString('ru-RU')}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">Мы рассматриваем вашу заявку. Вы получите уведомление на почту, когда решение будет принято.</p>
        {application.status === 'rejected' && application.comment && (
          <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
            <h4 className="font-semibold text-destructive">Причина отклонения:</h4>
            <p className="text-sm text-destructive/90">{application.comment}</p>
          </div>
        )}
         {application.status === 'approved' && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <h4 className="font-semibold text-primary">Поздравляем!</h4>
            <p className="text-sm text-primary/90">Ваша заявка одобрена. В ближайшее время с вами свяжутся для уточнения деталей и организационных моментов.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
