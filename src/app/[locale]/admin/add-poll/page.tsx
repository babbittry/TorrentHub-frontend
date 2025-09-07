"use client";
import React, { useEffect, useState } from 'react';
import { polls, PollDto, CreatePollDto } from '@/lib/api';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";
import { CustomInput } from '../../components/CustomInputs';
import { Button } from "@heroui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolls();
    }, []);

    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    const handleRemoveOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || options.some(o => !o.trim())) {
            alert(t('addPoll.alert.fillOut'));
            return;
        }
        const pollData: CreatePollDto = {
            question,
            options,
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined
        };
        try {
            await polls.createPoll(pollData);
            setQuestion('');
            setOptions(['', '']);
            setExpiresAt('');
            fetchPolls(); // Refresh the list of polls
        } catch (error) {
            console.error("Failed to create poll:", error);
            alert(t('addPoll.alert.createFailed'));
        }
    };

    const handleDeletePoll = async (id: number) => {
        if (window.confirm(t('addPoll.alert.deleteConfirm'))) {
            try {
                await polls.deletePoll(id);
                fetchPolls(); // Refresh the list
            } catch (error) {
                console.error('Failed to delete poll:', error);
                alert(t('addPoll.alert.deleteFailed'));
            }
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-8">
            <h1 className="text-3xl font-bold mb-6">{t('addPoll.title')}</h1>

            <Card>
                <CardHeader>{t('addPoll.createNewPoll')}</CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="question" className="block text-sm font-medium text-gray-700">{t('addPoll.questionLabel')}</label>
                            <CustomInput
                                id="question"
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder={t('addPoll.questionPlaceholder')}
                                fullWidth
                                maxLength={255}
                            />
                        </div>

                        <div>
                            <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">{t('addPoll.expiresAtLabel')}</label>
                            <CustomInput
                                id="expiresAt"
                                type="datetime-local"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                fullWidth
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('addPoll.optionsLabel')}</label>
                            {options.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2 mb-2">
                                    <CustomInput
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={t('addPoll.optionPlaceholder', { index: index + 1 })}
                                        fullWidth
                                        maxLength={255}
                                    />
                                    <Button isIconOnly onClick={() => handleRemoveOption(index)} color="danger" variant="flat">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </div>
                            ))}
                            <Button onClick={handleAddOption} startContent={<FontAwesomeIcon icon={faPlus} />}>
                                {t('addPoll.addOptionButton')}
                            </Button>
                        </div>
                        <Button type="submit" color="primary">
                            {t('addPoll.createPollButton')}
                        </Button>
                    </form>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>{t('addPoll.existingPolls')}</CardHeader>
                <CardBody>
                    {loading ? (
                        <p>{t('addPoll.loading')}</p>
                    ) : (
                        <Table aria-label={t('addPoll.existingPolls')}>
                            <TableHeader>
                                <TableColumn>{t('addPoll.table.question')}</TableColumn>
                                <TableColumn>{t('addPoll.table.totalVotes')}</TableColumn>
                                <TableColumn>{t('addPoll.table.createdAt')}</TableColumn>
                                <TableColumn>{t('addPoll.table.actions')}</TableColumn>
                            </TableHeader>
                            <TableBody items={existingPolls}>
                                {(item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.question}</TableCell>
                                        <TableCell>{item.totalVotes}</TableCell>
                                        <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button isIconOnly onClick={() => handleDeletePoll(item.id)} color="danger" variant="light">
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default AddPollPage;
