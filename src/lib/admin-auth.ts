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
 * Checks if the current user is an admin based on their user ID
 * @returns Promise<boolean> - true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return false;
  }

  const adminId = process.env.ADMIN_ID;

  if (!adminId) {
    console.warn('ADMIN_ID environment variable is not configured');
    return false;
  }

  const userId = (session.user as { id: string }).id;
  return userId === adminId;
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
