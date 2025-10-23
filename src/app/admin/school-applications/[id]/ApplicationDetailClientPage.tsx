'use client';

import { useQuery } from "@tanstack/react-query";
import { getSchoolApplicationById } from "@/lib/api";
import { SchoolApplication } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Props {
    id: number;
}

const statusMap: Record<SchoolApplication['status'], { text: string; variant: "default" | "destructive" | "secondary" }> = {
  pending: { text: "В обработке", variant: "secondary" },
  approved: { text: "Одобрена", variant: "default" },
  rejected: { text: "Отклонена", variant: "destructive" },
};

function DetailRow({ label, value }: { label: string, value: React.ReactNode }) {
    if (!value) return null;
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b border-border/50">
            <dt className="font-medium text-muted-foreground">{label}</dt>
            <dd className="col-span-2 text-foreground">{value}</dd>
        </div>
    )
}

export default function ApplicationDetailClientPage({ id }: Props) {
    const { data, isLoading, isError, error } = useQuery<SchoolApplication, Error>({
        queryKey: ['schoolApplication', id],
        queryFn: () => getSchoolApplicationById(id).then(res => res.detail),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
                </CardContent>
            </Card>
        )
    }

    if (isError) {
        return <p className="text-destructive text-center py-16">{error.message}</p>;
    }

    if (!data) {
        return <p className="text-center py-16">Заявка не найдена.</p>;
    }

    const { text, variant } = statusMap[data.status];

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">Заявка от {data.last_name} {data.first_name}</CardTitle>
                        <CardDescription>Подана: {new Date(data.created_at).toLocaleString('ru-RU')}</CardDescription>
                    </div>
                    <Badge variant={variant} className="text-base">{text}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <dl>
                    <DetailRow label="ФИО" value={<span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">{`${data.last_name} ${data.first_name} ${data.middle_name || ''}`}</span>} />
                    <DetailRow label="Дата рождения" value={new Date(data.date_of_birth).toLocaleDateString('ru-RU')} />
                    <DetailRow label="Email" value={<a href={`mailto:${data.email}`} className="text-primary hover:underline">{data.email}</a>} />
                    <DetailRow label="Телефон" value={<a href={`tel:${data.phone_number}`} className="text-primary hover:underline">{data.phone_number}</a>} />
                    <DetailRow label="Профиль VK" value={data.vk_profile ? <a href={data.vk_profile} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{data.vk_profile}</a> : "Не указан"} />
                    <DetailRow label="Опыт" value={data.experience} />
                    <DetailRow label="Обучался ранее" value={data.previous_school === 'yes' ? 'Да' : 'Нет'} />
                    <DetailRow label="Откуда узнал" value={data.how_heard} />
                    <DetailRow label="Чему хочет научиться" value={<p className="whitespace-pre-wrap">{data.question}</p>} />
                    <DetailRow label="Пожелания" value={<p className="whitespace-pre-wrap">{data.wishes}</p>} />
                    {data.status === 'rejected' && <DetailRow label="Причина отклонения" value={<p className="text-destructive font-medium">{data.comment}</p>} />}
                </dl>
            </CardContent>
        </Card>
    );
}