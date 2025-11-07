'use client';
import React, { useEffect, useState } from 'react';
import { polls, PollDto, CreatePollDto } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { FormField } from '@/components/ui/form-field';
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

const AddPollPage = () => {
    const t = useTranslations('Admin');
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [expiresAt, setExpiresAt] = useState('');
    const [existingPolls, setExistingPolls] = useState<PollDto[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPolls = async () => {
        try {
            setLoading(true);
            const pollsData = await polls.getPolls();
            setExistingPolls(pollsData);
        } catch (error) {
            console.error("Failed to fetch polls:", error);
            toast.error(t('addPoll.alert.fetchFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolls();
    }, []);

    const handleAddOption = () => {
        if (options.length < 10) { // Limit options to 10
            setOptions([...options, '']);
        } else {
            toast.warning(t('addPoll.alert.maxOptions'));
        }
    };

    const handleRemoveOption = (index: number) => {
        if (options.length > 2) { // Keep at least 2 options
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        } else {
            toast.warning(t('addPoll.alert.minOptions'));
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || options.some(o => !o.trim())) {
            toast.error(t('addPoll.alert.fillOut'));
            return;
        }
        const pollData: CreatePollDto = {
            question,
            options,
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined
        };
        try {
            await polls.createPoll(pollData);
            toast.success(t('addPoll.alert.createSuccess'));
            setQuestion('');
            setOptions(['', '']);
            setExpiresAt('');
            fetchPolls(); // Refresh the list of polls
        } catch (error) {
            console.error("Failed to create poll:", error);
            toast.error(t('addPoll.alert.createFailed'));
        }
    };

    const handleDeletePoll = async (id: number) => {
        if (window.confirm(t('addPoll.alert.deleteConfirm'))) {
            try {
                await polls.deletePoll(id);
                toast.success(t('addPoll.alert.deleteSuccess'));
                fetchPolls(); // Refresh the list
            } catch (error) {
                console.error('Failed to delete poll:', error);
                toast.error(t('addPoll.alert.deleteFailed'));
            }
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-8">
            <h1 className="text-3xl font-bold mb-6">{t('addPoll.title')}</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{t('addPoll.createNewPoll')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormField
                            id="question"
                            label={t('addPoll.questionLabel')}
                            type="text"
                            value={question}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
                            placeholder={t('addPoll.questionPlaceholder')}
                            maxLength={255}
                            required
                        />

                        <FormField
                            id="expiresAt"
                            label={t('addPoll.expiresAtLabel')}
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiresAt(e.target.value)}
                        />

                        <div>
                            <label className="block text-sm font-medium mb-2">{t('addPoll.optionsLabel')}</label>
                            {options.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2 mb-2">
                                    <FormField
                                        id={`option-${index}`}
                                        type="text"
                                        value={option}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOptionChange(index, e.target.value)}
                                        placeholder={t('addPoll.optionPlaceholder', { index: index + 1 })}
                                        maxLength={255}
                                        containerClassName="flex-grow"
                                    />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveOption(index)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={handleAddOption}>
                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                {t('addPoll.addOptionButton')}
                            </Button>
                        </div>
                        <Button type="submit">
                            {t('addPoll.createPollButton')}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('addPoll.existingPolls')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>{t('addPoll.loading')}</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('addPoll.table.question')}</TableHead>
                                    <TableHead>{t('addPoll.table.totalVotes')}</TableHead>
                                    <TableHead>{t('addPoll.table.createdAt')}</TableHead>
                                    <TableHead className="text-right">{t('addPoll.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {existingPolls.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.question}</TableCell>
                                        <TableCell>{item.totalVotes}</TableCell>
                                        <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeletePoll(item.id)}>
                                                <FontAwesomeIcon icon={faTrash} className="text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AddPollPage;
