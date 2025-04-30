import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Header from '@/components/layout/header';
import BottomNavigation from '@/components/layout/header/bottomNavigation';
import AuthProvider from '@/components/providers/session-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
  title: 'RateThatProf - Find & Rate Professors',
  description: 'Discover, rate, and review professors at your university'
};

interface RootLayoutProps {
  children: React.ReactNode;
  authModal: React.ReactNode;
}

export default function RootLayout({ children, authModal }: RootLayoutProps) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
              <div className='flex min-h-screen flex-col'>
                <Header />
                {authModal}
                <main className='container mx-auto flex-1 px-4 pt-16 pb-16 sm:px-6 md:pb-8'>{children}</main>
                <BottomNavigation />
              </div>
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
