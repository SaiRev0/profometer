import { redirect } from 'next/navigation';

import { isAdmin } from '@/lib/admin-auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check if user is admin
  const admin = await isAdmin();

  // Redirect non-admin users to home page
  if (!admin) {
    redirect('/');
  }

  return (
    <div className='bg-background min-h-screen'>
      <main>{children}</main>
    </div>
  );
}
