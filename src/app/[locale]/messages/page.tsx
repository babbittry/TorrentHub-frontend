'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageDto, messages } from '@/lib/api';
import { useTranslations } from 'next-intl';
import MessageSidebar from './components/MessageSidebar';
import MessageDetail from './components/MessageDetail';
import { Listbox, ListboxItem } from "@heroui/listbox";
import { Selection } from '@react-types/shared';
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Spinner } from "@heroui/spinner";

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

    const handleSelectionChange = (keys: Selection) => {
        if (keys instanceof Set && keys.size > 0) {
            const selectedKey = Array.from(keys)[0];
            setSelectedMessageId(Number(selectedKey));
        } else {
            setSelectedMessageId(null);
        }
    };

    const selectedMessage = messagesList.find(m => m.id === selectedMessageId) || null;

    const renderMessageList = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-full"><Spinner /></div>;
        }
        if (error) {
            return <div className="p-4 text-center text-danger">{error}</div>;
        }
        if (messagesList.length === 0) {
            return <div className="p-4 text-center text-default-500">{t('no_messages_found')}</div>;
        }
        return (
            <ScrollShadow className="w-full h-full">
                <Listbox
                    aria-label="Message list"
                    variant="flat"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={selectedMessageId ? new Set([selectedMessageId.toString()]) : new Set()}
                    onSelectionChange={handleSelectionChange}
                    items={messagesList}
                    itemClasses={{
                        base: "p-3 rounded-lg transition-colors border-l-4 border-transparent data-[hover=true]:bg-content2 data-[selected=true]:bg-content2 data-[selected=true]:border-primary",
                    }}
                >
                    {(item) => {
                        const isUnread = mailbox === 'inbox' && !item.isRead;
                        const fromToText = mailbox === 'inbox'
                            ? `${t('from')}: ${item.sender?.userName || 'N/A'}`
                            : `${t('to')}: ${item.receiver?.userName || 'N/A'}`;

                        return (
                            <ListboxItem
                                key={item.id}
                                textValue={item.subject}
                                className={isUnread ? "font-bold" : ""}
                            >
                                <div className="flex-1 flex flex-col gap-1 min-w-0">
                                    <div className="flex justify-between gap-2">
                                        <span className={`truncate flex-1 min-w-0 ${isUnread ? 'text-primary' : 'text-default-500'}`}>{fromToText}</span>
                                        <span className="text-xs text-default-400 flex-shrink-0">{new Date(item.sentAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-foreground truncate">
                                        {item.subject}
                                    </div>
                                </div>
                            </ListboxItem>
                        );
                    }}
                </Listbox>
            </ScrollShadow>
        );
    };

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <h1 className="text-4xl font-extrabold text-primary mb-8 text-center drop-shadow-lg">{t('title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
                <div className="md:col-span-1 bg-content1 rounded-lg p-4">
                    <MessageSidebar activeMailbox={mailbox} onSelectMailbox={setMailbox} />
                </div>

                <div className="md:col-span-1 bg-content1 rounded-lg p-2">
                    {renderMessageList()}
                </div>

                <div className="md:col-span-2 bg-content1 rounded-lg p-4 overflow-y-auto">
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
