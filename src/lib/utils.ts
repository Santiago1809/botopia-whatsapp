import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string to a localized format
 * @param dateString - The date string to format
 * @returns Formatted date string in Spanish format
 */
export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats a number to a currency string
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., 'USD', 'EUR')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a currency amount to a compact format with K/M/B suffixes
 * @param amount - The amount to format
 * @param currency - The currency code
 * @returns Formatted compact currency string
 */
export function formatCompactCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}
