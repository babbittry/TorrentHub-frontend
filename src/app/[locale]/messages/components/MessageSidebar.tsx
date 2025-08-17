import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { MailboxType } from '../page';

interface MessageSidebarProps {
    activeMailbox: MailboxType;
    onSelectMailbox: (mailbox: MailboxType) => void;
}

const MessageSidebar: React.FC<MessageSidebarProps> = ({ activeMailbox, onSelectMailbox }) => {
    const t = useTranslations('messagesPage');

    const getButtonClass = (mailbox: MailboxType) => {
        return `w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 font-semibold ${ 
            activeMailbox === mailbox
                ? 'bg-[var(--color-primary)] text-white'
                : 'hover:bg-[var(--color-border)]'
        }`;
    };

    return (
        <div className="flex flex-col space-y-4">
            <Link href="/messages/new" className="btn-primary text-center font-bold py-3">
                {t('compose')}
            </Link>
            <div className="flex flex-col space-y-2">
                <button onClick={() => onSelectMailbox('inbox')} className={getButtonClass('inbox')}>
                    {t('inbox')}
                </button>
                <button onClick={() => onSelectMailbox('sent')} className={getButtonClass('sent')}>
                    {t('sent')}
                </button>
            </div>
        </div>
    );
};

export default MessageSidebar;
