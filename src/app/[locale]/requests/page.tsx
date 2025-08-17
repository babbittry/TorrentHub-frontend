'use client';

import React, { useEffect, useState } from 'react';
import { requests, RequestDto } from '@/lib/api';
import RequestListItem from './components/RequestListItem';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';

const RequestsPage = () => {
    const [requestsList, setRequestsList] = useState<RequestDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('All'); // Default to All
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const t = useTranslations();
    const params = useParams();
    const locale = params.locale as string;

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setIsLoading(true);
                const status = statusFilter === 'All' ? undefined : statusFilter;
                const data = await requests.getRequests(status, sortBy, sortOrder);
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
    }, [t, statusFilter, sortBy, sortOrder]);

    const handleSort = (newSortBy: string) => {
        if (newSortBy === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
    };

    const renderFilterButton = (status: string, label: string) => {
        const isActive = statusFilter === status;
        return (
            <button
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                        : 'bg-[var(--color-input-background)] text-[var(--color-foreground)] hover:bg-[var(--color-border)]'
                }`}>
                {label}
            </button>
        );
    };

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <h1 className="text-4xl font-extrabold text-[var(--color-primary)] mb-8 text-center drop-shadow-lg">{t('requestsPage.title')}</h1>

            <div className="card mb-8 p-4">
                <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        {renderFilterButton('All', t('requestsPage.filter_all'))}
                        {renderFilterButton('Pending', t('requestsPage.filter_pending'))}
                        {renderFilterButton('Filled', t('requestsPage.filter_filled'))}
                    </div>
                    <Link href={`/${locale}/requests/new`} className="btn-primary">
                        {t('requestsPage.createNew')}
                    </Link>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-10">
                    <p>{t('common.loading')}...</p>
                </div>
            ) : error ? (
                <div className="text-center py-10 text-red-500">
                    <p>{error}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Sortable Header */}
                    <div className="flex items-center bg-[var(--color-card-background)] p-3 rounded-lg shadow-sm font-bold text-[var(--color-foreground)] border-b-2 border-[var(--color-primary)]">
                        <div className="flex-grow grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-5 cursor-pointer" onClick={() => handleSort('title')}>{t('common.title')} {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}</div>
                            <div className="col-span-2 text-center cursor-pointer" onClick={() => handleSort('bountyAmount')}>{t('requestsPage.bounty')} {sortBy === 'bountyAmount' && (sortOrder === 'asc' ? '↑' : '↓')}</div>
                            <div className="col-span-1 text-center cursor-pointer" onClick={() => handleSort('status')}>{t('requestsPage.status')} {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}</div>
                            <div className="col-span-3 text-center">{t('requestsPage.requested_by')}</div>
                            <div className="col-span-1 text-center cursor-pointer" onClick={() => handleSort('createdAt')}>{t('common.date')} {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}</div>
                        </div>
                    </div>
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
