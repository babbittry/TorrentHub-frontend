"use client";

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';

export default function Header() {
    const { isAuthenticated, logout } = useAuth();
    const { theme, setTheme, currentMode } = useTheme();
    const t = useTranslations();
    const router = useRouter();
    const pathname = usePathname();

    const [buttonTitle, setButtonTitle] = useState('');

    useEffect(() => {
        setButtonTitle(`${t('theme_toggle')} ${t(theme)} (${t(currentMode)})`);
    }, [theme, currentMode, t]);

    const handleLogout = () => {
        logout();
    };

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
        } else if (theme === 'dark') {
            setTheme('auto');
        } else {
            setTheme('light');
        }
    };

    const changeLanguage = (lng: string) => {
        const pathSegments = pathname.split('/');
        // Assuming the first segment after root is the locale
        const currentPathWithoutLocale = pathSegments.slice(2).join('/');
        router.push(`/${lng}/${currentPathWithoutLocale}`);
    };

    return (
        <header className="bg-[var(--color-card-background)] text-[var(--color-foreground)] p-4 shadow-lg">
            <nav className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-[var(--color-primary)]">
                    Sakura.PT
                </Link>
                <ul className="flex space-x-6">
                    <li>
                        <Link href="/" className="hover:text-[var(--color-primary-hover)] transition-colors duration-200">
                            {t('home')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/torrents" className="hover:text-[var(--color-primary-hover)] transition-colors duration-200">
                            {t('torrents')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/forums" className="hover:text-[var(--color-primary-hover)] transition-colors duration-200">
                            {t('forums')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/requests" className="hover:text-[var(--color-primary-hover)] transition-colors duration-200">
                            {t('requests')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/user" className="hover:text-[var(--color-primary-hover)] transition-colors duration-200">
                            {t('user_center')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/messages" className="hover:text-[var(--color-primary-hover)] transition-colors duration-200">
                            {t('messages')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/store" className="hover:text-[var(--color-primary-hover)] transition-colors duration-200">
                            {t('store')}
                        </Link>
                    </li>
                </ul>
                <div className="flex items-center space-x-4">
                    <select
                        onChange={(e) => changeLanguage(e.target.value)}
                        value={pathname.split('/')[1]}
                        className="input-field bg-[var(--color-input-background)] border-[var(--color-input-border)] text-[var(--color-foreground)]"
                    >
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                        <option value="ja">日本語</option>
                        <option value="fr">Français</option>
                    </select>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-[var(--color-border)] hover:bg-[var(--color-secondary)] transition-colors duration-200"
                        title={buttonTitle}
                    >
                        {currentMode === 'light' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h1M3 12H2m15.325-4.243l.707-.707M3.929 3.929l.707.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="btn-primary"
                        >
                            {t('logout')}
                        </button>
                    ) : (
                        <Link href="/login" className="btn-primary">
                            {t('login')}
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}
