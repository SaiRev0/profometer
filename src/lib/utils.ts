import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

/**
 * Safely rounds a number to 1 decimal place, handling floating-point precision issues
 * Uses intelligent rounding to snap to clean decimals when very close
 */
export const safeRound = (value: number, decimals: number = 1): number => {
  if (!Number.isFinite(value)) return 0;

  const multiplier = Math.pow(10, decimals);
  const scaled = value * multiplier;

  // Check if we're very close to a whole number (within 0.001)
  const rounded = Math.round(scaled);
  const diff = Math.abs(scaled - rounded);

  if (diff < 0.001) {
    return rounded / multiplier;
  }

  // For cases like 3.05 that should be 3.0, intelligently snap to cleaner values
  const fractional = scaled - Math.floor(scaled);

  // If very close to .0, snap down
  if (Math.abs(fractional - 0.0) < 0.1) {
    return Math.floor(scaled) / multiplier;
  }

  // If close to .5 but should round down (like 3.05 → 3.0), favor the lower value
  if (Math.abs(fractional - 0.5) < 0.1) {
    // Use banker's rounding (round half to even) to be more predictable
    const floor = Math.floor(scaled);
    if (floor % 2 === 0) {
      return floor / multiplier; // Round down to even
    } else {
      return (floor + 1) / multiplier; // Round up to even
    }
  }

  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
};

/**
 * Safely clamps a value between min and max with proper rounding
 */
export const safeClamp = (value: number, min: number, max: number, decimals: number = 1): number => {
  const rounded = safeRound(value, decimals);
  return Math.max(min, Math.min(max, rounded));
};

/**
 * Safely calculates a new average when adding a value
 */
export const calculateNewAverage = (currentAverage: number, currentCount: number, newValue: number): number => {
  if (currentCount === 0) return safeRound(newValue);
  if (!Number.isFinite(currentAverage) || !Number.isFinite(newValue)) return 0;

  const newCount = currentCount + 1;
  const newAverage = (currentAverage * currentCount + newValue) / newCount;
  return safeClamp(newAverage, 0, 5);
};

/**
 * Safely calculates a new average when removing a value
 * Uses higher precision to minimize cumulative rounding errors
 */
export const calculateAverageAfterRemoval = (
  currentAverage: number,
  currentCount: number,
  removedValue: number
): number => {
  if (currentCount <= 1) return 0;
  if (!Number.isFinite(currentAverage) || !Number.isFinite(removedValue)) return 0;

  const newCount = currentCount - 1;

  // Use higher precision for intermediate calculations
  const totalSum = Math.round(currentAverage * currentCount * 1000) / 1000;
  const newSum = totalSum - removedValue;

  // Calculate with extra precision, then use intelligent rounding
  const newAverage = newSum / newCount;
  const roundedAverage = safeRound(newAverage, 1);

  return Math.max(0, Math.min(5, roundedAverage));
};

/**
 * Safely calculates a new average when updating a value (edit operation)
 * Uses higher precision to minimize cumulative rounding errors
 */
export const calculateUpdatedAverage = (
  currentAverage: number,
  currentCount: number,
  oldValue: number,
  newValue: number
): number => {
  if (currentCount === 0) return safeRound(newValue);
  if (!Number.isFinite(currentAverage) || !Number.isFinite(oldValue) || !Number.isFinite(newValue)) return 0;

  // Use higher precision for intermediate calculations
  const totalSum = Math.round(currentAverage * currentCount * 1000) / 1000;
  const newSum = totalSum - oldValue + newValue;
  const newAverage = newSum / currentCount;
  const roundedAverage = safeRound(newAverage, 1);

  return Math.max(0, Math.min(5, roundedAverage));
};

/**
 * Safely calculates a new percentage when adding a value
 */
export const calculateNewPercentage = (
  currentPercentage: number,
  currentCount: number,
  newValue: number,
  isDecimal: boolean = false
): number => {
  if (currentCount === 0) return safeClamp(newValue * (isDecimal ? 100 : 1), 0, 100);
  if (!Number.isFinite(currentPercentage) || !Number.isFinite(newValue)) return 0;

  const newCount = currentCount + 1;
  const newPercentage = (currentPercentage * currentCount + newValue * (isDecimal ? 100 : 1)) / newCount;
  return safeClamp(newPercentage, 0, 100);
};

