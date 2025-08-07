"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/apiClient";
import Link from "next/link";
import { useTranslations } from 'next-intl';

interface Announcement {
    id: number;
    title: string;
    content: string;
    createdAt: string;
}

interface Torrent {
    id: number;
    name: string;
    category: number; // Assuming category is a number, adjust if it's a string or enum
    size: number;
    uploadedByUser: { userName: string };
    createdAt: string;
    isFree: boolean;
    seeders?: number; // Optional, as it might not always be present
    leechers?: number; // Optional
}

export default function Home() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [torrents, setTorrents] = useState<Torrent[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingAnnouncements, setLoadingAnnouncements] = useState<boolean>(true);
    const [loadingTorrents, setLoadingTorrents] = useState<boolean>(true);
    const [errorAnnouncements, setErrorAnnouncements] = useState<string | null>(null);
    const [errorTorrents, setErrorTorrents] = useState<string | null>(null);
    const t = useTranslations();

    useEffect(() => {
        async function fetchData() {
            setLoadingAnnouncements(true);
            setErrorAnnouncements(null);
            try {
                const fetchedAnnouncements: Announcement[] = await fetchApi("/api/Announcement");
                setAnnouncements(fetchedAnnouncements);
            } catch (err: unknown) {
                setErrorAnnouncements((err as Error).message || t('error'));
            } finally {
                setLoadingAnnouncements(false);
            }

            setLoadingTorrents(true);
            setErrorTorrents(null);
            try {
                const fetchedTorrents = await fetchApi("/api/TorrentListing?PageNumber=1&PageSize=6");
                setTorrents(fetchedTorrents.items || []); // Ensure it's an array
            } catch (err: unknown) {
                setErrorTorrents((err as Error).message || t('error'));
            } finally {
                setLoadingTorrents(false);
            }
        }
        fetchData();
    }, [t]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingTorrents(true);
        setErrorTorrents(null);
        try {
            const fetchedTorrents = await fetchApi(`/api/TorrentListing?PageNumber=1&PageSize=6&SearchTerm=${searchTerm}`);
            setTorrents(fetchedTorrents.items || []);
        } catch (err: unknown) {
            setErrorTorrents((err as Error).message || t('error'));
        } finally {
            setLoadingTorrents(false);
        }
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className="container mx-auto p-4">
            {/* 公告区 */}
            <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-xl shadow-2xl mb-12 transform hover:scale-105 transition-transform duration-500 ease-in-out">
                <h2 className="text-4xl font-extrabold text-center mb-6 drop-shadow-lg">{t('latest_announcements')}</h2>
                {loadingAnnouncements ? (
                    <p className="text-center text-lg">{t('loading')}</p>
                ) : errorAnnouncements ? (
                    <p className="text-center text-red-200 text-lg">{t('error')}: {errorAnnouncements}</p>
                ) : announcements.length > 0 ? (
                    <div className="text-center text-xl leading-relaxed">
                        <p className="font-semibold">{announcements[0].title}</p>
                        <p className="text-lg opacity-90">{announcements[0].content}</p>
                        <p className="text-sm opacity-70 mt-2">{t('release_time')}: {new Date(announcements[0].createdAt).toLocaleDateString()}</p>
                    </div>
                ) : (
                    <p className="text-center text-lg opacity-80">{t('no_announcements')}</p>
                )}
            </section>

            {/* 搜索框 */}
            <form onSubmit={handleSearch} className="mb-12 flex justify-center space-x-4">
                <input
                    type="text"
                    placeholder={t('search_torrents')}
                    className="flex-grow max-w-xl p-4 rounded-full border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                    type="submit"
                    className="px-8 py-4 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors duration-300 shadow-lg transform hover:scale-105"
                >
                    {t('search')}
                </button>
            </form>

            {/* 最新种子列表 */}
            <section>
                <h2 className="text-4xl font-extrabold text-white mb-8 text-center drop-shadow-lg">{t('latest_torrents')}</h2>
                {loadingTorrents ? (
                    <p className="text-center text-white text-lg">{t('loading')}</p>
                ) : errorTorrents ? (
                    <p className="text-center text-red-500 text-lg">{t('error')}: {errorTorrents}</p>
                ) : torrents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {torrents.map((torrent) => (
                            <Link href={`/torrents/${torrent.id}`} key={torrent.id}>
                                <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-pink-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col h-full">
                                    <h3 className="text-2xl font-bold text-pink-400 mb-3 leading-tight">{torrent.name}</h3>
                                    <div className="text-gray-300 text-sm space-y-1 flex-grow">
                                        <p><span className="font-semibold">{t('category')}:</span> {torrent.category}</p>
                                        <p><span className="font-semibold">{t('size')}:</span> {formatBytes(torrent.size)}</p>
                                        <p><span className="font-semibold">{t('uploader')}:</span> {torrent.uploadedByUser?.userName || "未知"}</p>
                                        <p><span className="font-semibold">{t('release_time')}:</span> {new Date(torrent.createdAt).toLocaleDateString()}</p>
                                        <p><span className="font-semibold">{t('seeders_leechers')}:</span> {torrent.seeders || 0} / {torrent.leechers || 0}</p>
                                    </div>
                                    {torrent.isFree && (
                                        <span className="inline-block bg-green-500 text-white text-xs px-3 py-1 rounded-full mt-4 self-start shadow-md">{t('free')}</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-white text-center text-lg opacity-80">{t('no_torrents_found')}</p>
                )}
            </section>
        </div>
    );
}
