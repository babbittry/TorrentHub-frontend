'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { MailboxType } from '../page';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface MessageSidebarProps {
    activeMailbox: MailboxType;
    onSelectMailbox: (mailbox: MailboxType) => void;
}

const MessageSidebar: React.FC<MessageSidebarProps> = ({ activeMailbox, onSelectMailbox }) => {
    const t = useTranslations('messagesPage');

    const mailboxOptions: { key: MailboxType; label: string }[] = [
        { key: 'inbox', label: t('inbox') },
        { key: 'sent', label: t('sent') },
    ];

    return (
        <div className="flex flex-col space-y-4">
            <Button asChild>
                <Link href="/messages/new">{t('compose')}</Link>
            </Button>
            <div className="space-y-1">
                {mailboxOptions.map(({ key, label }) => (
                    <Button
                        key={key}
                        variant={activeMailbox === key ? 'secondary' : 'ghost'}
                        className={cn(
                            "w-full justify-start",
                            activeMailbox === key && "font-bold"
                        )}
                        onClick={() => onSelectMailbox(key)}
                    >
                        {label}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default MessageSidebar;