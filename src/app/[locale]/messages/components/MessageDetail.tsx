'use client';

import React, { useEffect } from 'react';
import { MessageDto, UserPublicProfileDto, messages, API_BASE_URL } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MailboxType } from '../page';
import { useAuth } from '@/context/AuthContext';

interface MessageDetailProps {
    message: MessageDto | null;
    activeMailbox: MailboxType;
    onMessageRead: (messageId: number) => void;
}

const MessageDetail: React.FC<MessageDetailProps> = ({ message, activeMailbox, onMessageRead }) => {
    const t = useTranslations('messagesPage');
    const { refreshUser } = useAuth();

    useEffect(() => {
        if (message && activeMailbox === 'inbox' && !message.isRead) {
            messages.markMessageAsRead(message.id)
                .then(() => {
                    console.log('[MessageDetail] Message marked as read, refreshing user data');
                    onMessageRead(message.id);
                    refreshUser();
                })
                .catch(error => {
                    console.error("Failed to mark message as read:", error);
                });
        }
    }, [message, activeMailbox, onMessageRead, refreshUser]);

    if (!message) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>{t('select_a_message')}</p>
            </div>
        );
    }

    const displayUser: UserPublicProfileDto | undefined = activeMailbox === 'inbox'
        ? message.sender
        : message.receiver;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-col items-start gap-4">
                <CardTitle className="text-2xl">{message.subject}</CardTitle>
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={displayUser?.avatar ? `${API_BASE_URL}${displayUser.avatar}` : undefined} />
                        <AvatarFallback>{displayUser?.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold">{displayUser?.userName || 'N/A'}</span>
                        <span className="text-xs text-muted-foreground">{new Date(message.sentAt).toLocaleString()}</span>
                    </div>
                </div>
            </CardHeader>
            <div className="border-t my-4" />
            <CardContent className="flex-grow">
                <div className="prose dark:prose-invert max-w-none text-foreground whitespace-pre-wrap">
                    {message.content}
                </div>
            </CardContent>
        </Card>
    );
};

export default MessageDetail;
