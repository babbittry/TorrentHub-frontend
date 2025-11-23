"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link, useRouter } from '@/i18n/navigation';
import { API_BASE_URL } from '@/lib/api';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfo, faGear, faTicket, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';

export default function UserMenu() {
    const { user, logout } = useAuth();
    const t = useTranslations('userMenu');
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const handleMouseEnter = () => {
        if (timerId) clearTimeout(timerId);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        const newTimerId = setTimeout(() => setIsOpen(false), 300);
        setTimerId(newTimerId);
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!user) {
        return null;
    }

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link href={`/users/${user.id}`}>
                <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer bg-gray-200 dark:bg-gray-700">
                    <Image
                        src={user.avatar ? `${API_BASE_URL}${user.avatar}` : '/default-avatar.svg'}
                        alt="User Avatar"
                        width={40}
                        height={40}
                        className="object-cover"
                    />
                </div>
            </Link>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 border border-gray-200 dark:border-gray-700">
                    <Link href={`/users/${user.id}`}>
                        <div className="flex items-center mb-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden mr-4 shrink-0 bg-gray-300 dark:bg-gray-600">
                                <Image
                                    src={user.avatar ? `${API_BASE_URL}${user.avatar}` : '/default-avatar.svg'}
                                    alt="User Avatar"
                                    width={64}
                                    height={64}
                                    className="object-cover"
                                />
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-lg truncate">{user.userName}</p>
                            </div>
                        </div>
                    </Link>

                    {user.signature && (
                        <p className="text-sm text-(--color-foreground-muted) italic mb-4 border-t border-(--color-border) pt-2 warp-break-words">{user.signature}</p>
                    )}

                    <div className="space-y-2 text-sm mb-4 border-t border-(--color-border) pt-2">
                        <p><strong>{t('uploaded')}:</strong> {formatBytes(user.uploadedBytes)}</p>
                        <p><strong>{t('downloaded')}:</strong> {formatBytes(user.downloadedBytes)}</p>
                        <p><strong>{t('coins')}:</strong> {user.coins}</p>
                    </div>

                    <Link href={`/users/${user.id}`} className="block w-full text-left px-4 py-2 text-sm hover:bg-(--color-secondary) rounded transition-colors duration-200">
                        <FontAwesomeIcon icon={faInfo} />
                        {t('personal_info')}
                    </Link>
                    <Link href="/invites" className="block w-full text-left px-4 py-2 text-sm hover:bg-(--color-secondary) rounded transition-colors duration-200">
                        <FontAwesomeIcon icon={faTicket} />
                        {t('invites_system')}
                    </Link>
                    <Link href="/settings" className="block w-full text-left px-4 py-2 text-sm hover:bg-(--color-secondary) rounded transition-colors duration-200">
                        <FontAwesomeIcon icon={faGear} />
                        {t('settings')}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-(--color-secondary) rounded transition-colors duration-200"
                    >
                        <FontAwesomeIcon icon={faArrowRightFromBracket} />
                        {t('logout')}
                    </button>
                </div>
            )}
        </div>
    );
}
