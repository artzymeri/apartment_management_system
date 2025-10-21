import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format as dateFnsFormat } from "date-fns";
import { sq } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Albanian date formatting utilities
export function formatDate(
  date: Date | string,
  formatStr: string = "dd/MM/yyyy"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateFnsFormat(dateObj, formatStr, { locale: sq });
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateFnsFormat(dateObj, "dd/MM/yyyy HH:mm", { locale: sq });
}

export function formatMonthYear(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateFnsFormat(dateObj, "MMMM yyyy", { locale: sq });
}

export function formatShortDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateFnsFormat(dateObj, "dd/MM/yyyy", { locale: sq });
}
