import React, { useEffect } from 'react';
import { MessageDto, UserPublicProfileDto, messages, API_BASE_URL } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Card, CardBody, CardHeader } from "@heroui/card";
import {Divider} from "@heroui/divider";
import { User } from "@heroui/user";
import type { MailboxType } from '../page';

interface MessageDetailProps {
    message: MessageDto | null;
    activeMailbox: MailboxType;
    onMessageRead: (messageId: number) => void;
}

const MessageDetail: React.FC<MessageDetailProps> = ({ message, activeMailbox, onMessageRead }) => {
    const t = useTranslations('messagesPage');

    useEffect(() => {
        if (message && activeMailbox === 'inbox' && !message.isRead) {
            // Mark message as read
            messages.markMessageAsRead(message.id)
                .then(() => {
                    onMessageRead(message.id); // Update parent state
                })
                .catch(error => {
                    console.error("Failed to mark message as read:", error);
                    // Optionally, show an error to the user
                });
        }
    }, [message, activeMailbox, onMessageRead]);

    if (!message) {
        return (
            <div className="flex items-center justify-center h-full text-default-500">
                <p>{t('select_a_message')}</p>
            </div>
        );
    }

    const displayUser: UserPublicProfileDto | undefined = activeMailbox === 'inbox'
        ? message.sender
        : message.receiver;



    return (
        <Card className="h-full">
            <CardHeader className="flex flex-col items-start gap-4">
                <h2 className="text-2xl font-bold text-foreground">{message.subject}</h2>
                <User
                    name={displayUser?.userName || 'N/A'}
                    avatarProps={{
                        src: displayUser?.avatar ? `${API_BASE_URL}${displayUser.avatar}` : undefined
                    }}
                />
                 <p className="text-xs text-default-500">{new Date(message.sentAt).toLocaleString()}</p>
            </CardHeader>
            <Divider />
            <CardBody>
                <div className="prose dark:prose-invert max-w-none text-foreground whitespace-pre-wrap">
                    {message.content}
                </div>
            </CardBody>
        </Card>
    );
};

export default MessageDetail;
