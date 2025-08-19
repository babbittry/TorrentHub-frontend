'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { messages, users, SendMessageRequestDto, UserPublicProfileDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@uidotdev/usehooks';

const NewMessagePage = () => {
    const router = useRouter();
    const t = useTranslations('messagesPage');

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<UserPublicProfileDto[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserPublicProfileDto | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        const searchUsers = async () => {
            if (debouncedSearchTerm) {
                setIsSearching(true);
                try {
                    const results = await users.getUsers(1, 10, debouncedSearchTerm);
                    setSearchResults(results);
                } catch (e) {
                    console.error("Search failed", e);
                    setSearchResults([]);
                }
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        };
        searchUsers();
    }, [debouncedSearchTerm]);

    const handleSelectUser = (user: UserPublicProfileDto) => {
        setSelectedUser(user);
        setSearchTerm(user.userName);
        setSearchResults([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) {
            setError(t('error_recipient_not_selected'));
            return;
        }

        setIsSubmitting(true);
        setError(null);

        if (!subject.trim() || !content.trim()) {
            setError(t('error_all_fields_required'));
            setIsSubmitting(false);
            return;
        }

        const messageData: SendMessageRequestDto = {
            receiverId: selectedUser.id,
            subject,
            content,
        };

        try {
            await messages.sendMessage(messageData);
            router.push('/messages');
        } catch (err) {
            setError(t('error_sending_message'));
            console.error(err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-[var(--color-primary)] mb-8 text-center drop-shadow-lg">{t('compose')}</h1>
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Recipient Search */}
                        <div className="relative">
                            <label htmlFor="recipient" className="block text-sm font-medium text-[var(--color-foreground)]">{t('recipient')}</label>
                            <input
                                type="text"
                                id="recipient"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (selectedUser) setSelectedUser(null); // Clear selection on new typing
                                }}
                                className="input-field mt-1"
                                placeholder={t('search_recipient_placeholder')}
                                autoComplete="off"
                            />
                            {(isSearching || searchResults.length > 0 || debouncedSearchTerm) && !selectedUser && (
                                <ul className="absolute z-10 w-full bg-[var(--color-card-background)] border border-[var(--color-border)] rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                                    {isSearching ? (
                                        <li className="px-4 py-2 text-gray-500">{t('searching')}</li>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map(user => (
                                            <li
                                                key={user.id}
                                                className="px-4 py-2 cursor-pointer hover:bg-[var(--color-border)]"
                                                onClick={() => handleSelectUser(user)}
                                            >
                                                {user.userName}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-4 py-2 text-gray-500">{t('no_users_found')}</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        {selectedUser && (
                            <div className="p-3 bg-[var(--color-border)] rounded-lg">
                                <p><span className="font-semibold">{t('recipient')}:</span> {selectedUser.userName} (ID: {selectedUser.id})</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-[var(--color-foreground)]">{t('subject')}</label>
                            <input
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="input-field mt-1"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-[var(--color-foreground)]">{t('content')}</label>
                            <textarea
                                id="content"
                                rows={10}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="input-field mt-1"
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting || !selectedUser}
                                className="btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? t('sending') : t('send_message')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewMessagePage;
