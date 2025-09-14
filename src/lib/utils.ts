import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateRange(startDateStr: string, endDateStr: string): string {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return ''; // Return empty string if dates are invalid
  }

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const yearFormat: Intl.DateTimeFormatOptions = { year: 'numeric' };

  const start = startDate.toLocaleDateString('ru-RU', options);
  const end = endDate.toLocaleDateString('ru-RU', options);
  const year = endDate.toLocaleDateString('ru-RU', yearFormat);

  return `${start} - ${end} ${year}`.replace(/\./g, '');
}