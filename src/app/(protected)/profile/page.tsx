'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Check, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const RequiredAsterisk = () => <span className="text-red-500">*</span>;

// --- Multi-step Form Component ---
const TourismSchoolForm = ({ user, setFormVisible }: { user: any, setFormVisible: (visible: boolean) => void }) => {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const nameParts = user.full_name ? user.full_name.split(' ') : [];
  const [formData, setFormData] = useState({
    email: user.email || '',
    lastName: user.last_name || nameParts[0] || '',
    firstName: user.first_name || nameParts[1] || '',
    middleName: user.middle_name || nameParts.slice(2).join(' ') || '',
    dateOfBirth: '',
    phoneNumber: '',
    vkProfile: '',
    experience: '',
    previousSchool: '',
    howHeard: '',
    question: '',
    wishes: '',
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isConfirmAstrakhanOpen, setConfirmAstrakhanOpen] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data: any) => {
      console.log("Submitting form data:", data);
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
  });

  const validateStep = (currentStep: number) => {
    const stepErrors: Record<string, boolean> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.lastName) { stepErrors.lastName = true; isValid = false; }
      if (!formData.firstName) { stepErrors.firstName = true; isValid = false; }
      if (!formData.email) { stepErrors.email = true; isValid = false; }
      if (!formData.dateOfBirth) { stepErrors.dateOfBirth = true; isValid = false; }
      if (!formData.phoneNumber) { stepErrors.phoneNumber = true; isValid = false; }
      if (!formData.vkProfile) { stepErrors.vkProfile = true; isValid = false; }
    }

    if (currentStep === 2) {
      if (!formData.experience) { stepErrors.experience = true; isValid = false; }
      if (!formData.previousSchool) { stepErrors.previousSchool = true; isValid = false; }
      if (!formData.howHeard) { stepErrors.howHeard = true; isValid = false; }
    }
    
    if (currentStep === 3) {
        if (!formData.consent) { stepErrors.consent = true; isValid = false; }
    }

    setErrors(prev => ({ ...prev, ...stepErrors }));
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    } else {
      toast({
        variant: "destructive",
        title: "Ошибка валидации",
        description: (
            <div className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                Пожалуйста, заполните все обязательные поля.
            </div>
        ),
      });
    }
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
      return;
    }

    if (validateStep(3)) {
        setConfirmAstrakhanOpen(true);
    } else {
        toast({
            variant: "destructive",
            title: "Требуется согласие",
            description: (
                <div className="flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Вы должны дать согласие на обработку персональных данных.
                </div>
            ),
        });
    }
  };
  
  const handleConfirmSubmit = () => {
      // mutate(formData); // Temporarily disabled for debugging
      setShowJson(true);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let currentVal;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
        currentVal = checked;
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
        currentVal = value;
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: !currentVal }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: !value }));
    }
  };

  if (isSuccess) {
    return (
        <div className="text-center p-8">
            <Check className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Заявка успешно отправлена!</h3>
            <p className="text-gray-600 mb-6">Мы скоро с вами свяжемся. Спасибо за ваш интерес к нашей школе.</p>
            <Button onClick={() => setFormVisible(false)}>Закрыть</Button>
        </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(step / 3) * 100}%` }}></div>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-xl font-semibold">Шаг 1: Личная информация</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="lastName">Фамилия <RequiredAsterisk /></Label><Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className={cn({ 'border-red-500': errors.lastName })}/></div>
            <div><Label htmlFor="firstName">Имя <RequiredAsterisk /></Label><Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className={cn({ 'border-red-500': errors.firstName })}/></div>
            <div><Label htmlFor="middleName">Отчество</Label><Input id="middleName" name="middleName" value={formData.middleName} onChange={handleChange} /></div>
            <div><Label htmlFor="email">Email <RequiredAsterisk /></Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={cn({ 'border-red-500': errors.email })}/></div>
            <div><Label htmlFor="dateOfBirth">Дата рождения <RequiredAsterisk /></Label><Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} className={cn({ 'border-red-500': errors.dateOfBirth })} /></div>
            <div><Label htmlFor="phoneNumber">Номер телефона <RequiredAsterisk /></Label><Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+7 (999) 999-99-99" className={cn({ 'border-red-500': errors.phoneNumber })}/></div>
          </div>
          <div><Label htmlFor="vkProfile">Профиль ВКонтакте <RequiredAsterisk /></Label><Input id="vkProfile" name="vkProfile" value={formData.vkProfile} onChange={handleChange} placeholder="https://vk.com/your_profile" className={cn({ 'border-red-500': errors.vkProfile })}/></div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-xl font-semibold">Шаг 2: Ваш опыт и мотивация</h3>
          <div><Label>Туристический опыт <RequiredAsterisk /></Label><Select name="experience" onValueChange={(v) => handleSelectChange('experience', v)}><SelectTrigger className={cn({ 'border-red-500': errors.experience })}><SelectValue placeholder="Выберите ваш опыт" /></SelectTrigger><SelectContent>
              <SelectItem value="no_experience">Нет опыта</SelectItem>
              <SelectItem value="weekend_hikes">Ходил(а) в ПВД</SelectItem>
              <SelectItem value="categorized_hikes">Ходил(а) в категорийные походы</SelectItem>
              <SelectItem value="led_hikes">Руководил(а) походами</SelectItem>
          </SelectContent></Select></div>
          <div><Label>Проходили ли обучение в других школах? <RequiredAsterisk /></Label><Select name="previousSchool" onValueChange={(v) => handleSelectChange('previousSchool', v)}><SelectTrigger className={cn({ 'border-red-500': errors.previousSchool })}><SelectValue placeholder="Да/Нет" /></SelectTrigger><SelectContent>
              <SelectItem value="yes">Да</SelectItem>
              <SelectItem value="no">Нет</SelectItem>
          </SelectContent></Select></div>
          <div><Label>Откуда узнали о школе? <RequiredAsterisk /></Label><Select name="howHeard" onValueChange={(v) => handleSelectChange('howHeard', v)}><SelectTrigger className={cn({ 'border-red-500': errors.howHeard })}><SelectValue placeholder="Выберите источник" /></SelectTrigger><SelectContent>
              <SelectItem value="friends">От друзей</SelectItem>
              <SelectItem value="social_media">Социальные сети</SelectItem>
              <SelectItem value="search_engine">Поисковик (Яндекс, Google)</SelectItem>
              <SelectItem value="other">Другое</SelectItem>
          </SelectContent></Select></div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-xl font-semibold">Шаг 3: Заключительные вопросы</h3>
          <div><Label htmlFor="question">Что хотите получить от школы?</Label><Textarea id="question" name="question" value={formData.question} onChange={handleChange} placeholder="Например: научиться ходить в горы, стать инструктором, найти друзей..."/></div>
          <div><Label htmlFor="wishes">Вопрос к руководству школы (необязательно)</Label><Textarea id="wishes" name="wishes" value={formData.wishes} onChange={handleChange} /></div>

          <div className={cn("!mt-6 flex items-start space-x-3 p-3 rounded-lg", { 'bg-red-50 border border-red-200': errors.consent })}>
            <input type="checkbox" id="consent" name="consent" checked={formData.consent} onChange={handleChange} className="mt-1 h-4 w-4"/>
            <Label htmlFor="consent" className="text-sm text-gray-600">
              Я даю согласие на сбор и обработку своих персональных данных (в соответствии с требованиями статьи 9 Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных») <RequiredAsterisk />
            </Label>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        {step > 1 ? <Button type="button" variant="outline" onClick={handleBack}>Назад</Button> : <div />} 
        {step < 3 ? <Button type="button" onClick={handleNext}>Далее</Button> : <Button type="submit" disabled={isPending}>{isPending ? 'Отправка...' : 'Отправить заявку'}</Button>}
      </div>

      <AlertDialog open={isConfirmAstrakhanOpen} onOpenChange={setConfirmAstrakhanOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Подтверждение</AlertDialogTitle>
                  <AlertDialogDescription>
                      Набор в школу и все очные занятия проходят в городе <strong>Астрахань</strong>. Вы подтверждаете, что сможете присутствовать на занятиях?
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmSubmit}>Подтвердить и отправить</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showJson} onOpenChange={setShowJson}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Итоговые данные (JSON)</AlertDialogTitle>
                <AlertDialogDescription>
                    Это данные, которые будут отправлены на сервер.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md max-h-60 overflow-y-auto">
                <pre className="text-sm text-gray-900 dark:text-gray-100"><code>{JSON.stringify(formData, null, 2)}</code></pre>
            </div>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowJson(false)}>Закрыть</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </form>
  );
};

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const [isFormVisible, setFormVisible] = useState(false);

  const handleLogout = () => {
    console.log("Logout button clicked");
    logout();
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFormVisible(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (isAuthLoading || !user) {
    return <div className="container mx-auto px-4 py-24 text-center">Загрузка профиля...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Профиль пользователя</h1>
        <Button variant="destructive" onClick={handleLogout}>Выйти</Button>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm mb-8">
        <p><strong>Полное имя:</strong> {user.full_name}</p>
        <p><strong>Имя пользователя:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <div className="bg-white p-8 rounded-lg border shadow-sm text-center">
        <h2 className="text-2xl font-bold mb-4">Школа туризма</h2>
        <p className="mb-6 text-gray-600 max-w-xl mx-auto">Хотите повысить свою квалификацию, научиться новому и стать частью команды? Запишитесь в нашу школу!</p>
        <Button onClick={() => setFormVisible(true)}>Подать заявку на обучение</Button>
      </div>

      {isFormVisible && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold">Заявка на обучение</h2>
                <Button variant="ghost" size="icon" onClick={() => setFormVisible(false)}><X className="h-5 w-5"/></Button>
            </div>
            <div className="p-6 overflow-y-auto">
              <TourismSchoolForm user={user} setFormVisible={setFormVisible} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
