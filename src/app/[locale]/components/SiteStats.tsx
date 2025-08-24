'use client';

import { useEffect, useState } from 'react';
import { stats as apiStats, SiteStatsDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Card, CardBody, CardHeader } from "@heroui/card";
import {Divider} from "@heroui/divider";
import React from 'react';

interface SiteStatsProps {
    mode: 'simple' | 'full';
}

const SiteStats = ({ mode }: SiteStatsProps) => {
    const [stats, setStats] = useState<SiteStatsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const t = useTranslations();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const fetchedStats = await apiStats.getStats();
                setStats(fetchedStats);
            } catch (error) {
                console.error('Failed to fetch site stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    if (loading) {
        return <div>{t('common.loading')}...</div>;
    }

    if (!stats) {
        return <div>{t('stats.error')}</div>;
    }

    if (mode === 'simple') {
        const vipUsers = stats.userRoleCounts?.VIP ?? 0;
        const simpleStats = [
            { label: t('stats.totalUsers'), value: stats.totalUsers },
            { label: t('stats.userRoles.VIP'), value: vipUsers },
            { label: t('stats.totalTorrents'), value: stats.totalTorrents },
            { label: t('stats.totalTorrentsSize'), value: formatBytes(stats.totalTorrentsSize ?? 0) },
            { label: t('stats.totalSeeders'), value: stats.totalSeeders },
            { label: t('stats.totalLeechers'), value: stats.totalLeechers },
            { label: t('stats.totalUploaded'), value: formatBytes(stats.totalUploaded ?? 0) },
            { label: t('stats.totalDownloaded'), value: formatBytes(stats.totalDownloaded ?? 0) },
            { label: t('stats.nominalUploaded'), value: formatBytes(stats.nominalUploaded ?? 0) },
            { label: t('stats.nominalDownloaded'), value: formatBytes(stats.nominalDownloaded ?? 0) },
            { label: t('stats.totalRequests'), value: stats.totalRequests },
            { label: t('stats.filledRequests'), value: stats.filledRequests },
        ];

        // Group stats into pairs for two-column layout
        const groupedStats = simpleStats.reduce((acc, item, index) => {
            if (index % 2 === 0) {
                acc.push([item]);
            } else {
                acc[acc.length - 1].push(item);
            }
            return acc;
        }, [] as { label: string; value: React.ReactNode }[][]);

        return (
            <Card>
                <CardBody>
                    <div className="space-y-2">
                        {groupedStats.map((pair, index) => (
                            <React.Fragment key={index}>
                                <div className="grid grid-cols-2 gap-x-8 py-1">
                                    <span><strong>{pair[0].label}:</strong> {pair[0].value}</span>
                                    {pair[1] && (
                                        <span><strong>{pair[1].label}:</strong> {pair[1].value}</span>
                                    )}
                                </div>
                                {index < groupedStats.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </div>
                </CardBody>
            </Card>
        );
    }

    const StatCard = ({ label, value }: { label: string, value: React.ReactNode }) => (
        <Card shadow="sm">
            <CardBody className="text-center">
                <p className="text-sm text-default-600">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
            </CardBody>
        </Card>
    );

    return (
        <Card>
            <CardHeader>
                <h2 className="text-2xl font-bold">{t('stats.title')}</h2>
            </CardHeader>
            <CardBody className="space-y-6">
                <div>
                    <h3 className="text-xl font-semibold mb-2">{t('stats.userStats')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <StatCard label={t('stats.totalUsers')} value={stats.totalUsers} />
                        <StatCard label={t('stats.usersRegisteredToday')} value={stats.usersRegisteredToday} />
                        <StatCard label={t('stats.totalBannedUsers')} value={stats.totalBannedUsers} />
                        {stats.userRoleCounts && Object.entries(stats.userRoleCounts).map(([role, count]) => (
                            <StatCard key={role} label={t(`stats.userRoles.${role}`)} value={count} />
                        ))}
                    </div>
                </div>
                <Divider />
                <div>
                    <h3 className="text-xl font-semibold mt-4 mb-2">{t('stats.torrentStats')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <StatCard label={t('stats.totalTorrents')} value={stats.totalTorrents} />
                        <StatCard label={t('stats.torrentsAddedToday')} value={stats.torrentsAddedToday} />
                        <StatCard label={t('stats.totalTorrentsSize')} value={formatBytes(stats.totalTorrentsSize ?? 0)} />
                        <StatCard label={t('stats.totalSeeders')} value={stats.totalSeeders} />
                        <StatCard label={t('stats.totalLeechers')} value={stats.totalLeechers} />
                        <StatCard label={t('stats.totalPeers')} value={stats.totalPeers} />
                        <StatCard label={t('stats.deadTorrents')} value={stats.deadTorrents} />
                        <StatCard label={t('stats.totalUploaded')} value={formatBytes(stats.totalUploaded ?? 0)} />
                        <StatCard label={t('stats.nominalUploaded')} value={formatBytes(stats.nominalUploaded ?? 0)} />
                        <StatCard label={t('stats.totalDownloaded')} value={formatBytes(stats.totalDownloaded ?? 0)} />
                        <StatCard label={t('stats.nominalDownloaded')} value={formatBytes(stats.nominalDownloaded ?? 0)} />
                    </div>
                </div>
                <Divider />
                <div>
                    <h3 className="text-xl font-semibold mt-4 mb-2">{t('stats.communityStats')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <StatCard label={t('stats.totalRequests')} value={stats.totalRequests} />
                        <StatCard label={t('stats.filledRequests')} value={stats.filledRequests} />
                        <StatCard label={t('stats.totalForumTopics')} value={stats.totalForumTopics} />
                        <StatCard label={t('stats.totalForumPosts')} value={stats.totalForumPosts} />
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default SiteStats;
