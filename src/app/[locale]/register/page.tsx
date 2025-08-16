"use client";

import { useState } from "react";
import { auth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
    const [userName, setUserName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [inviteCode, setInviteCode] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();
    const t_register = useTranslations('registerPage');
    const t_header = useTranslations('header');
    const t_common = useTranslations('common');
    const t_login = useTranslations('loginPage');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            await auth.register({ userName, email, password, inviteCode });
            setSuccess(t_register('successful'));
            router.push("/login"); // Redirect to login page on successful registration
        } catch (err: unknown) {
            setError((err as Error).message || t_register('failed'));
        }
    };

    return (
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-160px)]">
            <div className="card w-full max-w-md transform transition-all duration-300 hover:scale-105">
                <h1 className="text-4xl font-extrabold text-[var(--color-primary)] mb-8 text-center drop-shadow-lg">{t_header('register')}</h1>
                <form onSubmit={handleRegister}>
                    <div className="mb-6">
                        <label htmlFor="userName" className="block text-[var(--color-foreground)] text-lg font-semibold mb-3">{t_common('username')}</label>
                        <input
                            type="text"
                            id="userName"
                            className="input-field"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-[var(--color-foreground)] text-lg font-semibold mb-3">{t_common('email')}</label>
                        <input
                            type="email"
                            id="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-[var(--color-foreground)] text-lg font-semibold mb-3">{t_common('password')}</label>
                        <input
                            type="password"
                            id="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-8">
                        <label htmlFor="inviteCode" className="block text-[var(--color-foreground)] text-lg font-semibold mb-3">{t_common('invite_code')}</label>
                        <input
                            type="text"
                            id="inviteCode"
                            className="input-field"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-[var(--color-error)] text-center mb-6 text-lg font-medium">{error}</p>}
                    {success && <p className="text-[var(--color-success)] text-center mb-6 text-lg font-medium">{success}</p>}
                    <button
                        type="submit"
                        className="btn-primary w-full px-6 py-4 font-bold text-xl shadow-lg transform hover:scale-105"
                    >
                        {t_header('register')}
                    </button>
                </form>
                <p className="text-center text-[var(--color-text-muted)] mt-6 text-lg">
                    {t_login('already_have_account')} <Link href="/login" className="text-[var(--color-primary)] hover:underline font-semibold">{t_header('login')}</Link>
                </p>
            </div>
        </div>
    );
}
