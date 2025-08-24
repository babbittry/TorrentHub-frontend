import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { MailboxType } from '../page';
import { Button } from "@heroui/button";
import { Listbox, ListboxItem } from "@heroui/listbox";

interface MessageSidebarProps {
    activeMailbox: MailboxType;
    onSelectMailbox: (mailbox: MailboxType) => void;
}

const MessageSidebar: React.FC<MessageSidebarProps> = ({ activeMailbox, onSelectMailbox }) => {
    const t = useTranslations('messagesPage');

    return (
        <div className="flex flex-col space-y-4">
            <Button as={Link} href="/messages/new" color="primary" className="w-full">
                {t('compose')}
            </Button>
            <Listbox
                aria-label="Mailbox navigation"
                variant="flat"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={new Set([activeMailbox])}
                onSelectionChange={(keys) => onSelectMailbox(Array.from(keys)[0] as MailboxType)}
                itemClasses={{
                    base: [
                        "px-3 py-2 rounded-md transition-colors font-semibold",
                        "data-[hover=true]:bg-default-100",
                        "data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground",
                    ],
                }}
            >
                <ListboxItem key="inbox">{t('inbox')}</ListboxItem>
                <ListboxItem key="sent">{t('sent')}</ListboxItem>
            </Listbox>
        </div>
    );
};

export default MessageSidebar;