'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    id: "item-1",
    question: 'Как присоединиться к клубу?',
    answer: 'Чтобы присоединиться, просто зарегистрируйтесь на сайте и подайте заявку на участие в одном из наших походов. Мы всегда рады новым участникам!'
  },
  {
    id: "item-2",
    question: 'Какой уровень подготовки нужен для походов?',
    answer: 'У нас есть походы для любого уровня подготовки, от новичков до опытных туристов. Каждый маршрут имеет маркировку сложности.'
  },
  {
    id: "item-3",
    question: 'Какое снаряжение мне понадобится?',
    answer: 'Список необходимого снаряжения зависит от похода. Базовый список доступен на странице каждого похода. Мы также можем помочь с арендой.'
  },
  {
    id: "item-4",
    question: 'Безопасно ли это?',
    answer: 'Безопасность — наш главный приоритет. Все наши гиды — опытные инструкторы, а маршруты тщательно проработаны.'
  },
];

export function FaqSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Остались вопросы?</h2>
            <p className="text-muted-foreground mt-2">Здесь вы найдете ответы на самые популярные из них.</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqData.map((item) => (
            <AccordionItem value={item.id} key={item.id}>
              <AccordionTrigger className="text-lg text-left font-semibold hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}