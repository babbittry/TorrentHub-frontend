'use client';

import { useEffect, useState, useMemo } from 'react';
import { users as apiUsers, UserPublicProfileDto, TorrentDto, PeerDto, API_BASE_URL } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import TransferModal from '@/app/[locale]/components/TransferModal';
import { normalizeUserRoleCode } from '@/lib/utils';



const UserProfilePage = () => {
    const [profile, setProfile] = useState<UserPublicProfileDto | null>(null);
    const [uploads, setUploads] = useState<TorrentDto[]>([]);
    const [peers, setPeers] = useState<PeerDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const t = useTranslations();
    const { id } = useParams();
    const userId = parseInt(id as string);
    const { user: currentUser } = useAuth();
    const isOwnProfile = currentUser?.id === profile?.id;

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) return;
            try {
                setLoading(true);
                const [profileData, uploadsData, peersData] = await Promise.all([
                    apiUsers.getUserById(userId),
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

    useEffect(() => {
        setIsClient(true);
    }, []);

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
            { label: t('userProfile.realUpload'), value: formatBytes(profile.uploadedBytes) },
            { label: t('userProfile.realDownload'), value: formatBytes(profile.downloadedBytes) },
            { label: t('userProfile.uploadTime'), value: `${profile.totalSeedingTimeMinutes} ${t('userProfile.minutes')}` },
            { label: t('userProfile.downloadTime'), value: `${profile.totalLeechingTimeMinutes} ${t('userProfile.minutes')}` },
            { label: t('userProfile.seedingSize'), value: formatBytes(profile.seedingSize) },
            { label: t('userProfile.seedingCount'), value: profile.currentSeedingCount },
            { label: t('userProfile.leechingCount'), value: profile.currentLeechingCount },
            { label: t('userProfile.invitedBy'), value: profile.invitedBy || t('common.none') }
        ];
    }, [profile, t]);

    if (loading) {
        return <div className="text-center p-8">{t('common.loading')}...</div>;
    }

    if (!profile) {
        return <div className="text-center p-8">{t('userProfile.error')}</div>;
    }

    return (
        <div className="container mx-auto py-4 space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex flex-col items-center gap-2">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src={profile.avatar ? `${API_BASE_URL}${profile.avatar}` : undefined} />
                                <AvatarFallback>{profile.userName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <p className="font-semibold">{profile.userName}</p>
                                <p className="text-sm text-muted-foreground">{t(`stats.userRoles.${normalizeUserRoleCode(profile.role)}`)}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 flex-1">
                            <div className="text-center"><p className="text-sm text-muted-foreground">{t('userProfile.coins')}</p><p className="text-xl font-bold">{profile.coins}</p></div>
                            <div className="text-center"><p className="text-sm text-muted-foreground">{t('userProfile.registrationTime')}</p><p className="text-xl font-bold">{isClient ? new Date(profile.createdAt).toLocaleDateString() : '...'}</p></div>
                        </div>
                    </div>
                    {!isOwnProfile && (
                        <Button onClick={() => setIsTransferModalOpen(true)} className="mt-4">
                            {t('userProfile.transfer_coins')}
                        </Button>
                    )}
                </CardContent>
            </Card>

            {isClient && profile && (
                <TransferModal
                    isOpen={isTransferModalOpen}
                    onClose={() => setIsTransferModalOpen(false)}
                    recipientId={profile.id}
                    recipientName={profile.userName}
                />
            )}

            <Tabs defaultValue="stats">
                <TabsList>
                    <TabsTrigger value="stats">{t('userProfile.personalStats')}</TabsTrigger>
                    <TabsTrigger value="uploads">{t('userProfile.myUploads')}</TabsTrigger>
                    <TabsTrigger value="peers">{t('userProfile.clientInfo')}</TabsTrigger>
                </TabsList>
                <TabsContent value="stats">
                    <Card>
                        <CardContent className="pt-6">
                            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {statsItems.map(item => (
                                    <div key={item.label} className="p-2 rounded-lg bg-secondary">
                                        <dt className="text-sm text-muted-foreground">{item.label}</dt>
                                        <dd className="font-semibold text-lg">{item.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="uploads">
                    <Card>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('common.name')}</TableHead>
                                        <TableHead>{t('common.size')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {uploads.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center">{t('common.no_data')}</TableCell>
                                        </TableRow>
                                    ) : (
                                        uploads.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell><Link href={`/torrents/${item.id}`} className="text-primary hover:underline">{item.name}</Link></TableCell>
                                                <TableCell>{formatBytes(item.size)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="peers">
                    <Card>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('common.name')}</TableHead>
                                        <TableHead>{t('userProfile.client')}</TableHead>
                                        <TableHead>{t('userProfile.lastReport')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {peers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center">{t('common.no_data')}</TableCell>
                                        </TableRow>
                                    ) : (
                                        peers.map((item) => (
                                            <TableRow key={item.torrentId}>
                                                <TableCell>{item.torrentName}</TableCell>
                                                <TableCell>{item.userAgent}</TableCell>
                                                <TableCell>{isClient ? new Date(item.lastAnnounceAt).toLocaleString() : '...'}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default UserProfilePage;