
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createSchoolApplication } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  first_name: z.string().min(2, "Имя должно содержать минимум 2 символа."),
  last_name: z.string().min(2, "Фамилия должна содержать минимум 2 символа."),
  middle_name: z.string().optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Введите дату в формате ГГГГ-ММ-ДД"),
  email: z.string().email("Неверный формат email."),
  phone_number: z.string().min(10, "Номер телефона слишком короткий."),
  vk_profile: z.string().url("Введите корректную ссылку на профиль VK").optional().or(z.literal('')),
  experience: z.enum(['none', 'weekend_hikes', 'mountain_hikes', 'advanced'], { required_error: "Выберите ваш опыт." }),
  previous_school: z.enum(['yes', 'no'], { required_error: "Укажите, были ли вы в школе ранее." }),
  how_heard: z.enum(['friends', 'social_media', 'university', 'other'], { required_error: "Выберите источник." }),
  question: z.string().min(10, "Пожалуйста, расскажите подробнее."),
  wishes: z.string().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Вы должны дать согласие на обработку персональных данных." }) })
});

interface Props {
  onSuccess: () => void;
}

export default function ApplicationForm({ onSuccess }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      middle_name: "",
      date_of_birth: "",
      email: "",
      phone_number: "",
      vk_profile: "",
      experience: undefined,
      previous_school: undefined,
      how_heard: undefined,
      question: "",
      wishes: "",
      consent: false,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createSchoolApplication,
    onSuccess: (data) => {
      toast({ title: "Успех!", description: data.message });
      onSuccess();
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.response?.data?.message || "Не удалось отправить заявку", variant: "destructive" });
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values);
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Анкета для поступления в школу</CardTitle>
        <CardDescription>Заполните все поля, чтобы мы могли рассмотреть вашу кандидатуру.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField name="last_name" render={({ field }) => <FormItem><FormLabel>Фамилия</FormLabel><FormControl><Input placeholder="Иванов" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField name="first_name" render={({ field }) => <FormItem><FormLabel>Имя</FormLabel><FormControl><Input placeholder="Иван" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField name="middle_name" render={({ field }) => <FormItem><FormLabel>Отчество</FormLabel><FormControl><Input placeholder="Иванович" {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="date_of_birth" render={({ field }) => <FormItem><FormLabel>Дата рождения</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField name="phone_number" render={({ field }) => <FormItem><FormLabel>Номер телефона</FormLabel><FormControl><Input placeholder="+7..." {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="email" render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="email@example.com" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField name="vk_profile" render={({ field }) => <FormItem><FormLabel>Профиль ВКонтакте</FormLabel><FormControl><Input placeholder="https://vk.com/durov" {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ваш туристический опыт?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Выберите уровень..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">Никогда не был(а) в походах</SelectItem>
                      <SelectItem value="weekend_hikes">Ходил(а) в походы выходного дня</SelectItem>
                      <SelectItem value="mountain_hikes">Есть опыт горных походов</SelectItem>
                      <SelectItem value="advanced">Опытный турист</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="previous_school"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Вы уже были в нашей школе в прошлые года?</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Выберите..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Да</SelectItem>
                      <SelectItem value="no">Нет</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="how_heard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Откуда вы о нас узнали?</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Выберите источник..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="friends">От друзей</SelectItem>
                      <SelectItem value="social_media">Соцсети (VK, Telegram)</SelectItem>
                       <SelectItem value="university">В университете (плакаты, знакомые)</SelectItem>
                      <SelectItem value="other">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField name="question" render={({ field }) => <FormItem><FormLabel>Чему вы хотите научиться в школе?</FormLabel><FormControl><Textarea placeholder="Например: научиться работать с веревкой, ходить в горы, найти команду..." {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField name="wishes" render={({ field }) => <FormItem><FormLabel>Вопросы и пожелания</FormLabel><FormControl><Textarea placeholder="Если у вас есть вопросы, задайте их здесь" {...field} /></FormControl><FormMessage /></FormItem>} />

            <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>Я даю согласие на обработку персональных данных</FormLabel>
                            <FormDescription>
                                Нажимая “Отправить”, вы соглашаетесь с нашей политикой конфиденциальности.
                            </FormDescription>
                             <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <Button type="submit" disabled={isPending}>{isPending ? "Отправка..." : "Отправить заявку"}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
