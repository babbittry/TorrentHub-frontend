'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { requests, CreateRequestDto } from '@/lib/api';
import { useTranslations } from 'next-intl';

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
            // Redirect to the new request's detail page
            router.push(`/${locale}/requests/${newRequest.id}`);
        } catch (err) {
            setError(t('requestsPage.error_creating_request'));
            console.error(err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('requestsPage.createNew')}</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.title')}</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.description')}</label>
                        <textarea
                            id="description"
                            rows={6}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="bounty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('requestsPage.initial_bounty')} ({t('common.optional')})</label>
                        <input
                            type="number"
                            id="bounty"
                            value={initialBounty}
                            onChange={(e) => setInitialBounty(e.target.value)}
                            className="mt-1 block w-full md:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., 500"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? t('common.submitting') : t('requestsPage.submit_request')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewRequestPage;
