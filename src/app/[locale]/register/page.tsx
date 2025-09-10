"use client";

import { useState, useEffect } from "react";
import multiavatar from '@multiavatar/multiavatar';
import { auth, UserForRegistrationDto } from "@/lib/api";
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import StepIndicator from "../components/StepIndicator";
import { RadioGroup, Radio } from "@heroui/radio";

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
            <p className="text-center text-default-500 pb-4">{t('register.select_language')}</p>
            <RadioGroup
                value={formData.language}
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
            >
                <Radio value="en">English</Radio>
                <Radio value="zh-CN">简体中文</Radio>
                <Radio value="fr">Français</Radio>
                <Radio value="ja">日本語</Radio>
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
                <Input
                    isRequired
                    label={t('common.username')}
                    placeholder={t('register.enter_your_username')}
                    value={formData.userName}
                    onValueChange={(v) => setFormData(p => ({ ...p, userName: v }))}
                    size="lg" labelPlacement="outside"
                />
                <Input
                    isRequired
                    label={t('common.email')}
                    placeholder={t('register.enter_your_email')}
                    type="email"
                    value={formData.email}
                    onValueChange={(v) => setFormData(p => ({ ...p, email: v }))}
                    size="lg" labelPlacement="outside"
                />
                <Input
                    isRequired
                    label={t('common.password')}
                    placeholder={t('register.enter_your_password')}
                    type="password"
                    value={formData.password}
                    onValueChange={(v) => setFormData(p => ({ ...p, password: v }))}
                    size="lg" labelPlacement="outside"
                />
                <div>
                    <label className="block text-sm font-medium text-foreground pb-1.5">{t('register.avatar')}</label>
                    <div className="flex items-center space-x-4">
                        <div
                            className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0"
                            dangerouslySetInnerHTML={{ __html: formData.avatarSvg || '' }}
                        />
                        <Button type="button" onPress={generateAvatar} color="primary" variant="ghost">
                            {t('register.refresh_avatar')}
                        </Button>
                    </div>
                </div>
                <Input
                    label={t('common.invite_code')}
                    placeholder={t('register.enter_your_invite_code')}
                    value={formData.inviteCode}
                    onValueChange={(v) => setFormData(p => ({ ...p, inviteCode: v }))}
                    size="lg" labelPlacement="outside"
                />
            </>
        );
    };

    const Step3_Activation = () => (
        <div className="text-center">
             <p className="text-success text-lg">{t('register.successful_needs_verification')}</p>
        </div>
    );


    return (
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-160px)]">
            <Card className="w-full max-w-md p-4">
                <CardHeader className="flex flex-col items-center pb-4">
                    <h1 className="text-3xl font-bold">{t('header.register')}</h1>
                    <div className="mt-4 w-full">
                        <StepIndicator currentStep={step} totalSteps={3} stepTitles={stepTitles} />
                    </div>
                </CardHeader>
                <CardBody className="gap-6">
                    {renderStepContent()}
                    {error && <p className="text-danger text-center text-sm font-medium">{error}</p>}
                </CardBody>
                <CardFooter className="pt-4 flex-col items-center gap-4">
                    <div className="flex justify-between w-full">
                        <Button variant="ghost" onPress={handlePrevStep} isDisabled={step === 1 || step === 3}>
                            {t('common.previous_step')}
                        </Button>
                        {step === 1 && (
                            <Button color="primary" onPress={handleNextStep}>{t('common.next_step')}</Button>
                        )}
                         {step === 2 && (
                            <Button color="primary" onPress={handleRegister}>{t('header.register')}</Button>
                        )}
                    </div>
                    {step < 3 && (
                         <p className="text-center text-default-500 text-sm w-full">
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
