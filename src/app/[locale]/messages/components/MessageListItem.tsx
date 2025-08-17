import React from 'react';
import { MessageDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import type { MailboxType } from '../page';

interface MessageListItemProps {
    message: MessageDto;
    onSelect: () => void;
    isSelected: boolean;
    activeMailbox: MailboxType;
}

const MessageListItem: React.FC<MessageListItemProps> = ({ message, onSelect, isSelected, activeMailbox }) => {
    const t = useTranslations('messagesPage');

    const isUnread = activeMailbox === 'inbox' && !message.isRead;

    const itemClasses = `
        p-3 rounded-lg cursor-pointer transition-colors duration-200 border-l-4
        ${isSelected ? 'bg-[var(--color-border)] border-[var(--color-primary)]' : 'border-transparent hover:bg-[var(--color-border)]'}
        ${isUnread ? 'font-bold' : 'font-normal'}
    `;

    const fromToText = activeMailbox === 'inbox'
        ? `${t('from')}: ${message.sender?.userName || 'N/A'}`
        : `${t('to')}: ${message.receiver?.userName || 'N/A'}`;

    return (
        <div onClick={onSelect} className={itemClasses}>
            <div className={`flex justify-between items-center text-sm ${isUnread ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                <p className="truncate">{fromToText}</p>
                <p className="flex-shrink-0">{new Date(message.sentAt).toLocaleDateString()}</p>
            </div>
            <p className="text-md text-[var(--color-foreground)] truncate mt-1">
                {message.subject}
            </p>
        </div>
    );
};

export default MessageListItem;
