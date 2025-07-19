'use client';
import { useState, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { FileUp } from 'lucide-react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

export default function EmailSender() {
    const [file, setFile] = useState<File | null>(null);
    const [subject, setSubject] = useState<string>('');
    const [body, setBody] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
        } else {
            setAccessToken(token);
        }
    }, [router]);

    const uploadFile = async () => {
        if (!file) {
            toast.error('Please select a file first.');
            return;
        }

        try {
            setLoading(true);
            const metadata = { name: file.name, mimeType: file.type };
            const fileData = await file.arrayBuffer();
            const fileContent = btoa(String.fromCharCode(...new Uint8Array(fileData)));

            const multipartBody =
                `--boundary123\r\n` +
                `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
                `${JSON.stringify(metadata)}\r\n` +
                `--boundary123\r\n` +
                `Content-Type: ${file.type}\r\n` +
                `Content-Transfer-Encoding: base64\r\n\r\n` +
                `${fileContent}\r\n` +
                `--boundary123--`;

            const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/related; boundary=boundary123',
                },
                body: multipartBody,
            });

            if (!uploadResponse.ok) throw new Error('Drive upload failed.');

            const uploaded = await uploadResponse.json();
            const fileId = uploaded.id;


            const scriptResponse = await axios.post(
                process.env.NEXT_PUBLIC_SCRIPT_URL as string,
                { fileId, subject, body },
                { headers: { 'Content-Type': 'application/json' } }
            );

            console.log(scriptResponse, 'scriptResponse', scriptResponse.data);
            if (!scriptResponse.data) throw new Error('Script execution failed.');
            toast.success(scriptResponse.data);
            setLoading(false);
        } catch (err: any) {
            toast.error(err.message || 'Upload failed.');
            setLoading(false);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    if (!accessToken) return null;

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-xl shadow-2xl">
                <CardContent className="p-6 space-y-6">
                    <h1 className="text-2xl font-bold text-center">📧 Email Sender</h1>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium">Upload Excel File</span>
                        <Input type="file" accept=".xlsx" onChange={handleFileChange} className="cursor-pointer" icon={<FileUp />} />
                    </label>

                    <Input
                        placeholder="Email Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />

                    <Textarea
                        placeholder="Email Body (you can use ${name})"
                        rows={6}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />

                    <Button onClick={uploadFile} className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                        {loading ? 'Sending...' : 'Upload and Send'}
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
