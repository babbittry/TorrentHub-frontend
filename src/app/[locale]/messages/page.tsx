'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageDto, messages } from '@/lib/api';
import { useTranslations } from 'next-intl';
import MessageSidebar from './components/MessageSidebar';
import MessageDetail from './components/MessageDetail';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export type MailboxType = 'inbox' | 'sent';

const MessagesPage = () => {
    const [mailbox, setMailbox] = useState<MailboxType>('inbox');
    const [messagesList, setMessagesList] = useState<MessageDto[]>([]);
    const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations('messagesPage');

    const fetchMessages = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = mailbox === 'inbox'
                ? await messages.getInboxMessages()
                : await messages.getSentMessages();
            setMessagesList(data);
            // Automatically select the first message if list is not empty
            if (data.length > 0) {
                setSelectedMessageId(data[0].id);
            } else {
                setSelectedMessageId(null);
            }
        } catch (err) {
            setError(t('error_loading_messages'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [mailbox, t]);

    const handleMessageRead = useCallback((messageId: number) => {
        setMessagesList(prevMessages =>
            prevMessages.map(msg =>
                msg.id === messageId ? { ...msg, isRead: true } : msg
            )
        );
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const selectedMessage = messagesList.find(m => m.id === selectedMessageId) || null;

    const renderMessageList = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
        }
        if (error) {
            return <div className="p-4 text-center text-destructive">{error}</div>;
        }
        if (messagesList.length === 0) {
            return <div className="p-4 text-center text-muted-foreground">{t('no_messages_found')}</div>;
        }
        return (
            <div className="w-full h-full overflow-y-auto space-y-1">
                {messagesList.map(item => {
                    const isUnread = mailbox === 'inbox' && !item.isRead;
                    const fromToText = mailbox === 'inbox'
                        ? `${t('from')}: ${item.sender?.userName || 'N/A'}`
                        : `${t('to')}: ${item.receiver?.userName || 'N/A'}`;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setSelectedMessageId(item.id)}
                            className={cn(
                                "w-full text-left p-3 rounded-lg transition-colors border-l-4",
                                selectedMessageId === item.id ? "bg-secondary border-primary" : "border-transparent hover:bg-secondary/50",
                                isUnread && "font-bold"
                            )}
                        >
                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                                <div className="flex justify-between gap-2">
                                    <span className={cn("truncate flex-1 min-w-0", isUnread ? 'text-primary' : 'text-muted-foreground')}>{fromToText}</span>
                                    <span className="text-xs text-muted-foreground shrink-0">{new Date(item.sentAt).toLocaleDateString()}</span>
                                </div>
                                <div className="text-foreground truncate">
                                    {item.subject}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <h1 className="text-4xl font-extrabold text-primary mb-8 text-center">{t('title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
                <div className="md:col-span-1 bg-card rounded-lg p-4">
                    <MessageSidebar activeMailbox={mailbox} onSelectMailbox={setMailbox} />
                </div>

                <div className="md:col-span-1 bg-card rounded-lg p-2">
                    {renderMessageList()}
                </div>

                <div className="md:col-span-2 bg-card rounded-lg p-4 overflow-y-auto">
                    <MessageDetail
                        message={selectedMessage}
                        activeMailbox={mailbox}
                        onMessageRead={handleMessageRead}
                    />
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
