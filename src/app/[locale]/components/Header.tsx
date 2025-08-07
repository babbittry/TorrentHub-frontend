"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
    const { isAuthenticated, logout } = useAuth();
    const { theme, setTheme, currentMode } = useTheme();
    const t = useTranslations(); // Using 'Header' namespace
    const router = useRouter();
    const pathname = usePathname();

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
        // Get the current path without the locale
        const pathSegments = pathname.split('/');
        const currentPathWithoutLocale = pathSegments.slice(2).join('/');
        router.push(`/${lng}/${currentPathWithoutLocale}`);
    };

    return (
        <header className="bg-gray-800 text-white p-4 shadow-md">
            <nav className="container mx-auto flex justify-between items-center">
                <Link href="/public" className="text-2xl font-bold text-pink-400">
                    Sakura.PT
                </Link>
                <ul className="flex space-x-6">
                    <li>
                        <Link href="/public" className="hover:text-pink-400 transition-colors duration-200">
                            {t('home')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/torrents" className="hover:text-pink-400 transition-colors duration-200">
                            {t('torrents')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/forums" className="hover:text-pink-400 transition-colors duration-200">
                            {t('forums')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/requests" className="hover:text-pink-400 transition-colors duration-200">
                            {t('requests')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/user" className="hover:text-pink-400 transition-colors duration-200">
                            {t('user_center')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/messages" className="hover:text-pink-400 transition-colors duration-200">
                            {t('messages')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/store" className="hover:text-pink-400 transition-colors duration-200">
                            {t('store')}
                        </Link>
                    </li>
                </ul>
                <div className="flex items-center space-x-4">
                    <select
                        onChange={(e) => changeLanguage(e.target.value)}
                        // The value of the select should reflect the current locale from the URL
                        // This requires getting the current locale from the path, which is not directly available via usePathname in a simple way
                        // For now, we'll leave it as a placeholder or assume the locale is passed as a prop if needed.
                        // For next-intl, the locale is typically part of the URL, so we can extract it from `pathname`.
                        value={pathname.split('/')[1]} // Assuming the locale is the second segment of the path
                        className="p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                        <option value="ja">日本語</option>
                        <option value="fr">Français</option>
                    </select>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
                        title={`${t('theme_toggle')} ${t(theme)} (${t(currentMode)})`}
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
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                        >
                            {t('logout')}
                        </button>
                    ) : (
                        <Link href="/login" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md transition-colors duration-200">
                            {t('login')}
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}
