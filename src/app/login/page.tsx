'use client';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Lottie from 'lottie-react';

export default function Login() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) router.push('/email-sender');
    }, [router]);

    const login = useGoogleLogin({
        scope: 'https://www.googleapis.com/auth/drive.file',
        //@typescript-eslint/no-explicit-any
        onSuccess: (tokenResponse: any) => {
            const accessToken = tokenResponse.access_token;
            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
                router.push('/email-sender');
            } else {
                setError('Authentication failed: No access token received');
                toast.error('No access token received');
            }
        },
        //@typescript-eslint/no-explicit-any
        onError: (error: any) => {
            const message = 'Login failed: ' + error;
            setError(message);
            toast.error(message);
        },
    });

    return (
        <main className="min-h-screen flex flex-col md:flex-row items-center justify-around bg-gradient-to-b from-white to-gray-100 p-6 gap-6">
            <div className="hidden md:block w-full max-w-lg">
                <Lottie animationData={require('../../../public/lotties/social-media-influencer.json')} loop autoplay />
            </div>
            <div className="hidden md:flex  max-w-6xl shadow-xl rounded-2xl overflow-hidden border h-[90vh]" />
            <Card className="w-full max-w-sm rounded-2xl border shadow-xl">
                <CardContent className="p-8 space-y-6 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">🔐 Gmail Automation</h1>
                    <p className="text-muted-foreground text-sm">Securely login with Google to continue</p>

                    <Button
                        onClick={() => {
                            setLoading(true);
                            login();
                        }}
                        className="bg-[#4285F4] hover:bg-[#357ae8] text-white w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                                    <g fillRule="evenodd">
                                        <path d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.54C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" fill="#EA4335" />
                                        <path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4" />
                                        <path d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" fill="#FBBC05" />
                                        <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z" fill="#34A853" />
                                        <path fill="none" d="M0 0h18v18H0z" />
                                    </g>
                                </svg>
                                Sign in with Google
                            </div>
                        )}
                    </Button>

                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                </CardContent>
            </Card>
        </main>
    );
}
