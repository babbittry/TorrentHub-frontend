'use client';

import React, { useEffect, useState } from 'react';
import { requests, RequestDto, RequestStatus } from '@/lib/api';
import RequestListItem from './components/RequestListItem';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';

const RequestsPage = () => {
    const [requestsList, setRequestsList] = useState<RequestDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations();
    const params = useParams();
    const locale = params.locale as string;

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setIsLoading(true);
                const data = await requests.getRequests();
                setRequestsList(data);
                setError(null);
            } catch (err) {
                setError(t('requestsPage.error_fetching'));
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, [t]);

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{t('requestsPage.title')}</h1>
                <Link href={`/${locale}/requests/new`} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">
                    {t('requestsPage.createNew')}
                </Link>
            </div>

            {/* TODO: Add filters for status */}

            {isLoading ? (
                <div className="text-center py-10">
                    <p>{t('common.loading')}...</p>
                </div>
            ) : error ? (
                <div className="text-center py-10 text-red-500">
                    <p>{error}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requestsList.length > 0 ? (
                        requestsList.map(request => (
                            <RequestListItem key={request.id} request={request} locale={locale} />
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            <p>{t('requestsPage.none_found')}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RequestsPage;
