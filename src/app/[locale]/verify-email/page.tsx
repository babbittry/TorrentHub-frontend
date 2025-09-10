"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';

function VerifyEmailComponent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations();
    const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('failed');
            setError('No verification token found.');
            return;
        }

        const verify = async () => {
            try {
                await auth.verifyEmail(token);
                setStatus('success');
            } catch (err: unknown) {
                setStatus('failed');
                setError((err as Error).message || t('verifyEmail.failed'));
            }
        };

        verify();
    }, [searchParams, t]);

    const renderContent = () => {
        switch (status) {
            case 'verifying':
                return <p>{t('verifyEmail.verifying')}</p>;
            case 'success':
                return (
                    <div className="text-center">
                        <p className="text-success text-lg mb-4">{t('verifyEmail.success')}</p>
                        <Button color="primary" onPress={() => router.push('/login')}>
                            {t('verifyEmail.back_to_login')}
                        </Button>
                    </div>
                );
            case 'failed':
                return (
                    <div className="text-center">
                        <p className="text-danger text-lg mb-4">{error || t('verifyEmail.failed')}</p>
                        <Button color="primary" onPress={() => router.push('/login')}>
                            {t('verifyEmail.back_to_login')}
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-160px)]">
            <Card className="w-full max-w-md p-4">
                <CardHeader className="flex flex-col items-center pb-4">
                    <h1 className="text-3xl font-bold">{t('verifyEmail.title')}</h1>
                </CardHeader>
                <CardBody className="gap-6 flex justify-center">
                    {renderContent()}
                </CardBody>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailComponent />
        </Suspense>
    );
}