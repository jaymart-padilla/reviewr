import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeSearchParam(url?: string | string[]): string | undefined {
  return Array.isArray(url) ? url[0] : url;
}
