import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professor Profiles',
  description:
    'Browse and rate professor profiles. Find detailed information about professors, their teaching styles, and student reviews.',
  openGraph: {
    title: 'Professor Profiles | ProfOMeter',
    description:
      'Browse and rate professor profiles. Find detailed information about professors, their teaching styles, and student reviews.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Professor Profiles - ProfOMeter',
        type: 'image/png'
      }
    ]
  },
  twitter: {
    title: 'Professor Profiles | ProfOMeter',
    description:
      'Browse and rate professor profiles. Find detailed information about professors, their teaching styles, and student reviews.',
    images: ['/opengraph-image.png']
  }
};

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
