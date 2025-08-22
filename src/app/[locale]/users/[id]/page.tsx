'use client';

import { useEffect, useState } from 'react';
import { users as apiUsers, UserProfileDetailDto, TorrentDto, PeerDto } from '@/lib/api';
import { API_BASE_URL } from '@/lib/apiClient';
import { useTranslations } from 'next-intl';

interface UserProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

const UserProfilePage = ({ params }: UserProfilePageProps) => {
    const [profile, setProfile] = useState<UserProfileDetailDto | null>(null);
    const [uploads, setUploads] = useState<TorrentDto[]>([]);
    const [peers, setPeers] = useState<PeerDto[]>([]);
    const [loading, setLoading] = useState(true);
    const t = useTranslations();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const resolvedParams = await params;
                const [profileData, uploadsData, peersData] = await Promise.all([
                    apiUsers.getUserProfile(parseInt(resolvedParams.id)),
                    apiUsers.getUserUploads(parseInt(resolvedParams.id)),
                    apiUsers.getUserPeers(parseInt(resolvedParams.id)),
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
    }, [params]);

    if (loading) {
        return <div>{t('common.loading')}...</div>;
    }

    if (!profile) {
        return <div>{t('userProfile.error')}</div>;
    }

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="container mx-auto p-4">
            <div className="card mb-4">
                <h2 className="text-2xl font-bold mb-4">{t('userProfile.userInfo')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><strong>{t('userProfile.avatar')}:</strong> <img src={profile.avatar ? `${API_BASE_URL}${profile.avatar}` : ''} alt="avatar" className="w-20 h-20 rounded-full" /></div>
                    <div><strong>{t('userProfile.id')}:</strong> {profile.id}</div>
                    <div><strong>{t('userProfile.username')}:</strong> {profile.userName}</div>
                    <div><strong>{t('userProfile.invitedBy')}:</strong> {profile.invitedBy || t('userProfile.selfRegistered')}</div>
                    <div><strong>{t('userProfile.role')}:</strong> {profile.role}</div>
                    <div><strong>{t('userProfile.coins')}:</strong> {profile.coins}</div>
                    <div><strong>{t('userProfile.seedingSize')}:</strong> {formatBytes(profile.seedingSize)}</div>
                    <div><strong>{t('userProfile.email')}:</strong> {profile.email}</div>
                    <div><strong>{t('userProfile.registrationTime')}:</strong> {new Date(profile.createdAt).toLocaleString()}</div>
                </div>
            </div>

            <div className="card mb-4">
                <h2 className="text-2xl font-bold mb-4">{t('userProfile.personalStats')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><strong>{t('userProfile.nominalUpload')}:</strong> {formatBytes(profile.nominalUploadedBytes)}</div>
                    <div><strong>{t('userProfile.nominalDownload')}:</strong> {formatBytes(profile.nominalDownloadedBytes)}</div>
                    <div><strong>{t('userProfile.realUpload')}:</strong> {formatBytes(profile.uploadedBytes)}</div>
                    <div><strong>{t('userProfile.realDownload')}:</strong> {formatBytes(profile.downloadedBytes)}</div>
                    <div><strong>{t('userProfile.uploadingCount')}:</strong> {profile.currentSeedingCount}</div>
                    <div><strong>{t('userProfile.downloadingCount')}:</strong> {profile.currentLeechingCount}</div>
                    <div><strong>{t('userProfile.downloadTime')}:</strong> {profile.totalLeechingTimeMinutes} {t('userProfile.minutes')}</div>
                    <div><strong>{t('userProfile.uploadTime')}:</strong> {profile.totalSeedingTimeMinutes} {t('userProfile.minutes')}</div>
                </div>
            </div>

            <div className="card mb-4">
                <h2 className="text-2xl font-bold mb-4">{t('userProfile.torrentInfo')}</h2>
                <h3 className="text-xl font-semibold mb-2">{t('userProfile.myUploads')}</h3>
                <ul>
                    {uploads.map(torrent => (
                        <li key={torrent.id}>{torrent.name}</li>
                    ))}
                </ul>
            </div>

            <div className="card">
                <h2 className="text-2xl font-bold mb-4">{t('userProfile.clientInfo')}</h2>
                <ul>
                    {peers.map(peer => (
                        <li key={peer.torrentId}>
                            <strong>{t('userProfile.client')}:</strong> {peer.userAgent}, 
                            <strong>{t('userProfile.ip')}:</strong> {peer.ipAddress}, 
                            <strong>{t('userProfile.port')}:</strong> {peer.port}, 
                            <strong>{t('userProfile.lastReport')}:</strong> {new Date(peer.lastAnnounceAt).toLocaleString()}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default UserProfilePage;
