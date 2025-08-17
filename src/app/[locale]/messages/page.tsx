'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageDto, messages } from '@/lib/api';
import { useTranslations } from 'next-intl';
import MessageSidebar from './components/MessageSidebar';
import MessageListItem from './components/MessageListItem';
import MessageDetail from './components/MessageDetail';

export type MailboxType = 'inbox' | 'sent';

const MessagesPage = () => {
    const [mailbox, setMailbox] = useState<MailboxType>('inbox');
    const [messagesList, setMessagesList] = useState<MessageDto[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<MessageDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations('messagesPage');

    const fetchMessages = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSelectedMessage(null);
        try {
            const data = mailbox === 'inbox'
                ? await messages.getInboxMessages()
                : await messages.getSentMessages();
            setMessagesList(data);
        } catch (err) {
            setError(t('error_loading_messages'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [mailbox, t]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleSelectMessage = (message: MessageDto) => {
        setSelectedMessage(message);
        if (mailbox === 'inbox' && !message.isRead) {
            messages.markMessageAsRead(message.id).then(() => {
                // Refresh list to show updated read status
                fetchMessages();
            });
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <h1 className="text-4xl font-extrabold text-[var(--color-primary)] mb-8 text-center drop-shadow-lg">{t('title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
                {/* Sidebar */}
                <div className="md:col-span-1 bg-[var(--color-card-background)] rounded-lg p-4">
                    <MessageSidebar activeMailbox={mailbox} onSelectMailbox={setMailbox} />
                </div>

                {/* Message List */}
                <div className="md:col-span-1 bg-[var(--color-card-background)] rounded-lg p-2 overflow-y-auto">
                    {isLoading ? (
                        <p className="text-center p-4">{t('loading')}</p>
                    ) : error ? (
                        <p className="text-center p-4 text-red-500">{error}</p>
                    ) : (
                        <div className="space-y-2">
                            {messagesList.length > 0 ? (
                                messagesList.map(msg => (
                                    <MessageListItem
                                        key={msg.id}
                                        message={msg}
                                        onSelect={() => handleSelectMessage(msg)}
                                        isSelected={selectedMessage?.id === msg.id}
                                        activeMailbox={mailbox}
                                    />
                                ))
                            ) : (
                                <p className="text-center text-gray-500 p-4">{t('no_messages_found')}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Message Detail */}
                <div className="md:col-span-2 bg-[var(--color-card-background)] rounded-lg p-6 overflow-y-auto">
                    <MessageDetail message={selectedMessage} />
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
