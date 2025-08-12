"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { users } from '@/lib/api';
import type { UserPrivateProfileDto } from '@/lib/api';

export default function UserMenu() {
    const { logout } = useAuth();
    const t = useTranslations();
    const [user, setUser] = useState<UserPrivateProfileDto | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await users.getMe();
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user profile", error);
                // Handle error, maybe logout user if token is invalid
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        // Cleanup timeout on component unmount
        return () => {
            if (timerId) {
                clearTimeout(timerId);
            }
        };
    }, [timerId]);

    const handleLogout = () => {
        logout();
    };

    const handleMouseEnter = () => {
        if (timerId) {
            clearTimeout(timerId);
            setTimerId(null);
        }
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        const newTimerId = setTimeout(() => {
            setIsOpen(false);
        }, 1000); // 1 second delay
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
        return null; // Or a loading spinner
    }

    return (
        <div 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer bg-gray-200">
                <Image 
                    src={user.avatar || '/logo-black.png'} // Fallback to a default avatar
                    alt="User Avatar" 
                    width={40} 
                    height={40} 
                    className="object-cover"
                />
            </div>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[var(--color-card-background)] rounded-lg shadow-lg p-4 z-10 border border-[var(--color-border)]">
                    <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0 bg-gray-300">
                            <Image 
                                src={user.avatar || '/logo-black.png'} // Fallback to a default avatar
                                alt="User Avatar" 
                                width={64} 
                                height={64} 
                                className="object-cover"
                            />
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-lg truncate">{user.userName}</p>
                            {/* Badges would go here */}
                        </div>
                    </div>
                    
                    {user.signature && (
                        <p className="text-sm text-[var(--color-foreground-muted)] italic mb-4 border-t border-[var(--color-border)] pt-2 break-words">{user.signature}</p>
                    )}

                    <div className="space-y-2 text-sm mb-4 border-t border-[var(--color-border)] pt-2">
                        <p><strong>{t('uploaded')}:</strong> {formatBytes(user.uploadedBytes)}</p>
                        <p><strong>{t('downloaded')}:</strong> {formatBytes(user.downloadedBytes)}</p>
                        <p><strong>{t('coins')}:</strong> {user.coins}</p>
                    </div>

                    {/* TODO: Add icons */}
                    <Link href="/settings" className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-secondary)] rounded transition-colors duration-200">
                        {t('settings')}
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-secondary)] rounded transition-colors duration-200"
                    >
                        {t('logout')}
                    </button>
                </div>
            )}
        </div>
    );
}
