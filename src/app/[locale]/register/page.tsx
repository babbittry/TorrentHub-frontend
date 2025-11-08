"use client";

import { useState } from "react";
import multiavatar from '@multiavatar/multiavatar';
import { auth, UserForRegistrationDto } from "@/lib/api";
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import StepIndicator from "../components/StepIndicator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
    const t = useTranslations();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<UserForRegistrationDto>>({
        avatarSvg: multiavatar(Math.random().toString(36).substring(2, 15)),
        language: 'en'
    });
    const [error, setError] = useState<string | null>(null);

    const handleNextStep = () => setStep(prev => prev + 1);
    const handlePrevStep = () => setStep(prev => prev - 1);

    const handleRegister = async () => {
        setError(null);
        try {
            await auth.register(formData as UserForRegistrationDto);
            handleNextStep();
        } catch (err: unknown) {
            setError((err as Error).message || t('register.failed'));
        }
    };

    const stepTitles = [
        t('register.steps.language'),
        t('register.steps.account_info'),
        t('register.steps.activation')
    ];

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return <Step1_LanguageSelector />;
            case 2:
                return <Step2_AccountInfo />;
            case 3:
                return <Step3_Activation />;
            default:
                return null;
        }
    };

    const Step1_LanguageSelector = () => (
        <>
            <p className="text-center text-muted-foreground pb-4">{t('register.select_language')}</p>
            <RadioGroup
                value={formData.language}
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="en" />
                    <Label htmlFor="en">English</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="zh-CN" id="zh-CN" />
                    <Label htmlFor="zh-CN">简体中文</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fr" id="fr" />
                    <Label htmlFor="fr">Français</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ja" id="ja" />
                    <Label htmlFor="ja">日本語</Label>
                </div>
            </RadioGroup>
        </>
    );

    const Step2_AccountInfo = () => {
        const generateAvatar = () => {
            setFormData(prev => ({
                ...prev,
                avatarSvg: multiavatar(Math.random().toString(36).substring(2, 15))
            }));
        };

        return (
            <>
                <FormField
                    label={t('common.username')}
                    placeholder={t('register.enter_your_username')}
                    value={formData.userName || ''}
                    onChange={(e) => setFormData(p => ({ ...p, userName: e.target.value }))}
                    required
                />
                <FormField
                    label={t('common.email')}
                    type="email"
                    placeholder={t('register.enter_your_email')}
                    value={formData.email || ''}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                    required
                />
                <FormField
                    label={t('common.password')}
                    type="password"
                    placeholder={t('register.enter_your_password')}
                    value={formData.password || ''}
                    onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                    required
                />
                <div>
                    <label className="block text-sm font-medium text-foreground pb-1.5">{t('register.avatar')}</label>
                    <div className="flex items-center space-x-4">
                        <div
                            className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 shrink-0"
                            dangerouslySetInnerHTML={{ __html: formData.avatarSvg || '' }}
                        />
                        <Button type="button" onClick={generateAvatar} variant="ghost">
                            {t('register.refresh_avatar')}
                        </Button>
                    </div>
                </div>
                <FormField
                    label={t('common.invite_code')}
                    placeholder={t('register.enter_your_invite_code')}
                    value={formData.inviteCode || ''}
                    onChange={(e) => setFormData(p => ({ ...p, inviteCode: e.target.value }))}
                />
            </>
        );
    };

    const Step3_Activation = () => (
        <div className="text-center">
             <p className="text-green-600 text-lg">{t('register.successful_needs_verification')}</p>
        </div>
    );


    return (
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-160px)]">
            <Card className="w-full max-w-md p-4">
                <CardHeader className="flex flex-col items-center pb-4">
                    <CardTitle>{t('header.register')}</CardTitle>
                    <div className="mt-4 w-full">
                        <StepIndicator currentStep={step} totalSteps={3} stepTitles={stepTitles} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {renderStepContent()}
                    {error && <p className="text-destructive text-center text-sm font-medium">{error}</p>}
                </CardContent>
                <CardFooter className="pt-4 flex-col items-center gap-4">
                    <div className="flex justify-between w-full">
                        <Button variant="ghost" onClick={handlePrevStep} disabled={step === 1 || step === 3}>
                            {t('common.previous_step')}
                        </Button>
                        {step === 1 && (
                            <Button onClick={handleNextStep}>{t('common.next_step')}</Button>
                        )}
                         {step === 2 && (
                            <Button onClick={handleRegister}>{t('header.register')}</Button>
                        )}
                    </div>
                    {step < 3 && (
                         <p className="text-center text-muted-foreground text-sm w-full">
                            {t('loginPage.already_have_account')}{' '}
                            <Link href="/login" className="text-primary hover:underline font-semibold">
                                {t('header.login')}
                            </Link>
                        </p>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
