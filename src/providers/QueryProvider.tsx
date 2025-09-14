'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // This setup prevents query errors from crashing the app, allowing components to handle errors locally.
        // For TanStack Query v4
        useErrorBoundary: false,
        // For TanStack Query v5+
        throwOnError: false,

        retry: (failureCount, error: any) => {
          // Do not retry on auth errors
          if (error.response?.status === 401) {
            return false;
          }
          // Retry other errors (like network issues) once
          return failureCount < 1;
        }
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}