'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { requests, CreateRequestDto } from '@/lib/api';
import { usePublicSettings, isAuthenticatedSettings } from '@/context/PublicSettingsContext';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";

const NewRequestPage = () => {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const t = useTranslations();
    const { publicSettings, isLoading: settingsLoading } = usePublicSettings();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [initialBounty, setInitialBounty] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 检查求种系统是否启用
    if (!settingsLoading && publicSettings && isAuthenticatedSettings(publicSettings)) {
        if (!publicSettings.isRequestSystemEnabled) {
            return (
                <div className="container mx-auto py-8 max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl text-center">{t('feature.requests_disabled')}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-muted-foreground">{t('feature.requests_disabled_desc')}</p>
                            {publicSettings.contactEmail && (
                                <p className="text-sm text-muted-foreground">
                                    {t('feature.contact_admin')}: {publicSettings.contactEmail}
                                </p>
                            )}
                            <Button asChild>
                                <Link href="/">{t('feature.back_to_home')}</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }
    }

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
            router.push(`/requests/${newRequest.id}`);
        } catch (err) {
            setError(t('requestsPage.error_creating_request'));
            console.error(err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <Card className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">{t('requestsPage.createNew')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            label={t('common.title')}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('requestsPage.enter_request_title')}
                            maxLength={100}
                            required
                        />
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('common.description')}</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('requestsPage.enter_request_description')}
                                maxLength={500}
                                required
                            />
                        </div>
                        <FormField
                            label={`${t('requestsPage.initial_bounty')} (${t('common.optional')})`}
                            type="number"
                            value={initialBounty}
                            onChange={(e) => setInitialBounty(e.target.value)}
                            placeholder="e.g., 500"
                        />
                        {publicSettings && isAuthenticatedSettings(publicSettings) && (
                            <p className="text-sm text-muted-foreground">
                                {t('requestsPage.bounty_help_text', {
                                    baseCost: publicSettings.createRequestCost,
                                    totalCost: publicSettings.createRequestCost + (Number(initialBounty) || 0)
                                })}
                            </p>
                        )}

                        {error && <p className="text-destructive text-sm">{error}</p>}

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? t('common.loading') : t('requestsPage.submit_request')}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
};

export default NewRequestPage;
