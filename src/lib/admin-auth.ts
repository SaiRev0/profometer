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
 * Checks if a given user ID is an admin
 * Supports multiple comma-separated admin IDs in ADMIN_ID environment variable
 * @param userId - The user ID to check
 * @returns boolean - true if user is admin, false otherwise
 */
export function isAdminUser(userId: string): boolean {
  const adminIds = process.env.ADMIN_ID;

  if (!adminIds) {
    console.warn('ADMIN_ID environment variable is not configured');
    return false;
  }

  // Split by comma, trim whitespace, and check if userId is in the list
  const adminIdList = adminIds.split(',').map((id) => id.trim());
  return adminIdList.includes(userId);
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

  const userId = (session.user as { id: string }).id;
  return isAdminUser(userId);
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
