"use client";

import { useState } from "react";
import { auth } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import StepIndicator from "../components/StepIndicator";
import { addToast } from "@heroui/toast";

export default function LoginPage() {
    const [step, setStep] = useState(1);
    const [userName, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [code, setCode] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const authContext = useAuth();
    const router = useRouter();
    const t = useTranslations();

    const handleLoginStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const result = await authContext.login({ userName, password });
            if (result.requiresTwoFactor) {
                setStep(2);
            } else {
                router.push('/');
            }
        } catch (err: unknown) {
            setError((err as Error).message || t('loginPage.failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await auth.login2fa({ userName, code });
            if (response.user && response.accessToken) {
                authContext.completeLogin(response.user, response.accessToken);
                router.push('/');
            } else {
                throw new Error("Invalid response from server.");
            }
        } catch (err) {
            setError(t('login2fa.login_failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendEmailCode = async () => {
        try {
            await auth.sendEmailCode({ userName });
            addToast({
                title: t('login2fa.email_sent'),
                color: 'success'
            });
        } catch (err) {
            addToast({
                title: t('login2fa.error_sending_email'),
                color: 'danger'
            });
        }
    };
    
    const stepTitles = [
        t('loginPage.steps.credentials'),
        t('loginPage.steps.verification')
    ];

    return (
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-160px)]">
            <Card className="w-full max-w-md p-4">
                <CardHeader className="flex flex-col items-center pb-4">
                    <h1 className="text-3xl font-bold">{t('header.login')}</h1>
                    <div className="mt-4 w-full">
                        <StepIndicator currentStep={step} totalSteps={2} stepTitles={stepTitles} />
                    </div>
                </CardHeader>

                {step === 1 && (
                    <form onSubmit={handleLoginStep1}>
                        <CardBody className="gap-6">
                            <Input
                                isRequired
                                label={t('common.username')}
                                placeholder={t('loginPage.enter_your_username')}
                                value={userName}
                                onValueChange={setUserName}
                                size="lg"
                                labelPlacement="outside"
                            />
                            <Input
                                isRequired
                                label={t('common.password')}
                                placeholder={t('loginPage.enter_your_password')}
                                type="password"
                                value={password}
                                onValueChange={setPassword}
                                size="lg"
                                labelPlacement="outside"
                            />
                            {error && <p className="text-danger text-center text-sm font-medium">{error}</p>}
                            <Button type="submit" color="primary" className="w-full font-bold text-lg" size="lg" isLoading={isLoading}>
                                {t('common.next_step')}
                            </Button>
                        </CardBody>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleLoginStep2}>
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
                             <div className="flex flex-col items-center gap-2 mt-2">
                                <p className="text-center text-default-500 text-sm">
                                    {t('login2fa.no_app_code')}
                                </p>
                                <Button variant="ghost" color="primary" onPress={handleSendEmailCode}>
                                    {t('login2fa.use_email')}
                                </Button>
                            </div>
                        </CardBody>
                    </form>
                )}

                <CardFooter className="pt-4">
                    <p className="text-center text-default-500 text-sm w-full">
                        {t('loginPage.no_account_yet')}{' '}
                        <Link href="/register" className="text-primary hover:underline font-semibold">
                            {t('header.register')}
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
