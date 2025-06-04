import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Profile',
  description:
    'Manage your ProfOMeter profile, view your reviews, and track your contributions to the academic community.',
  openGraph: {
    title: 'User Profile | ProfOMeter',
    description:
      'Manage your ProfOMeter profile, view your reviews, and track your contributions to the academic community.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'User Profile - ProfOMeter',
        type: 'image/png'
      }
    ]
  },
  twitter: {
    title: 'User Profile | ProfOMeter',
    description:
      'Manage your ProfOMeter profile, view your reviews, and track your contributions to the academic community.',
    images: ['/opengraph-image.png']
  }
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
