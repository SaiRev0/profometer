import { db } from './db';
import { generateUsername as generateUniqueUsername } from 'unique-username-generator';

/**
 * Generates a unique username using the unique-username-generator package.
 * Ensures uniqueness by checking against existing usernames in the database.
 */
export async function generateUsername(): Promise<string> {
  let username: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate a username with adjective + noun + 3 random digits
    username = generateUniqueUsername('_', 3);

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
    username = `${generateUniqueUsername('_', 3)}_${Date.now()}`;
  }

  return username!;
}

/**
 * API endpoint helper to generate a new random username for preview.
 * Used during signup flow for "generate new username" button.
 */
export function generatePreviewUsername(): string {
  return generateUniqueUsername('_', 3);
}
