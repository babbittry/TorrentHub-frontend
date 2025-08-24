'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { requests, RequestDto, RequestStatus } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import {Divider} from "@heroui/divider";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { User } from "@heroui/user";
import { Chip } from "@heroui/chip";

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
                await fetchRequestDetails();
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
                await fetchRequestDetails();
            } catch (err) {
                alert(t('requestsPage.error_filling'));
                console.error(err);
            }
        }
    };

    const inputClassNames = {
        inputWrapper: "bg-transparent border shadow-sm border-default-300/50 hover:border-default-400",
    };

    if (isLoading) {
        return <div className="text-center py-20">{t('common.loading')}...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-danger">{error}</div>;
    }

    if (!request) {
        return <div className="text-center py-20">{t('requestsPage.not_found')}</div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 space-y-8">
            <Card>
                <CardHeader className="flex flex-col items-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{request.title}</h1>
                    <p className="text-sm text-default-500">
                        {request.requestedByUser ? (
                            t.rich('requestsPage.meta_requested_by', {
                                username: request.requestedByUser.userName || 'Anonymous',
                                date: new Date(request.createdAt).toLocaleString(),
                                userLink: (chunks) => <Link href={`/${locale}/users/${request.requestedByUser?.id}`} className="text-primary hover:underline">{chunks}</Link>
                            })
                        ) : (
                            t('requestsPage.meta_anonymous_request', {
                                date: new Date(request.createdAt).toLocaleString()
                            })
                        )}
                    </p>
                </CardHeader>
                <CardBody>
                    <h2 className="text-xl font-semibold mb-3">{t('common.description')}</h2>
                    <p className="text-default-700 whitespace-pre-wrap">{request.description}</p>
                </CardBody>
                <Divider />
                <CardFooter className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <h3 className="font-semibold text-default-500">{t('requestsPage.status')}</h3>
                        <Chip color={request.status === RequestStatus.Filled ? "success" : "warning"} size="md" variant="flat">
                            {t(`requestsPage.status_${request.status.toLowerCase()}`)}
                        </Chip>
                    </div>
                    <div>
                        <h3 className="font-semibold text-default-500">{t('requestsPage.current_bounty')}</h3>
                        <p className="font-bold text-lg text-warning">{request.bountyAmount} Coins</p>
                    </div>
                    {request.status === RequestStatus.Filled && (
                        <div>
                            <h3 className="font-semibold text-default-500">{t('requestsPage.filled_by')}</h3>
                            <p>
                                <Link href={`/${locale}/users/${request.filledByUser?.id}`} className="text-primary hover:underline">{request.filledByUser?.userName}</Link>
                                {t('requestsPage.with_torrent')} <Link href={`/${locale}/torrents/${request.filledWithTorrentId}`} className="text-primary hover:underline">#{request.filledWithTorrentId}</Link>
                            </p>
                        </div>
                    )}
                </CardFooter>
            </Card>

            {request.status !== RequestStatus.Filled && (
                <Card>
                    <CardBody className="space-y-8">
                        <form onSubmit={handleAddBounty} className="space-y-4">
                            <h3 className="text-xl font-semibold">{t('requestsPage.add_bounty')}</h3>
                            <Input
                                type="number"
                                label={t('requestsPage.bounty_amount')}
                                placeholder="e.g., 100"
                                value={bountyAmount}
                                onValueChange={setBountyAmount}
                                labelPlacement="outside"
                                classNames={inputClassNames}
                            />
                            <Button type="submit" color="warning">{t('requestsPage.submit_bounty')}</Button>
                        </form>

                        <Divider />

                        <form onSubmit={handleFillRequest} className="space-y-4">
                            <h3 className="text-xl font-semibold">{t('requestsPage.fill_request')}</h3>
                            <Input
                                type="number"
                                label={t('requestsPage.torrent_id')}
                                placeholder={t('requestsPage.enter_torrent_id')}
                                value={torrentId}
                                onValueChange={setTorrentId}
                                labelPlacement="outside"
                                classNames={inputClassNames}
                            />
                            <Button type="submit" color="success">{t('requestsPage.fill_button')}</Button>
                        </form>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

export default RequestDetailPage;
