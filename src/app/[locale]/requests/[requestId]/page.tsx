'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { requests, RequestDto, RequestStatus } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const RequestDetailPage = () => {
    const params = useParams();
    const requestId = Number(params.requestId);
    const locale = params.locale as string;

    const t = useTranslations();
    const [request, setRequest] = useState<RequestDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [bountyAmount, setBountyAmount] = useState('');
    const [torrentId, setTorrentId] = useState('');

    const fetchRequestDetails = useCallback(async () => {
        if (!requestId) return;
        try {
            setIsLoading(true);
            const data = await requests.getRequestById(requestId);
            setRequest(data);
            setError(null);
        } catch (err) {
            setError(t('requestsPage.error_fetching_details'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [requestId, t]);

    useEffect(() => {
        fetchRequestDetails();
    }, [fetchRequestDetails]);

    const handleAddBounty = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(bountyAmount);
        if (amount > 0) {
            try {
                await requests.addBounty(requestId, { amount });
                setBountyAmount('');
                await fetchRequestDetails(); // Refresh details
            } catch (err) {
                alert(t('requestsPage.error_adding_bounty'));
                console.error(err);
            }
        }
    };

    const handleFillRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        const id = Number(torrentId);
        if (id > 0) {
            try {
                await requests.fillRequest(requestId, { torrentId: id });
                setTorrentId('');
                await fetchRequestDetails(); // Refresh details
            } catch (err) {
                alert(t('requestsPage.error_filling'));
                console.error(err);
            }
        }
    };

    if (isLoading) {
        return <div className="text-center py-20">{t('common.loading')}...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-500">{error}</div>;
    }

    if (!request) {
        return <div className="text-center py-20">{t('requestsPage.not_found')}</div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                {/* Header */}
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{request.title}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {request.requestedByUser ? (
                            t.rich('requestsPage.meta_requested_by', {
                                username: request.requestedByUser.userName || 'Anonymous',
                                date: new Date(request.createdAt).toLocaleString(),
                                userLink: (chunks) => <Link href={`/${locale}/users/${request.requestedByUser?.id}`} className="text-blue-600 hover:underline">{chunks}</Link>
                            })
                        ) : (
                            t('requestsPage.meta_anonymous_request', {
                                date: new Date(request.createdAt).toLocaleString()
                            })
                        )}
                    </p>
                </div>

                {/* Body */}
                <div className="py-6">
                    <h2 className="text-xl font-semibold mb-3">{t('common.description')}</h2>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{request.description}</p>
                </div>

                {/* Status & Bounty */}
                <div className="py-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold">{t('requestsPage.status')}</h3>
                        <p className={`font-bold ${request.status === RequestStatus.Filled ? 'text-green-500' : 'text-yellow-500'}`}>
                            {t(`requestsPage.status_${request.status.toLowerCase()}`)}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold">{t('requestsPage.current_bounty')}</h3>
                        <p className="font-bold text-yellow-500">{request.bountyAmount} Coins</p>
                    </div>
                    {request.status === RequestStatus.Filled && (
                        <div>
                            <h3 className="font-semibold">{t('requestsPage.filled_by')}</h3>
                            <p>
                                <Link href={`/${locale}/users/${request.filledByUser?.id}`} className="text-blue-600 hover:underline">{request.filledByUser?.userName}</Link>
                                {t('requestsPage.with_torrent')} <Link href={`/${locale}/torrents/${request.filledWithTorrentId}`} className="text-blue-600 hover:underline">#{request.filledWithTorrentId}</Link>
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {request.status !== RequestStatus.Filled && (
                    <div className="py-6 border-t border-gray-200 dark:border-gray-700 space-y-8">
                        {/* Add Bounty Form */}
                        <form onSubmit={handleAddBounty} className="space-y-4">
                            <h3 className="text-xl font-semibold">{t('requestsPage.add_bounty')}</h3>
                            <div>
                                <label htmlFor="bounty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('requestsPage.bounty_amount')}</label>
                                <input
                                    type="number"
                                    id="bounty"
                                    value={bountyAmount}
                                    onChange={(e) => setBountyAmount(e.target.value)}
                                    className="mt-1 block w-full md:w-1/3 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="e.g., 100"
                                />
                            </div>
                            <button type="submit" className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600">{t('requestsPage.submit_bounty')}</button>
                        </form>

                        {/* Fill Request Form */}
                        <form onSubmit={handleFillRequest} className="space-y-4">
                            <h3 className="text-xl font-semibold">{t('requestsPage.fill_request')}</h3>
                            <div>
                                <label htmlFor="torrentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('requestsPage.torrent_id')}</label>
                                <input
                                    type="number"
                                    id="torrentId"
                                    value={torrentId}
                                    onChange={(e) => setTorrentId(e.target.value)}
                                    className="mt-1 block w-full md:w-1/3 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder={t('requestsPage.enter_torrent_id')}
                                />
                            </div>
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700">{t('requestsPage.fill_button')}</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestDetailPage;