/**
 * Safely calculates a new percentage when removing a value
 * Uses higher precision to minimize cumulative rounding errors
 */
export const calculatePercentageAfterRemoval = (
  currentPercentage: number,
  currentCount: number,
  removedValue: number,
  isDecimal: boolean = false
): number => {
  if (currentCount <= 1) return 0;
  if (!Number.isFinite(currentPercentage) || !Number.isFinite(removedValue)) return 0;

  const newCount = currentCount - 1;

  // Use higher precision for intermediate calculations
  const totalSum = Math.round(currentPercentage * currentCount * 1000) / 1000;
  const newSum = totalSum - removedValue * (isDecimal ? 100 : 1);
  const newPercentage = newSum / newCount;
  const roundedPercentage = safeRound(newPercentage, 1);

  return Math.max(0, Math.min(100, roundedPercentage));
};

/**
 * Safely calculates a new percentage when updating a value (edit operation)
 * Uses higher precision to minimize cumulative rounding errors
 */
export const calculateUpdatedPercentage = (
  currentPercentage: number,
  currentCount: number,
  oldValue: number,
  newValue: number,
  isDecimal: boolean = false
): number => {
  if (currentCount === 0) return safeClamp(newValue * (isDecimal ? 100 : 1), 0, 100);
  if (!Number.isFinite(currentPercentage) || !Number.isFinite(oldValue) || !Number.isFinite(newValue)) return 0;

  // Use higher precision for intermediate calculations
  const totalSum = Math.round(currentPercentage * currentCount * 1000) / 1000;
  const newSum = totalSum - oldValue * (isDecimal ? 100 : 1) + newValue * (isDecimal ? 100 : 1);
  const newPercentage = newSum / currentCount;
  const roundedPercentage = safeRound(newPercentage, 1);

  return Math.max(0, Math.min(100, roundedPercentage));
};

/**
 * Safely calculates a new grade average when adding a grade
 */
export const calculateNewGradeAverage = (currentGrade: string, currentCount: number, newGrade: string): string => {
  if (currentCount === 0 || currentGrade === 'NA') return newGrade;

  const currentGradeNumber = gradeNumberMap[currentGrade] || 0;
  const newGradeNumber = gradeNumberMap[newGrade] || 0;

  const newCount = currentCount + 1;
  const newAverageNumber = (currentGradeNumber * currentCount + newGradeNumber) / newCount;
  return convertNumberToGrade(newAverageNumber);
};

/**
 * Safely calculates a new grade average when removing a grade
 */
export const calculateGradeAverageAfterRemoval = (
  currentGrade: string,
  currentCount: number,
  removedGrade: string
): string => {
  if (currentCount <= 1 || currentGrade === 'NA') return 'NA';

  const currentGradeNumber = gradeNumberMap[currentGrade] || 0;
  const removedGradeNumber = gradeNumberMap[removedGrade] || 0;

  const newCount = currentCount - 1;
  const totalSum = currentGradeNumber * currentCount;
  const newSum = totalSum - removedGradeNumber;
  const newAverageNumber = newSum / newCount;
  return convertNumberToGrade(newAverageNumber);
};

/**
 * Safely calculates a new grade average when updating a grade (edit operation)
 */
export const calculateUpdatedGradeAverage = (
  currentGrade: string,
  currentCount: number,
  oldGrade: string | null,
  newGrade: string | null
): string => {
  if (currentCount === 0) return newGrade || 'NA';
  if (currentGrade === 'NA') return newGrade || 'NA';

  const currentGradeNumber = gradeNumberMap[currentGrade] || 0;
  const totalSum = currentGradeNumber * currentCount;

  let newSum = totalSum;
  let newCount = currentCount;

  // Remove old grade if it exists
  if (oldGrade && gradeNumberMap[oldGrade] !== undefined) {
    newSum -= gradeNumberMap[oldGrade];
    newCount -= 1;
  }

  // Add new grade if it exists
  if (newGrade && gradeNumberMap[newGrade] !== undefined) {
    newSum += gradeNumberMap[newGrade];
    newCount += 1;
  }

  if (newCount === 0) return 'NA';

  const newAverageNumber = newSum / newCount;
  return convertNumberToGrade(newAverageNumber);
};

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
