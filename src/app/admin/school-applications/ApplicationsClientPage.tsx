
"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllSchoolApplications } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import ApplicationsTable from "./ApplicationsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { SchoolApplicationAdminItem, SchoolApplicationStatus } from "@/types";

import { withAdminAuth } from '@/components/admin/withAdminAuth';

function ApplicationsClientPage() {
  const [status, setStatus] = useState<SchoolApplicationStatus>("pending");

  const { data, isLoading, isError, error } = useQuery<any, Error, SchoolApplicationAdminItem[], any>({
    queryKey: ['allSchoolApplications', status],
    queryFn: () => getAllSchoolApplications(status).then(res => res.detail),
  });

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as SchoolApplicationStatus);
  };

  return (
    <Tabs value={status} onValueChange={handleStatusChange} className="w-full">
      <TabsList>
        <TabsTrigger value="pending">В ожидании</TabsTrigger>
        <TabsTrigger value="approved">Одобренные</TabsTrigger>
        <TabsTrigger value="rejected">Отклоненные</TabsTrigger>
      </TabsList>
      <TabsContent value="pending">
        {isLoading && <Skeleton className="h-64 w-full" />}
        {isError && <p className="text-destructive">{error.message}</p>}
        {data && <ApplicationsTable applications={data} />}
      </TabsContent>
      <TabsContent value="approved">
        {isLoading && <Skeleton className="h-64 w-full" />}
        {isError && <p className="text-destructive">{error.message}</p>}
        {data && <ApplicationsTable applications={data} />}
      </TabsContent>
      <TabsContent value="rejected">
        {isLoading && <Skeleton className="h-64 w-full" />}
        {isError && <p className="text-destructive">{error.message}</p>}
        {data && <ApplicationsTable applications={data} />}
      </TabsContent>
    </Tabs>
  );
}

export default withAdminAuth(ApplicationsClientPage);
