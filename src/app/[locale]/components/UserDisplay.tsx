'use client';

import React from 'react';
import { UserDisplayDto } from '@/lib/api';
import { API_BASE_URL } from '@/lib/api';
import { Tooltip } from '@heroui/react';
import { Link } from '@/i18n/navigation';

interface UserDisplayProps {
    user: UserDisplayDto | null | undefined;
}

const UserDisplay: React.FC<UserDisplayProps> = ({ user }) => {
    if (!user) {
        return <span>Unknown User</span>;
    }

    const {
        id,
        username,
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

    return (
        <span className="inline-flex items-center space-x-1">
            {equippedBadge && (
                <Tooltip title={equippedBadge.code}>
                    <img
                        src={`${API_BASE_URL}/badges/${equippedBadge.code}.svg`}
                        alt={equippedBadge.code}
                        className="h-5 w-5"
                    />
                </Tooltip>
            )}
            <Link href={`/users/${id}`} style={usernameStyle} title={userLevelName || ''}>
                {username}
            </Link>
            {userTitle && <span className="text-gray-500 text-sm">[{userTitle}]</span>}
        </span>
    );
};

export default UserDisplay;