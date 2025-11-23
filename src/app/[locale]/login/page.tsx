"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StepIndicator from "../components/StepIndicator";
import { toast } from "sonner";
import { Mail, Smartphone, RefreshCw } from "lucide-react";

export default function LoginPage() {
    const [step, setStep] = useState(1);
    const [userNameOrEmail, setUserNameOrEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [code, setCode] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [needsVerification, setNeedsVerification] = useState<boolean>(false);
    
    // 2FA 智能验证相关状态
    const [twoFactorMethod, setTwoFactorMethod] = useState<"App" | "Email">("App");
    const [verificationMode, setVerificationMode] = useState<"App" | "Email">("App");
    const [emailCooldown, setEmailCooldown] = useState<number>(0);
    const [isAutoSent, setIsAutoSent] = useState<boolean>(false);
    const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
    const [maskedEmail, setMaskedEmail] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    
    const authContext = useAuth();
    const router = useRouter();
    const t = useTranslations();

    // 邮件验证码倒计时 effect
    useEffect(() => {
        if (emailCooldown > 0) {
            const timer = setTimeout(() => {
                setEmailCooldown(emailCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [emailCooldown]);

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
                    // 智能检测用户配置的2FA方式（适配新的pending2faUser字段）
                    const method = (result.pending2faUser?.twoFactorMethod as "App" | "Email") || "App";
                    setTwoFactorMethod(method);
                    setVerificationMode(method);
                    
                    // 保存用户名和模糊化的邮箱地址
                    if (result.pending2faUser?.userName) {
                        setUserName(result.pending2faUser.userName);
                    }
                    if (result.pending2faUser?.email) {
                        setMaskedEmail(result.pending2faUser.email);
                    }
                    
                    // 如果用户配置的是邮件验证，自动发送验证码
                    if (method === "Email") {
                        await handleSendEmailCode(true);
                        setIsAutoSent(true);
                    }
                    
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

    const handleSendEmailCode = async (isAuto: boolean = false) => {
        if (emailCooldown > 0 && !isAuto) {
            return; // 冷却中，禁止手动重发
        }
        
        setIsSendingEmail(true);
        try {
            await auth.sendEmailCode({ userName: userNameOrEmail });
            toast.success(t('login2fa.email_sent_success'));
            setEmailCooldown(60); // 启动60秒倒计时
        } catch (err) {
            toast.error(t('login2fa.email_sent_error'));
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handleToggleVerificationMode = () => {
        const newMode = verificationMode === "App" ? "Email" : "App";
        setVerificationMode(newMode);
        
        // 切换到邮件模式时，如果未自动发送过则发送
        if (newMode === "Email" && !isAutoSent) {
            handleSendEmailCode();
            setIsAutoSent(true);
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
                            <Tabs value={verificationMode} onValueChange={(value) => setVerificationMode(value as "App" | "Email")} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="App" className="flex items-center gap-2">
                                        <Smartphone className="h-4 w-4" />
                                        {t('login2fa.tab_authenticator_app')}
                                    </TabsTrigger>
                                    <TabsTrigger value="Email" className="flex items-center gap-2" onClick={() => {
                                        if (!isAutoSent && verificationMode !== "Email") {
                                            handleSendEmailCode();
                                            setIsAutoSent(true);
                                        }
                                    }}>
                                        <Mail className="h-4 w-4" />
                                        {t('login2fa.tab_email_verification')}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="App" className="space-y-4 mt-4">
                                    {twoFactorMethod === "Email" && (
                                        <Alert>
                                            <AlertDescription className="text-sm">
                                                {t('login2fa.app_not_configured_hint')}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    <p className="text-center text-sm text-muted-foreground">
                                        {t('login2fa.enter_app_code')}
                                    </p>
                                    <FormField
                                        label={t('login2fa.verification_code')}
                                        placeholder="123456"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        maxLength={6}
                                        required
                                    />
                                </TabsContent>

                                <TabsContent value="Email" className="space-y-4 mt-4">
                                  {isAutoSent && maskedEmail && (
                                    <Alert>
                                      <AlertDescription className="text-sm">
                                        {t('login2fa.email_sent_to_with_greeting', { username: userName, email: maskedEmail })}
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                  <p className="text-center text-sm text-muted-foreground">
                                    {t('login2fa.enter_email_code')}
                                  </p>
                                    <FormField
                                        label={t('login2fa.verification_code')}
                                        placeholder="123456"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        maxLength={6}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => handleSendEmailCode(false)}
                                        disabled={emailCooldown > 0 || isSendingEmail}
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${isSendingEmail ? 'animate-spin' : ''}`} />
                                        {emailCooldown > 0
                                            ? t('login2fa.resend_email_cooldown', { seconds: emailCooldown })
                                            : t('login2fa.resend_email_code')}
                                    </Button>
                                </TabsContent>
                            </Tabs>

                            {error && <p className="text-destructive text-center text-sm font-medium">{error}</p>}
                            <Button type="submit" className="w-full font-bold text-lg" disabled={isLoading}>
                                {isLoading ? t('common.loading') : t('login2fa.submit_button')}
                            </Button>
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
