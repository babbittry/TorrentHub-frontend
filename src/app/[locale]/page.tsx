"use client";

import { useEffect, useState } from "react";
import { announcements, torrentListing, AnnouncementDto, TorrentDto } from "@/lib/api";
import { useTranslations } from 'next-intl';
import TorrentCard from "./torrents/components/TorrentCard";
import SiteStats from "./components/SiteStats";

export default function Home() {
    const [_announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
    const [torrents, setTorrents] = useState<TorrentDto[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingAnnouncements, setLoadingAnnouncements] = useState<boolean>(true);
    const [loadingTorrents, setLoadingTorrents] = useState<boolean>(true);
    const [errorAnnouncements, setErrorAnnouncements] = useState<string | null>(null);
    const [errorTorrents, setErrorTorrents] = useState<string | null>(null);
    const t_common = useTranslations('common');
    const t_announcements = useTranslations('announcements');
    const t_header = useTranslations('header');
    const t_torrents = useTranslations('torrentsPage');

    useEffect(() => {
        async function fetchData() {
            setLoadingAnnouncements(true);
            setErrorAnnouncements(null);
            try {
                const response = await announcements.getAnnouncements();
                setAnnouncements(response || []);
            } catch (err: unknown) {
                setErrorAnnouncements((err as Error).message || t_common('error'));
            } finally {
                setLoadingAnnouncements(false);
            }

            setLoadingTorrents(true);
            setErrorTorrents(null);
            try {
                const fetchedTorrents = await torrentListing.getTorrentListing(1, 6);
                setTorrents(fetchedTorrents || []); // Ensure it's an array
            } catch (err: unknown) {
                setErrorTorrents((err as Error).message || t_common('error'));
            } finally {
                setLoadingTorrents(false);
            }
        }
        fetchData();
    }, [t_common]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingTorrents(true);
        setErrorTorrents(null);
        try {
            const fetchedTorrents = await torrentListing.getTorrentListing(1, 6, undefined, searchTerm);
            setTorrents(fetchedTorrents || []);
        } catch (err: unknown) {
            setErrorTorrents((err as Error).message || t_common('error'));
        } finally {
            setLoadingTorrents(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            {/* 公告区 */}
            <section className="card mb-12 transform hover:scale-105 transition-transform duration-500 ease-in-out">
                <h2 className="text-4xl font-extrabold text-[var(--color-primary)] text-center mb-6 drop-shadow-lg">{t_announcements('latest')}</h2>
                {loadingAnnouncements ? (
                    <p className="text-center text-[var(--color-foreground)] text-lg">{t_common('loading')}</p>
                ) : errorAnnouncements ? (
                    <p className="text-center text-[var(--color-error)] text-lg">{t_common('error')}: {errorAnnouncements}</p>
                ) : _announcements.length > 0 ? (
                    <div className="text-center text-[var(--color-foreground)] text-xl leading-relaxed">
                        <p className="font-semibold">{_announcements[0].title}</p>
                        <p className="text-lg text-[var(--color-text-muted)] opacity-90">{_announcements[0].content}</p>
                        <p className="text-sm text-[var(--color-text-muted)] opacity-70 mt-2">{t_common('release_time')}: {new Date(_announcements[0].createdAt).toLocaleDateString()}</p>
                    </div>
                ) : (
                    <p className="text-center text-[var(--color-text-muted)] text-lg opacity-80">{t_announcements('none')}</p>
                )}
            </section>

            {/* 搜索框 */}
            <form onSubmit={handleSearch} className="mb-12 flex justify-center space-x-4">
                <input
                    type="text"
                    placeholder={t_header('search_torrents')}
                    className="input-field flex-grow max-w-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                    type="submit"
                    className="btn-primary px-8 py-4 rounded-full shadow-lg transform hover:scale-105"
                >
                    {t_common('search')}
                </button>
            </form>

            {/* 最新种子列表 */}
            <section>
                <h2 className="text-4xl font-extrabold text-[var(--color-primary)] mb-8 text-center drop-shadow-lg">{t_torrents('latest_torrents')}</h2>
                {loadingTorrents ? (
                    <p className="text-center text-[var(--color-foreground)] text-lg">{t_common('loading')}</p>
                ) : errorTorrents ? (
                    <p className="text-center text-[var(--color-error)] text-lg">{t_common('error')}: {errorTorrents}</p>
                ) : torrents.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                        {torrents.map((torrent) => (
                            <TorrentCard key={torrent.id} torrent={torrent} />
                        ))}
                    </div>
                ) : (
                    <p className="text-[var(--color-text-muted)] text-center text-lg opacity-80">{t_torrents('no_torrents_found')}</p>
                )}
            </section>

            {/* 站点统计 */}
            <section className="mt-12">
                <SiteStats mode="full" />
            </section>
        </div>
    );
}
