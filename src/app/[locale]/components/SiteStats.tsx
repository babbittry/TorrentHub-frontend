'use client';

import { useEffect, useState } from 'react';
import { stats as apiStats, SiteStatsDto } from '@/lib/api';
import { useTranslations } from 'next-intl';

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

        return (
            <div className="text-sm text-gray-500 dark:text-gray-400">
                <div className="grid grid-cols-1">
                    <div className="col-span-1 border-b border-gray-300 dark:border-gray-600 py-2">
                        <div className="grid grid-cols-2 gap-x-8 px-4">
                            <span>{t('stats.totalUsers')}: {stats.totalUsers}</span>
                            <span>{t('stats.userRoles.VIP')}: {vipUsers}</span>
                        </div>
                    </div>
                    <div className="col-span-1 border-b border-gray-300 dark:border-gray-600 py-2">
                        <div className="grid grid-cols-2 gap-x-8 px-4">
                            <span>{t('stats.totalTorrents')}: {stats.totalTorrents}</span>
                            <span>{t('stats.totalTorrentsSize')}: {formatBytes(stats.totalTorrentsSize ?? 0)}</span>
                        </div>
                    </div>
                    <div className="col-span-1 border-b border-gray-300 dark:border-gray-600 py-2">
                        <div className="grid grid-cols-2 gap-x-8 px-4">
                            <span>{t('stats.totalSeeders')}: {stats.totalSeeders}</span>
                            <span>{t('stats.totalLeechers')}: {stats.totalLeechers}</span>
                        </div>
                    </div>
                    <div className="col-span-1 border-b border-gray-300 dark:border-gray-600 py-2">
                        <div className="grid grid-cols-2 gap-x-8 px-4">
                            <span>{t('stats.totalUploaded')}: {formatBytes(stats.totalUploaded ?? 0)}</span>
                            <span>{t('stats.totalDownloaded')}: {formatBytes(stats.totalDownloaded ?? 0)}</span>
                        </div>
                    </div>
                    <div className="col-span-1 border-b border-gray-300 dark:border-gray-600 py-2">
                        <div className="grid grid-cols-2 gap-x-8 px-4">
                            <span>{t('stats.nominalUploaded')}: {formatBytes(stats.nominalUploaded ?? 0)}</span>
                            <span>{t('stats.nominalDownloaded')}: {formatBytes(stats.nominalDownloaded ?? 0)}</span>
                        </div>
                    </div>
                    <div className="col-span-1 py-2">
                        <div className="grid grid-cols-2 gap-x-8 px-4">
                            <span>{t('stats.totalRequests')}: {stats.totalRequests}</span>
                            <span>{t('stats.filledRequests')}: {stats.filledRequests}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('stats.title')}</h2>

            {/* User Stats */}
            <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-800 dark:text-gray-200">{t('stats.userStats')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.totalUsers')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.usersRegisteredToday')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.usersRegisteredToday}</p>
                </div>
                {stats.userRoleCounts && Object.entries(stats.userRoleCounts).map(([role, count]) => (
                    <div key={role} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t(`stats.userRoles.${role}`)}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                    </div>
                ))}
            </div>

            {/* Torrent Stats */}
            <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-800 dark:text-gray-200">{t('stats.torrentStats')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.totalTorrents')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTorrents}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.torrentsAddedToday')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.torrentsAddedToday}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.totalTorrentsSize')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatBytes(stats.totalTorrentsSize ?? 0)}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.totalSeeders')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSeeders}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.totalLeechers')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLeechers}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.totalPeers')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPeers}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.deadTorrents')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.deadTorrents}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.totalUploaded')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatBytes(stats.totalUploaded ?? 0)}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.nominalUploaded')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatBytes(stats.nominalUploaded ?? 0)}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.totalDownloaded')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatBytes(stats.totalDownloaded ?? 0)}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.nominalDownloaded')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatBytes(stats.nominalDownloaded ?? 0)}</p>
                </div>
            </div>

            {/* Community Stats */}
            <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-800 dark:text-gray-200">{t('stats.communityStats')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.totalRequests')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRequests}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.filledRequests')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.filledRequests}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.totalForumTopics')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalForumTopics}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.totalForumPosts')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalForumPosts}</p>
                </div>
            </div>
        </div>
    );
};

export default SiteStats;