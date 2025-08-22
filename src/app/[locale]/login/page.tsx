"use client";

import {useState} from "react";
import {auth} from "@/lib/api";
import {useAuth} from "@/context/AuthContext";
import {Link} from '@/i18n/navigation';
import {useTranslations} from 'next-intl';
import {Button} from "@heroui/button";
import {Card, CardBody, CardFooter, CardHeader} from "@heroui/card";
import {Input} from "@heroui/input";

export default function LoginPage() {
    const [userName, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const {login} = useAuth();
    const t = useTranslations();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await auth.login({userName, password});
            login();
        } catch (err: unknown) {
            setError((err as Error).message || t('loginPage.failed'));
        }
    };

    return (
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-160px)]">
            <Card className="w-full max-w-md p-4">
                <form onSubmit={handleLogin}>
                    <CardHeader className="flex flex-col items-center pb-4">
                        <h1 className="text-3xl font-bold">{t('header.login')}</h1>
                    </CardHeader>
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
                        <Button type="submit" color="primary" className="w-full font-bold text-lg" size="lg">
                            {t('header.login')}
                        </Button>
                    </CardBody>
                </form>
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
