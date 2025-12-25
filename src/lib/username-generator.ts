import { db } from './db';
import { generateUsername as generateUniqueUsername } from 'unique-username-generator';

interface UsernameOptions {
  includeNumbers?: boolean;
  useHyphens?: boolean;
  noSeparator?: boolean;
}

/**
 * Generates a unique username using the unique-username-generator package.
 * Ensures uniqueness by checking against existing usernames in the database.
 */
export async function generateUsername(options: UsernameOptions = {}): Promise<string> {
  const { includeNumbers = true, useHyphens = false, noSeparator = false } = options;
  let username: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate a username with adjective + noun + optional digits
    const separator = noSeparator ? '' : useHyphens ? '-' : '_';
    const digitCount = includeNumbers ? 3 : 0;
    username = generateUniqueUsername(separator, digitCount);

    // Check if username exists in database
    const existingUser = await db.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!existingUser) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    // Fallback: add timestamp to ensure uniqueness
    const separator = noSeparator ? '' : useHyphens ? '-' : '_';
    const digitCount = includeNumbers ? 3 : 0;
    username = `${generateUniqueUsername(separator, digitCount)}${separator || '_'}${Date.now()}`;
  }

  return username!;
}

/**
 * API endpoint helper to generate a new random username for preview.
 * Used during signup flow for "generate new username" button.
 */
export function generatePreviewUsername(options: UsernameOptions = {}): string {
  const { includeNumbers = true, useHyphens = false, noSeparator = false } = options;
  const separator = noSeparator ? '' : useHyphens ? '-' : '_';
  const digitCount = includeNumbers ? 3 : 0;
  return generateUniqueUsername(separator, digitCount);
}
