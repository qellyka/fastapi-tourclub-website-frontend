
'use client';

import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import ProfileClientPage from "./ProfileClientPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarUploader } from "@/components/AvatarUploader";

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();

  if (isAuthLoading || !user) {
    return <div className="container mx-auto px-4 py-24 text-center">Загрузка профиля...</div>;
  }

  const fallback = (user.first_name?.[0] || ' ') + (user.last_name?.[0] || ' ');

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Профиль пользователя</h1>
        <Button variant="destructive" onClick={logout}>Выйти</Button>
      </div>

      <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
                <CardTitle>Ваши данные</CardTitle>
            </CardHeader>
            <CardContent className="flex items-start space-x-8">
                <AvatarUploader src={user.avatar} fallback={fallback} />
                <div className="space-y-3 pt-2">
                    <p><strong>Полное имя:</strong> {user.full_name}</p>
                    <p><strong>Имя пользователя:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
            </CardContent>
          </Card>
    
          <ProfileClientPage />
      </div>
    </div>
  );
}