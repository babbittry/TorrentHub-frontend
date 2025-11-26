'use client';

import React from 'react';
import { UserDisplayDto } from '@/lib/api';
import { API_BASE_URL } from '@/lib/api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { HatGlasses  } from 'lucide-react';

interface UserDisplayProps {
    user: UserDisplayDto | null | undefined;
    showAvatar?: boolean;
    avatarSize?: 'sm' | 'md' | 'lg';
    showUsername?: boolean;
    isAnonymous?: boolean;
}

const UserDisplay: React.FC<UserDisplayProps> = ({ user, showAvatar = false, avatarSize = 'md', showUsername = true, isAnonymous = false }) => {
    const t = useTranslations('common');
    
    // 优先级: isAnonymous > user
    if (isAnonymous) {
        return (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <HatGlasses  className="h-4 w-4" />
                <span>{t('anonymous_user')}</span>
            </span>
        );
    }
    
    if (!user) {
        return <span>Unknown User</span>;
    }

    const {
        id,
        username,
        avatar,
        userLevelName,
        userLevelColor,
        equippedBadge,
        userTitle,
        isColorfulUsernameActive
    } = user;

    const usernameStyle: React.CSSProperties = {};

    if (isColorfulUsernameActive) {
        usernameStyle.background = 'linear-gradient(to right, #ff8a00, #e52e71, #2980b9, #27ae60)';
        usernameStyle.WebkitBackgroundClip = 'text';
        usernameStyle.WebkitTextFillColor = 'transparent';
        usernameStyle.fontWeight = 'bold';
    } else if (userLevelColor) {
        usernameStyle.color = userLevelColor;
        usernameStyle.fontWeight = 'bold';
    }

    const avatarSizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    };

    const avatarUrl = user.avatar
        ? user.avatar.startsWith('http')
            ? user.avatar
            : `${API_BASE_URL}/${user.avatar}`
        : '/default-avatar.svg';

    return (
        <span className="inline-flex items-center space-x-2">
            {showAvatar && (
                <img
                    src={avatarUrl}
                    alt={username}
                    className={`${avatarSizeClasses[avatarSize]} rounded-full border-2 border-gray-200 cursor-pointer`}
                    onClick={() => window.location.href = `/users/${id}`}
                />
            )}
            {showUsername && (
                <>
                    {equippedBadge && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <img
                                        src={`${API_BASE_URL}/badges/${equippedBadge.code}.svg`}
                                        alt={equippedBadge.code}
                                        className="h-5 w-5"
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{equippedBadge.code}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    <Link href={`/users/${id}`} style={usernameStyle} title={userLevelName || ''}>
                        {username}
                    </Link>
                    {userTitle && <span className="text-gray-500 text-sm">[{userTitle}]</span>}
                </>
            )}
        </span>
    );
};

export default UserDisplay;