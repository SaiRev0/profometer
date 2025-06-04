import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Course Reviews',
  description:
    'Explore course reviews and ratings. Get insights from students about course content, difficulty, and professor teaching styles.',
  openGraph: {
    title: 'Course Reviews | ProfOMeter',
    description:
      'Explore course reviews and ratings. Get insights from students about course content, difficulty, and professor teaching styles.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Course Reviews - ProfOMeter',
        type: 'image/png'
      }
    ]
  },
  twitter: {
    title: 'Course Reviews | ProfOMeter',
    description:
      'Explore course reviews and ratings. Get insights from students about course content, difficulty, and professor teaching styles.',
    images: ['/opengraph-image.png']
  }
};

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
