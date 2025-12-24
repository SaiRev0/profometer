import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import BottomNavigation from '@/components/layout/BottomNavigation';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import ProgressBarProvider from '@/components/providers/progressBar-provider';
import QueryProviders from '@/components/providers/query-providers';
import SessionProvider from '@/components/providers/session-provider';
import ThemeProvider from '@/components/providers/theme-provider';
import { UsernameGuard } from '@/components/providers/username-guard';
import { Toaster } from '@/components/ui/sonner';
import { SearchProvider } from '@/contexts/SearchContext';
import { Analytics } from '@vercel/analytics/next';

import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://profometer.com'),
  title: {
    default: 'ProfOMeter - Rate and Review Your Professors',
    template: '%s | ProfOMeter'
  },
  description:
    'Find and share professor ratings, reviews, and course information. Make informed decisions about your courses and professors.',
  keywords: ['professor ratings', 'course reviews', 'university professors', 'academic reviews', 'professor reviews'],
  authors: [{ name: 'Saiyam Jain' }],
  creator: 'Saiyam Jain',
  publisher: 'Saiyam Jain',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'ProfOMeter - Rate and Review Your Professors',
    description: 'Find and share professor ratings, reviews, and course information.',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://profometer.com',
    siteName: 'ProfOMeter',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'ProfOMeter',
        type: 'image/png'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProfOMeter - Rate and Review Your Professors',
    description: 'Find and share professor ratings, reviews, and course information.',
    images: ['/opengraph-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true
};

interface RootLayoutProps {
  children: React.ReactNode;
  authModal: React.ReactNode;
}

export default function RootLayout({ children, authModal }: RootLayoutProps) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <QueryProviders>
          <SessionProvider>
            <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
              <ProgressBarProvider>
                <SearchProvider>
                  <UsernameGuard>
                    <div className='flex min-h-screen flex-col'>
                      <Header />
                      {authModal}
                      <main className='container mx-auto flex-1 px-4 pt-16 pb-16 sm:px-6 md:pb-8'>{children}</main>
                      <Footer />
                      <BottomNavigation />
                      <Analytics />
                    </div>
                    <Toaster richColors position='top-right' closeButton />
                  </UsernameGuard>
                </SearchProvider>
              </ProgressBarProvider>
            </ThemeProvider>
          </SessionProvider>
        </QueryProviders>
      </body>
    </html>
  );
}
