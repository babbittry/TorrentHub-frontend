'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { messages, users, SendMessageRequestDto, UserPublicProfileDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@uidotdev/usehooks';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormField } from '@/components/ui/form-field';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

const NewMessagePage = () => {
    const router = useRouter();
    const t = useTranslations('messagesPage');

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<UserPublicProfileDto[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserPublicProfileDto | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
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
        setIsPopoverOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) {
            toast.error(t('error_recipient_not_selected'));
            return;
        }

        if (!subject.trim() || !content.trim()) {
            toast.error(t('error_all_fields_required'));
            return;
        }

        setIsSubmitting(true);

        const messageData: SendMessageRequestDto = {
            receiverId: selectedUser.id,
            subject,
            content,
        };

        try {
            await messages.sendMessage(messageData);
            toast.success(t('success_sending_message'));
            router.push('/messages');
        } catch (err) {
            toast.error(t('error_sending_message'));
            console.error(err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{t('compose')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label>{t('recipient')}</Label>
                                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={isPopoverOpen}
                                            className="w-full justify-between"
                                        >
                                            {selectedUser ? selectedUser.userName : t('search_recipient_placeholder')}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput 
                                                placeholder={t('search_recipient_placeholder')}
                                                onValueChange={(search) => {
                                                    setSearchTerm(search);
                                                    if (selectedUser) setSelectedUser(null);
                                                }}
                                            />
                                            <CommandList>
                                                {isSearching && <CommandEmpty>{t('common.loading')}...</CommandEmpty>}
                                                {!isSearching && searchResults.length === 0 && debouncedSearchTerm && <CommandEmpty>{t('no_users_found')}</CommandEmpty>}
                                                <CommandGroup>
                                                    {searchResults.map((user) => (
                                                        <CommandItem
                                                            key={user.id}
                                                            value={user.userName}
                                                            onSelect={() => handleSelectUser(user)}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarImage src={user.avatar || undefined} />
                                                                    <AvatarFallback>{user.userName.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <span>{user.userName}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <FormField
                                label={t('subject')}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                maxLength={200}
                                required
                            />
                             <p className="text-sm text-muted-foreground text-right">{`${subject.length} / 200`}</p>

                            <div className="space-y-2">
                                <Label htmlFor="content">{t('content')}</Label>
                                <Textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="min-h-[200px]"
                                    maxLength={500}
                                    required
                                />
                                <p className="text-sm text-muted-foreground text-right">{`${content.length} / 500`}</p>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !selectedUser}
                                >
                                    {isSubmitting ? t('sending') : t('send_message')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default NewMessagePage;
