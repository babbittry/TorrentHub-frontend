'use client';

import { useEffect, useState, useMemo } from 'react';
import { users as apiUsers, UserProfileDetailDto, TorrentDto, PeerDto } from '@/lib/api';
import { API_BASE_URL } from '@/lib/apiClient';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Card, CardBody } from "@heroui/card";
import { User } from "@heroui/user";
import { Tabs, Tab } from "@heroui/tabs";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Link } from '@/i18n/navigation';



const UserProfilePage = () => {
    const [profile, setProfile] = useState<UserProfileDetailDto | null>(null);
    const [uploads, setUploads] = useState<TorrentDto[]>([]);
    const [peers, setPeers] = useState<PeerDto[]>([]);
    const [loading, setLoading] = useState(true);
    const t = useTranslations();
    const { id } = useParams();
    const userId = parseInt(id as string);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) return;
            try {
                setLoading(true);
                const [profileData, uploadsData, peersData] = await Promise.all([
                    apiUsers.getUserProfile(userId),
                    apiUsers.getUserUploads(userId),
                    apiUsers.getUserPeers(userId),
                ]);
                setProfile(profileData);
                setUploads(uploadsData);
                setPeers(peersData);
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const statsItems = useMemo(() => {
        if (!profile) return [];
        return [
            { label: t('userProfile.nominalUpload'), value: formatBytes(profile.nominalUploadedBytes) },
            { label: t('userProfile.nominalDownload'), value: formatBytes(profile.nominalDownloadedBytes) },
            { label: t('userProfile.realUpload'), value: formatBytes(profile.uploadedBytes) },
            { label: t('userProfile.realDownload'), value: formatBytes(profile.downloadedBytes) },
            { label: t('userProfile.uploadingCount'), value: profile.currentSeedingCount },
            { label: t('userProfile.downloadingCount'), value: profile.currentLeechingCount },
            { label: t('userProfile.uploadTime'), value: `${profile.totalSeedingTimeMinutes} ${t('userProfile.minutes')}` },
            { label: t('userProfile.downloadTime'), value: `${profile.totalLeechingTimeMinutes} ${t('userProfile.minutes')}` },
        ];
    }, [profile, t]);

    if (loading) {
        return <div className="text-center p-8">{t('common.loading')}...</div>;
    }

    if (!profile) {
        return <div className="text-center p-8">{t('userProfile.error')}</div>;
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <Card>
                <CardBody>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <User
                            name={profile.userName}
                            description={t(`stats.userRoles.${profile.role}`)}
                            avatarProps={{
                                src: profile.avatar ? `${API_BASE_URL}${profile.avatar}` : undefined,
                                size: "lg",
                                className: "w-24 h-24 text-large"
                            }}
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                            <div className="text-center"><p className="text-sm text-default-500">{t('userProfile.coins')}</p><p className="text-xl font-bold">{profile.coins}</p></div>
                            <div className="text-center"><p className="text-sm text-default-500">{t('userProfile.seedingSize')}</p><p className="text-xl font-bold">{formatBytes(profile.seedingSize)}</p></div>
                            <div className="text-center"><p className="text-sm text-default-500">{t('userProfile.invitedBy')}</p><p className="text-xl font-bold">{profile.invitedBy || t('userProfile.selfRegistered')}</p></div>
                            <div className="text-center"><p className="text-sm text-default-500">{t('userProfile.registrationTime')}</p><p className="text-xl font-bold">{new Date(profile.createdAt).toLocaleDateString()}</p></div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Tabs aria-label="User profile details">
                <Tab key="stats" title={t('userProfile.personalStats')}>
                    <Card>
                        <CardBody>
                            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {statsItems.map(item => (
                                    <div key={item.label} className="p-2 rounded-lg bg-content2">
                                        <dt className="text-sm text-default-500">{item.label}</dt>
                                        <dd className="font-semibold text-lg">{item.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </CardBody>
                    </Card>
                </Tab>
                <Tab key="uploads" title={t('userProfile.myUploads')}>
                    <Card>
                        <CardBody>
                            <Table aria-label="User uploads">
                                <TableHeader>
                                    <TableColumn key="name">{t('common.name')}</TableColumn>
                                    <TableColumn key="size">{t('common.size')}</TableColumn>
                                </TableHeader>
                                <TableBody items={uploads} emptyContent={t('common.no_data')}>
                                    {(item) => (
                                        <TableRow key={item.id}>
                                            <TableCell><Link href={`/torrents/${item.id}`} className="text-primary hover:underline">{item.name}</Link></TableCell>
                                            <TableCell>{formatBytes(item.size)}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>
                </Tab>
                <Tab key="peers" title={t('userProfile.clientInfo')}>
                    <Card>
                        <CardBody>
                            <Table aria-label="User active peers">
                                <TableHeader>
                                    <TableColumn key="torrentName">{t('common.name')}</TableColumn>
                                    <TableColumn key="userAgent">{t('userProfile.client')}</TableColumn>
                                    <TableColumn key="lastAnnounceAt">{t('userProfile.lastReport')}</TableColumn>
                                </TableHeader>
                                <TableBody items={peers} emptyContent={t('common.no_data')}>
                                    {(item) => (
                                        <TableRow key={item.torrentId}>
                                            <TableCell>{item.torrentName}</TableCell>
                                            <TableCell>{item.userAgent}</TableCell>
                                            <TableCell>{new Date(item.lastAnnounceAt).toLocaleString()}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>
        </div>
    );
};

export default UserProfilePage;