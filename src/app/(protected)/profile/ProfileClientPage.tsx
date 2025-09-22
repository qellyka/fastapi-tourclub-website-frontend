
'use client';

import { useQuery } from "@tanstack/react-query";
import { getMySchoolApplication } from "@/lib/api";
import ApplicationStatus from "@/app/school/ApplicationStatus";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfileClientPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['mySchoolApplication'],
    queryFn: getMySchoolApplication,
    retry: false,
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (isError) {
    return null; // Don't show anything if there's an error fetching the application
  }

  const application = data?.detail;

  return (
    <div className="mt-8">
      {application ? (
        <ApplicationStatus application={application} />
      ) : (
        <Card className="text-center">
            <CardHeader>
                <CardTitle>Школа туризма</CardTitle>
                <CardDescription>Вы еще не подали заявку</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="mb-6 text-gray-600 max-w-xl mx-auto">Хотите повысить свою квалификацию, научиться новому и стать частью команды? Подайте заявку в нашу школу!</p>
                <Button asChild>
                    <Link href="/school">Перейти к странице школы</Link>
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
