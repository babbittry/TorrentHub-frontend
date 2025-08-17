import React from 'react';
import { MessageDto } from '@/lib/api';
import { useTranslations } from 'next-intl';

interface MessageDetailProps {
    message: MessageDto | null;
}

const MessageDetail: React.FC<MessageDetailProps> = ({ message }) => {
    const t = useTranslations('messagesPage');

    if (!message) {
        return (
            <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
                <p>{t('select_a_message')}</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 pb-4 border-b border-[var(--color-border)]">{message.subject}</h2>
            <div className="flex justify-between items-center mb-6 text-sm text-[var(--color-text-muted)]">
                <div>
                    <p><strong>{t('from')}:</strong> {message.sender?.userName || 'N/A'}</p>
                    <p><strong>{t('to')}:</strong> {message.receiver?.userName || 'N/A'}</p>
                </div>
                <div>
                    <strong>{t('date')}:</strong> {new Date(message.sentAt).toLocaleString()}
                </div>
            </div>
            <div className="prose dark:prose-invert max-w-none text-[var(--color-foreground)] whitespace-pre-wrap">
                {message.content}
            </div>
        </div>
    );
};

export default MessageDetail;
