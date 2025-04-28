'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

export default function SignInPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to home page first, then show the modal
        router.replace('/');
        // Small delay to ensure the home page is loaded
        setTimeout(() => {
            router.push('/signin');
        }, 100);
    }, [router]);

    return null;
}
