import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

export function convertNumberToGrade(averageGradeNumber: number): string {
  if (averageGradeNumber >= 9.5) return 'A*';
  if (averageGradeNumber >= 9.0) return 'A';
  if (averageGradeNumber >= 8.5) return 'A-';
  if (averageGradeNumber >= 7.5) return 'B';
  if (averageGradeNumber >= 6.5) return 'B-';
  if (averageGradeNumber >= 5.5) return 'C';
  if (averageGradeNumber >= 4.5) return 'C-';
  if (averageGradeNumber >= 0.1) return 'F';
  return 'Z'; // For zero or negative values
}

export const gradeNumberMap: { [key: string]: number } = {
  'A*': 10,
  A: 10,
  'A-': 9,
  B: 8,
  'B-': 7,
  C: 6,
  'C-': 5,
  F: 0,
  Z: 0,
  S: 5,
  I: 0
};