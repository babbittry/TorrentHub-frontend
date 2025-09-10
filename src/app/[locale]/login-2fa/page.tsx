"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/api";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from 'next-intl';
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { addToast } from "@heroui/toast";

export default function Login2faPage() {
    const [code, setCode] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { usernameFor2fa, completeLogin } = useAuth();
    const router = useRouter();
    const t = useTranslations();

    useEffect(() => {
        // If the user lands here without a username, redirect them to the login page.
        if (!usernameFor2fa) {
            router.replace('/login');
        }
    }, [usernameFor2fa, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usernameFor2fa) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await auth.login2fa({ userName: usernameFor2fa, code });
            if (response.user && response.accessToken) {
                completeLogin(response.user, response.accessToken);
                router.push('/');
            } else {
                // This case should ideally not be reached if the API is consistent
                throw new Error("Invalid response from server.");
            }
        } catch (err) {
            setError(t('login2fa.login_failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendEmailCode = async () => {
        if (!usernameFor2fa) return;
        try {
            await auth.sendEmailCode({ userName: usernameFor2fa });
            addToast({
                title: t('login2fa.email_sent'),
                color: 'success'
            })
        } catch (err) {
            addToast({
                title: t('login2fa.error_sending_email'),
                color: 'danger'
            })
        }
    };
    
    // Render a loading state or null if we're about to redirect.
    if (!usernameFor2fa) {
        return null; 
    }

    return (
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-160px)]">
            <Card className="w-full max-w-md p-4">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="flex flex-col items-center pb-4">
                        <h1 className="text-3xl font-bold">{t('login2fa.title')}</h1>
                    </CardHeader>
                    <CardBody className="gap-6">
                         <p className="text-center text-sm text-default-500">{t('login2fa.enter_code')}</p>
                        <Input
                            isRequired
                            label={t('login2fa.code_placeholder')}
                            placeholder="123456"
                            value={code}
                            onValueChange={setCode}
                            size="lg"
                            labelPlacement="outside"
                            maxLength={6}
                        />
                        {error && <p className="text-danger text-center text-sm font-medium">{error}</p>}
                        <Button type="submit" color="primary" className="w-full font-bold text-lg" size="lg" isLoading={isLoading}>
                            {t('login2fa.submit_button')}
                        </Button>
                    </CardBody>
                </form>
                <CardFooter className="pt-4 flex-col items-center gap-2">
                    <p className="text-center text-default-500 text-sm">
                        {t('login2fa.no_app_code')}
                    </p>
                    <Button variant="ghost" color="primary" onPress={handleSendEmailCode}>
                        {t('login2fa.use_email')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}