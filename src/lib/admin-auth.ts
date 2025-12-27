import { authOptions } from './auth';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';

/**
 * Admin Authentication Types
 */
export interface AdminCheckResult {
  isAdmin: boolean;
  session: Session | null;
}

/**
 * Checks if the current user is an admin based on their email
 * @returns Promise<boolean> - true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn('ADMIN_EMAIL environment variable is not configured');
    return false;
  }

  return session.user.email.toLowerCase() === adminEmail.toLowerCase();
}

/**
 * Requires admin access - throws error if user is not admin
 * Use this in API routes to protect admin endpoints
 * @throws Error if user is not authenticated or not admin
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();

  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
}
