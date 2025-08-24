"use client";

import { useState, useEffect } from "react";
import multiavatar from '@multiavatar/multiavatar';
import { auth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";

export default function RegisterPage() {
    const [userName, setUserName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [inviteCode, setInviteCode] = useState<string>("");
    const [avatarSvg, setAvatar] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();
    const t = useTranslations();

    const generateAvatar = () => {
        const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        setAvatar(multiavatar(randomString));
    };

    useEffect(() => {
        generateAvatar();
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            await auth.register({ userName, email, password, inviteCode, avatarSvg });
            setSuccess(t('register.successful'));
            router.push("/login"); // Redirect to login page on successful registration
        } catch (err: unknown) {
            setError((err as Error).message || t('register.failed'));
        }
    };

    return (
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-160px)]">
            <Card className="w-full max-w-md p-4">
                <form onSubmit={handleRegister}>
                    <CardHeader className="flex flex-col items-center pb-4">
                        <h1 className="text-3xl font-bold">{t('header.register')}</h1>
                    </CardHeader>
                    <CardBody className="gap-6">
                        <Input
                            isRequired
                            label={t('common.username')}
                            placeholder={t('register.enter_your_username')}
                            value={userName}
                            onValueChange={setUserName}
                            size="lg"
                            labelPlacement="outside"
                        />
                        <Input
                            isRequired
                            label={t('common.email')}
                            placeholder={t('register.enter_your_email')}
                            type="email"
                            value={email}
                            onValueChange={setEmail}
                            size="lg"
                            labelPlacement="outside"
                        />
                        <Input
                            isRequired
                            label={t('common.password')}
                            placeholder={t('register.enter_your_password')}
                            type="password"
                            value={password}
                            onValueChange={setPassword}
                            size="lg"
                            labelPlacement="outside"
                        />
                        <div>
                            <label className="block text-sm font-medium text-foreground pb-1.5">{t('register.avatar')}</label>
                            <div className="flex items-center space-x-4">
                                <div
                                    className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0"
                                    dangerouslySetInnerHTML={{ __html: avatarSvg }}
                                />
                                <Button
                                    type="button"
                                    onPress={generateAvatar}
                                    color="primary"
                                    variant="ghost"
                                >
                                    {t('register.refresh_avatar')}
                                </Button>
                            </div>
                        </div>
                        <Input
                            label={t('common.invite_code')}
                            placeholder={t('register.enter_your_invite_code')}
                            value={inviteCode}
                            onValueChange={setInviteCode}
                            size="lg"
                            labelPlacement="outside"
                        />
                        {error && <p className="text-danger text-center text-sm font-medium">{error}</p>}
                        {success && <p className="text-success text-center text-sm font-medium">{success}</p>}
                        <Button type="submit" color="primary" className="w-full font-bold text-lg" size="lg">
                            {t('header.register')}
                        </Button>
                    </CardBody>
                </form>
                <CardFooter className="pt-4">
                    <p className="text-center text-default-500 text-sm w-full">
                        {t('loginPage.already_have_account')}{' '}
                        <Link href="/login" className="text-primary hover:underline font-semibold">
                            {t('header.login')}
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
