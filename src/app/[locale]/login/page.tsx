"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/apiClient";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/AuthContext";
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
    const [userName, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { login } = useAuth();
    const t = useTranslations();
    const { locale } = useParams();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetchApi("/api/User/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userName, password }),
            });

            // With HttpOnly cookies, we don't get a token in the body.
            // We just need to check if the request was successful (status 200-299).
            // The browser will automatically handle the cookie.
            if (response.ok) {
                console.log("Login request successful. Backend should have set the HttpOnly cookie.");
                // We call login() to update the app's auth state.
                // The actual token is not handled by the client-side JS.
                login();
                // Redirect to the home page.
                router.push("/");
            } else {
                // If the server returns an error (e.g., 401 for bad credentials),
                // we can try to get an error message from the response body.
                const errorData = await response.json();
                setError(errorData.message || t('login_failed'));
            }
        } catch (err: unknown) {
            // This will catch network errors or if the response isn't valid JSON.
            setError(t('login_failed'));
        }
    };

    return (
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-160px)]">
            <div className="card w-full max-w-md transform transition-all duration-300 hover:scale-105">
                <h1 className="text-4xl font-extrabold text-[var(--color-primary)] mb-8 text-center drop-shadow-lg">{t('login')}</h1>
                <form onSubmit={handleLogin}>
                    <div className="mb-6">
                        <label htmlFor="userName" className="block text-[var(--color-foreground)] text-lg font-semibold mb-3">{t('username')}</label>
                        <input
                            type="text"
                            id="userName"
                            className="input-field"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-8">
                        <label htmlFor="password" className="block text-[var(--color-foreground)] text-lg font-semibold mb-3">{t('password')}</label>
                        <input
                            type="password"
                            id="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-[var(--color-error)] text-center mb-6 text-lg font-medium">{error}</p>}
                    <button
                        type="submit"
                        className="btn-primary w-full px-6 py-4 font-bold text-xl shadow-lg transform hover:scale-105"
                    >
                        {t('login')}
                    </button>
                </form>
                <p className="text-center text-[var(--color-text-muted)] mt-6 text-lg">
                    {t('no_account_yet')} <Link href="/register" className="text-[var(--color-primary)] hover:underline font-semibold">{t('register')}</Link>
                </p>
            </div>
        </div>
    );
}
