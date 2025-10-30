"use client";
import React, { useEffect, useState } from 'react';
import { stats, reports, admin, SiteStatsDto, ReportDto, CheatLogDto } from '../../../../lib/api';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCompactDisc, faArrowUp, faArrowDown, faExclamationTriangle, faShieldAlt, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const StatCard = ({ title, value, icon, link }: { title: string, value: string | number, icon: IconDefinition, link: string }) => (
    <Link href={link}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardBody>
                <div className="flex items-center">
                    <div className="mr-4">
                        <FontAwesomeIcon icon={icon} className="text-3xl text-gray-500" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                    </div>
                </div>
            </CardBody>
        </Card>
    </Link>
);

const AdminDashboard = () => {
    const t = useTranslations('Admin');
    const [siteStats, setSiteStats] = useState<SiteStatsDto | null>(null);
    const [pendingReports, setPendingReports] = useState<ReportDto[]>([]);
    const [cheatLogs, setCheatLogs] = useState<CheatLogDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsData, reportsData, cheatLogsData] = await Promise.all([
                    stats.getStats(),
                    reports.getPendingReports(),
                    admin.getCheatLogs()
                ]);
                setSiteStats(statsData);
                setPendingReports(reportsData);
                setCheatLogs(cheatLogsData);
            } catch (error) {
                console.error("Failed to fetch admin dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="container mx-auto p-4">{t('dashboard.loading')}</div>;
    }

    return (
        <div className="container mx-auto p-4 space-y-8">
            <h1 className="text-3xl font-bold mb-6">{t('dashboard.title')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('dashboard.stats.totalUsers')} value={siteStats?.totalUsers ?? 'N/A'} icon={faUsers} link="/admin/user-management" />
                <StatCard title={t('dashboard.stats.totalTorrents')} value={siteStats?.totalTorrents ?? 'N/A'} icon={faCompactDisc} link="/torrents" />
                <StatCard title={t('dashboard.stats.totalSeeders')} value={siteStats?.totalSeeders ?? 'N/A'} icon={faArrowUp} link="/torrents" />
                <StatCard title={t('dashboard.stats.totalLeechers')} value={siteStats?.totalLeechers ?? 'N/A'} icon={faArrowDown} link="/torrents" />
                <StatCard title={t('dashboard.stats.pendingReports')} value={pendingReports.length} icon={faExclamationTriangle} link="/admin/report-management" />
                <StatCard title={t('dashboard.stats.cheatLogs')} value={cheatLogs.length} icon={faShieldAlt} link="/admin/log-viewer" />
                <StatCard title={t('dashboard.stats.siteSettings')} value={t('dashboard.stats.configure')} icon={faFileAlt} link="/admin/site-settings" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>{t('dashboard.reports.title')}</CardHeader>
                    <CardBody>
                        <Table aria-label={t('dashboard.reports.title')}>
                            <TableHeader>
                                <TableColumn>{t('dashboard.reports.torrent')}</TableColumn>
                                <TableColumn>{t('dashboard.reports.reason')}</TableColumn>
                                <TableColumn>{t('dashboard.reports.reportedAt')}</TableColumn>
                                <TableColumn>{t('dashboard.reports.actions')}</TableColumn>
                            </TableHeader>
                            <TableBody items={pendingReports.slice(0, 5)}>
                                {(item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                           {item.torrent ? (
                                               <Link href={`/torrents/${item.torrent.id}`} className="text-blue-500 hover:underline">
                                                   {item.torrent.name}
                                               </Link>
                                           ) : (
                                               'N/A'
                                           )}
                                       </TableCell>
                                        <TableCell>{item.reason}</TableCell>
                                        <TableCell>{new Date(item.reportedAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                           <Link href={`/admin/reports/${item.id}`}>
                                               <Button color="primary">{t('dashboard.reports.process')}</Button>
                                           </Link>
                                       </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>{t('dashboard.cheatLogs.title')}</CardHeader>
                    <CardBody>
                        <Table aria-label={t('dashboard.cheatLogs.title')}>
                            <TableHeader>
                                <TableColumn>{t('dashboard.cheatLogs.user')}</TableColumn>
                                <TableColumn>{t('dashboard.cheatLogs.reason')}</TableColumn>
                                <TableColumn>{t('dashboard.cheatLogs.date')}</TableColumn>
                            </TableHeader>
                            <TableBody items={cheatLogs.slice(0, 5)}>
                                {(item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.userName || `User #${item.userId}`}</TableCell>
                                        <TableCell>{item.reason}</TableCell>
                                        <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;