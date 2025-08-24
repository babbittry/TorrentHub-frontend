'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { messages, users, SendMessageRequestDto, UserPublicProfileDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@uidotdev/usehooks';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";

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
            if (debouncedSearchTerm && !selectedUser) {
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
    }, [debouncedSearchTerm, selectedUser]);

    const handleSelectionChange = (key: React.Key | null) => {
        const userId = Number(key);
        const user = searchResults.find(u => u.id === userId);
        if (user) {
            setSelectedUser(user);
            setSearchTerm(user.userName);
        }
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
                <Card>
                    <CardHeader>
                        <h1 className="text-2xl font-bold">{t('compose')}</h1>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Autocomplete
                                isRequired
                                label={t('recipient')}
                                placeholder={t('search_recipient_placeholder')}
                                items={searchResults}
                                inputValue={searchTerm}
                                onInputChange={(value) => {
                                    setSearchTerm(value);
                                    if (selectedUser) setSelectedUser(null); // Clear selection on new typing
                                }}
                                onSelectionChange={handleSelectionChange}
                                isLoading={isSearching}
                                allowsCustomValue={true} // Allow user to type freely
                            >
                                {(item) => (
                                    <AutocompleteItem key={item.id} textValue={item.userName}>
                                        <div className="flex gap-2 items-center">
                                            <Avatar alt={item.userName} className="flex-shrink-0" size="sm" />
                                            <span>{item.userName}</span>
                                        </div>
                                    </AutocompleteItem>
                                )}
                            </Autocomplete>

                            <Input
                                isRequired
                                label={t('subject')}
                                value={subject}
                                onValueChange={setSubject}
                            />

                            <Textarea
                                isRequired
                                label={t('content')}
                                value={content}
                                onValueChange={setContent}
                                minRows={10}
                            />

                            {error && <p className="text-danger text-sm">{error}</p>}

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    color="primary"
                                    isDisabled={isSubmitting || !selectedUser}
                                >
                                    {isSubmitting ? t('sending') : t('send_message')}
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default NewMessagePage;
