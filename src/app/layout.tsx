import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import BottomNavigation from '@/components/layout/bottom-navigation';
import Header from '@/components/layout/header';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
    title: 'RateThatProf - Find & Rate Professors',
    description: 'Discover, rate, and review professors at your university'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en' suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
                    <div className='flex min-h-screen flex-col'>
                        <Header />
                        <main className='container mx-auto flex-1 px-4 pt-16 pb-16 sm:px-6 md:pb-8'>{children}</main>
                        <BottomNavigation />
                    </div>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
