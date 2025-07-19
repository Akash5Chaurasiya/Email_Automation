'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    // Redirect to login page on load
    router.push('/login');

    return null; // No UI needed for redirect
}