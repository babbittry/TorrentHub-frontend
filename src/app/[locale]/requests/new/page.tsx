'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { requests, CreateRequestDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";

const NewRequestPage = () => {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const t = useTranslations();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [initialBounty, setInitialBounty] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!title.trim() || !description.trim()) {
            setError(t('requestsPage.error_title_desc_required'));
            setIsSubmitting(false);
            return;
        }

        const requestData: CreateRequestDto = {
            title,
            description,
            initialBounty: Number(initialBounty) || 0,
        };

        try {
            const newRequest = await requests.createRequest(requestData);
            router.push(`/${locale}/requests/${newRequest.id}`);
        } catch (err) {
            setError(t('requestsPage.error_creating_request'));
            console.error(err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <Card className="max-w-2xl mx-auto p-4">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="flex flex-col items-center pb-4">
                        <h1 className="text-3xl font-bold">{t('requestsPage.createNew')}</h1>
                    </CardHeader>
                    <CardBody className="gap-6">
                        <Input
                            isRequired
                            label={t('common.title')}
                            value={title}
                            onValueChange={setTitle}
                            labelPlacement="outside"
                            placeholder={t('requestsPage.enter_request_title')}
                        />
                        <Textarea
                            isRequired
                            label={t('common.description')}
                            value={description}
                            onValueChange={setDescription}
                            labelPlacement="outside"
                            placeholder={t('requestsPage.enter_request_description')}
                        />
                        <Input
                            label={`${t('requestsPage.initial_bounty')} (${t('common.optional')})`}
                            type="number"
                            value={initialBounty}
                            onValueChange={setInitialBounty}
                            labelPlacement="outside"
                            placeholder="e.g., 500"
                        />

                        {error && <p className="text-danger text-sm">{error}</p>}

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                color="primary"
                                isLoading={isSubmitting}
                            >
                                {t('requestsPage.submit_request')}
                            </Button>
                        </div>
                    </CardBody>
                </form>
            </Card>
        </div>
    );
};

export default NewRequestPage;
