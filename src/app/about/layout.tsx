import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About ProfOMeter',
  description:
    'Learn about ProfOMeter - the platform helping students make informed decisions about their courses and professors through honest reviews and ratings.',
  openGraph: {
    title: 'About ProfOMeter | Your Guide to Professor Ratings',
    description:
      'Learn about ProfOMeter - the platform helping students make informed decisions about their courses and professors through honest reviews and ratings.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'About ProfOMeter',
        type: 'image/png'
      }
    ]
  },
  twitter: {
    title: 'About ProfOMeter | Your Guide to Professor Ratings',
    description:
      'Learn about ProfOMeter - the platform helping students make informed decisions about their courses and professors through honest reviews and ratings.',
    images: ['/opengraph-image.png']
  }
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
