"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
    const [userName, setUserName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [inviteCode, setInviteCode] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();
    const { t } = useTranslation();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            await fetchApi("/api/User/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userName, email, password, inviteCode }),
            });
            setSuccess(t('registration_successful'));
            router.push("/login"); // Redirect to login page on successful registration
        } catch (err: unknown) {
            setError((err as Error).message || t('registration_failed'));
        }
    };

    return (
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-160px)]">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 transform transition-all duration-300 hover:scale-105">
                <h1 className="text-4xl font-extrabold text-white mb-8 text-center drop-shadow-lg">{t('register')}</h1>
                <form onSubmit={handleRegister}>
                    <div className="mb-6">
                        <label htmlFor="userName" className="block text-gray-300 text-lg font-semibold mb-3">{t('username')}</label>
                        <input
                            type="text"
                            id="userName"
                            className="w-full p-4 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-gray-300 text-lg font-semibold mb-3">{t('email')}</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full p-4 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-300 text-lg font-semibold mb-3">{t('password')}</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full p-4 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-8">
                        <label htmlFor="inviteCode" className="block text-gray-300 text-lg font-semibold mb-3">{t('invite_code')}</label>
                        <input
                            type="text"
                            id="inviteCode"
                            className="w-full p-4 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-center mb-6 text-lg font-medium">{error}</p>}
                    {success && <p className="text-green-500 text-center mb-6 text-lg font-medium">{success}</p>}
                    <button
                        type="submit"
                        className="w-full px-6 py-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-300 font-bold text-xl shadow-lg transform hover:scale-105"
                    >
                        {t('register')}
                    </button>
                </form>
                <p className="text-center text-gray-400 mt-6 text-lg">
                    {t('already_have_account')} <Link href="/login" className="text-pink-400 hover:underline font-semibold">{t('login')}</Link>
                </p>
            </div>
        </div>
    );
}
