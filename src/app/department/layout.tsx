import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Department Reviews',
  description:
    'Explore department ratings and reviews. Find detailed information about different academic departments, their faculty, and course offerings.',
  openGraph: {
    title: 'Department Reviews | ProfOMeter',
    description:
      'Explore department ratings and reviews. Find detailed information about different academic departments, their faculty, and course offerings.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Department Reviews - ProfOMeter',
        type: 'image/png'
      }
    ]
  },
  twitter: {
    title: 'Department Reviews | ProfOMeter',
    description:
      'Explore department ratings and reviews. Find detailed information about different academic departments, their faculty, and course offerings.',
    images: ['/opengraph-image.png']
  }
};

export default function DepartmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
