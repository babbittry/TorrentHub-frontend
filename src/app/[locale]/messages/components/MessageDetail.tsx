import React from 'react';
import { MessageDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Card, CardBody, CardHeader } from "@heroui/card";
import {Divider} from "@heroui/divider";
import { User } from "@heroui/user";
import { API_BASE_URL } from '@/lib/apiClient';

interface MessageDetailProps {
    message: MessageDto | null;
}

const MessageDetail: React.FC<MessageDetailProps> = ({ message }) => {
    const t = useTranslations('messagesPage');

    if (!message) {
        return (
            <div className="flex items-center justify-center h-full text-default-500">
                <p>{t('select_a_message')}</p>
            </div>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-col items-start gap-4">
                <h2 className="text-2xl font-bold text-foreground">{message.subject}</h2>
                <User
                    name={message.sender?.userName || 'N/A'}
                    description={`${t('to')}: ${message.receiver?.userName || 'N/A'}`}
                    avatarProps={{
                        src: message.sender?.avatar ? `${API_BASE_URL}${message.sender.avatar}` : undefined
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
