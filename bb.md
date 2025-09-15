# Решения для прижатого футера

## Проблема
Футер виден на пол страницы если на ней мало контента. Нужно прижать футер к низу страницы.

## Решение 1: Flexbox с min-height (Рекомендуемое)

### Описание
Обернуть приложение в flex-контейнер и задать футеру возможность прижиматься к низу страницы.

### Код
```tsx
// В вашем главном layout компоненте (например app/layout.tsx или pages/_app.tsx)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="flex flex-col min-h-screen">
        <Header />
        
        {/* Основной контент с flex-grow для заполнения доступного пространства */}
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
        <AuthModal />
        <Toaster />
      </body>
    </html>
  );
}

// Альтернативный вариант, если у вас другая структура:
function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
```

## Решение 2: CSS Grid (альтернативный вариант)

### Описание
Использование CSS Grid для создания макета с прижатым футером.

### Код
```tsx
// Вариант с CSS Grid
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="grid min-h-screen" style={{gridTemplateRows: 'auto 1fr auto'}}>
        <Header />
        
        <main>
          {children}
        </main>
        
        <Footer />
        <AuthModal />
        <Toaster />
      </body>
    </html>
  );
}

// Или с использованием Tailwind классов:
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="grid min-h-screen grid-rows-[auto_1fr_auto]">
        <Header />
        
        <main>
          {children}
        </main>
        
        <Footer />
        <AuthModal />
        <Toaster />
      </body>
    </html>
  );
}
```

## Дополнительные соображения

### 1. Учет fixed header
Если ваш Header имеет `position: fixed`, то добавьте отступ сверху для main:

```tsx
<main className="flex-grow pt-16"> {/* или другое значение в зависимости от высоты header */}
  {children}
</main>
```

### 2. Минимальная высота для контента
Если нужно, чтобы контент всегда занимал минимальную высоту:

```tsx
<main className="flex-grow min-h-[50vh]">
  {children}
</main>
```

## Рекомендация

Советую использовать **Решение 1 с Flexbox**, так как оно:
- Простое в реализации
- Хорошо поддерживается всеми браузерами  
- Легко настраивается
- Интуитивно понятное

## Применение

Примените выбранное решение к вашему основному layout компоненту, и футер будет всегда находиться внизу страницы, независимо от количества контента!

## Ключевые классы Tailwind

- `min-h-screen` - минимальная высота равна высоте viewport
- `flex flex-col` - вертикальный flexbox
- `flex-grow` - элемент растягивается и заполняет доступное пространство
- `grid min-h-screen grid-rows-[auto_1fr_auto]` - grid с тремя рядами: автоматический, растягивающийся, автоматический