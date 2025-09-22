
import { Metadata } from "next";
import ApplicationsClientPage from "./ApplicationsClientPage";

export const metadata: Metadata = {
  title: "Заявки в школу | Админ-панель",
};

export default function AdminSchoolApplicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Заявки в школу туризма</h1>
        <p className="text-muted-foreground">
          Управление заявками от пользователей на участие в школе.
        </p>
      </div>
      <ApplicationsClientPage />
    </div>
  );
}
