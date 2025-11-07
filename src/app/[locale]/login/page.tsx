"use client";

import { useState } from "react";
import { auth } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import StepIndicator from "../components/StepIndicator";
import { toast } from "sonner";

export default function LoginPage() {
    const [step, setStep] = useState(1);
    const [userNameOrEmail, setUserNameOrEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [code, setCode] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [needsVerification, setNeedsVerification] = useState<boolean>(false);
    const authContext = useAuth();
    const router = useRouter();
    const t = useTranslations();

    const handleLoginStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setNeedsVerification(false);

        try {
            const result = await authContext.login({ userNameOrEmail, password });

            // Handle inconsistent API response: EmailNotVerified might only return a message.
            if (result.result === undefined && result.message && result.message.includes("verify your email")) {
                setNeedsVerification(true);
                setIsLoading(false);
                return; // Exit early
            }

            // Normalize result to string if it's a number from a C# enum
            let resultType: string | number | undefined = result.result;
            if (typeof resultType === 'number') {
                const resultMap = ['Success', 'InvalidCredentials', 'EmailNotVerified', 'Banned', 'RequiresTwoFactor'];
                resultType = resultMap[resultType];
            }

            switch (resultType) {
                case 'Success':
                    router.push('/');
                    break;
                case 'RequiresTwoFactor':
                    setStep(2);
                    break;
                case 'EmailNotVerified':
                    setNeedsVerification(true);
                    break;
                case 'InvalidCredentials':
                    setError(t('loginPage.invalid_credentials'));
                    break;
                case 'Banned':
                    setError(t('loginPage.account_banned'));
                    break;
                default:
                    setError(result.message || t('loginPage.unknown_error'));
                    break;
            }
        } catch (err) {
            setError(t('loginPage.unknown_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await auth.login2fa({ userName: userNameOrEmail, code });
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
            await auth.sendEmailCode({ userName: userNameOrEmail });
            toast.success(t('login2fa.email_sent'));
        } catch (err) {
            toast.error(t('login2fa.error_sending_email'));
        }
    };

    const handleResendVerification = async () => {
        if (!userNameOrEmail) {
            toast.warning(t('loginPage.enter_username_or_email_for_verification'));
            return;
        }
        try {
            await auth.resendVerification({ userNameOrEmail: userNameOrEmail });
            toast.success(t('loginPage.verification_sent_success'));
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const error = err as any;
            const errorMessage = error.response?.data?.message || t('loginPage.verification_sent_failed');
            toast.error(errorMessage);
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
                    <CardTitle>{t('header.login')}</CardTitle>
                    <div className="mt-4 w-full">
                        <StepIndicator currentStep={step} totalSteps={2} stepTitles={stepTitles} />
                    </div>
                </CardHeader>

                {step === 1 && (
                    <form onSubmit={handleLoginStep1}>
                        <CardContent className="space-y-4">
                            <FormField
                                label={t('common.username')}
                                placeholder={t('loginPage.enter_your_username_or_email')}
                                value={userNameOrEmail}
                                onChange={(e) => setUserNameOrEmail(e.target.value)}
                                required
                            />
                            <FormField
                                label={t('common.password')}
                                placeholder={t('loginPage.enter_your_password')}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {error && <p className="text-destructive text-center text-sm font-medium">{error}</p>}
                            {needsVerification && (
                                <div className="text-center text-sm font-medium text-yellow-500 p-2 rounded-md border border-yellow-500 bg-yellow-500/10 flex flex-col items-center gap-2">
                                    <p>{t('loginPage.email_verification_needed')}</p>
                                    <Button variant="ghost" size="sm" onClick={handleResendVerification}>
                                        {t('loginPage.resend_verification_email')}
                                    </Button>
                                </div>
                            )}
                            <Button type="submit" className="w-full font-bold text-lg" disabled={isLoading}>
                                {isLoading ? t('common.loading') : t('common.next_step')}
                            </Button>
                        </CardContent>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleLoginStep2}>
                        <CardContent className="space-y-4">
                            <p className="text-center text-sm text-muted-foreground">{t('login2fa.enter_code')}</p>
                            <FormField
                                label={t('login2fa.verification_code')}
                                placeholder="123456"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                required
                            />
                            {error && <p className="text-destructive text-center text-sm font-medium">{error}</p>}
                            <Button type="submit" className="w-full font-bold text-lg" disabled={isLoading}>
                                {isLoading ? t('common.loading') : t('login2fa.submit_button')}
                            </Button>
                            <div className="flex flex-col items-center gap-2 mt-2">
                                <p className="text-center text-sm text-muted-foreground">
                                    {t('login2fa.no_app_code')}
                                </p>
                                <Button variant="ghost" onClick={handleSendEmailCode}>
                                    {t('login2fa.use_email')}
                                </Button>
                            </div>
                        </CardContent>
                    </form>
                )}

                {step === 1 && (
                    <CardFooter className="pt-4">
                        <p className="text-center text-muted-foreground text-sm w-full">
                            {t('loginPage.no_account_yet')}{' '}
                            <Link href="/register" className="text-primary hover:underline font-semibold">
                                {t('header.register')}
                            </Link>
                        </p>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
