"use client";

import { useAuth } from '@/context/AuthContext';
import { usePublicSettings, isAuthenticatedSettings } from '@/context/PublicSettingsContext';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import UserMenu from './UserMenu';
import { users, UserRole } from '@/lib/api';
import { normalizeUserRoleCode } from '@/lib/utils';

export default function Header() {
    const { isAuthenticated, user } = useAuth();
    const { publicSettings } = usePublicSettings();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const t = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    const [buttonTitle, setButtonTitle] = useState('');

    useEffect(() => {
        if (resolvedTheme) {
            setButtonTitle(`${t('theme.toggle')} ${t('theme.' + theme)} (${t('theme.' + resolvedTheme)})`);
        }
    }, [theme, resolvedTheme, t]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
        } else if (theme === 'dark') {
            setTheme('system');
        } else {
            setTheme('light');
        }
    };

    const changeLanguage = async (lng: string) => {
        const pathSegments = pathname.split('/');
        // Assuming the first segment after root is the locale
        const currentPathWithoutLocale = pathSegments.slice(2).join('/');
        router.push(`/${lng}/${currentPathWithoutLocale}`);

        if (isAuthenticated) {
            try {
                await users.updateMe({ language: lng });
            } catch (error) {
                console.error("Failed to update language preference", error);
            }
        }
    };

    return (
        <header className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-4 shadow-lg">
            <nav className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] flex justify-between items-center">
                <Link href="/" className="flex items-center">
                    {!isClient ? (
                        <div style={{ width: 128, height: 32 }} /> // Placeholder with size
                    ) : resolvedTheme === 'light' ? (
                        <Image src="/logo-white.png" alt="Logo" width={128} height={32} />
                    ) : (
                        <Image src="/logo-black.png" alt="Logo" width={115} height={32} />
                    )}
                </Link>
                <ul className="flex space-x-6">
                    <li>
                        <Link href="/" className="hover:text-primary-500 transition-colors duration-200">
                            {t('header.home')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/torrents" className="hover:text-primary-500 transition-colors duration-200">
                            {t('header.torrents')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/torrents/upload" className="hover:text-primary-500 transition-colors duration-200">
                            {t('header.upload_torrent')}
                        </Link>
                    </li>
                    {publicSettings?.isForumEnabled && (
                        <li>
                            <Link href="/forums" className="hover:text-primary-500 transition-colors duration-200">
                                {t('header.forums')}
                            </Link>
                        </li>
                    )}
                    {(publicSettings === null ||
                      !isAuthenticatedSettings(publicSettings) ||
                      publicSettings.isRequestSystemEnabled) && (
                        <li>
                            <Link href="/requests" className="hover:text-primary-500 transition-colors duration-200">
                                {t('header.requests')}
                            </Link>
                        </li>
                    )}
                    <li>
                        <Link href="/polls" className="hover:text-primary-500 transition-colors duration-200">
                            {t('header.polls')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/user" className="hover:text-primary-500 transition-colors duration-200">
                            {t('header.user_center')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/store" className="hover:text-primary-500 transition-colors duration-200">
                            {t('header.store')}
                        </Link>
                    </li>
                    <li>
                        <Link href="/about" className="hover:text-primary-500 transition-colors duration-200">
                            {t('header.about')}
                        </Link>
                    </li>
                    {user && normalizeUserRoleCode(user.role) === 'Administrator' && (
                        <li>
                            <Link href="/admin/dashboard" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors duration-200">
                                {t('header.admin_dashboard')}
                            </Link>
                        </li>
                    )}
                </ul>
                <div className="flex items-center space-x-4">
                    <select
                        onChange={(e) => changeLanguage(e.target.value)}
                        value={pathname.split('/')[1]}
                        className="px-4 py-2 rounded-md border bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="en">English</option>
                        <option value="zh-CN">中文</option>
                        <option value="ja">日本語</option>
                        <option value="fr">Français</option>
                    </select>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                        title={buttonTitle}
                    >
                        {!isClient ? (
                             <div className="h-6 w-6" /> // Placeholder
                        ) : theme === 'light' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                            </svg>
                        ) : theme === 'dark' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
                            </svg>
                        )}
                    </button>
                    {!isClient ? (
                        <div className="w-20 h-8" /> // Placeholder for login button or user menu
                    ) : isAuthenticated ? (
                        <>
                            <Link
                                href="/messages"
                                className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                                title={t('header.messages_tooltip')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                </svg>
                                {(() => {
                                    const shouldShow = user?.unreadMessagesCount !== undefined && user.unreadMessagesCount > 0;
                                    return shouldShow && (
                                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
                                            {user.unreadMessagesCount > 99 ? '99+' : user.unreadMessagesCount}
                                        </span>
                                    );
                                })()}
                            </Link>
                            <UserMenu />
                        </>
                    ) : (
                        <div className="flex items-center space-x-2">
                            {publicSettings?.isRegistrationOpen && (
                                <Link href="/register" className="btn-secondary">
                                    {t('header.register')}
                                </Link>
                            )}
                            <Link href="/login" className="btn-primary">
                                {t('header.login')}
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}
