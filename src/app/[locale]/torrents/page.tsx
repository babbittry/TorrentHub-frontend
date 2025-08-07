"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchApi } from "@/lib/apiClient";
import Link from "next/link";
import { useTranslations } from 'next-intl';

interface Torrent {
    id: number;
    name: string;
    category: number; // Assuming category is a number, adjust if it's a string or enum
    size: number;
    uploadedByUser: { userName: string };
    createdAt: string;
    isFree: boolean;
    seeders: number;
    leechers: number;
}

interface TorrentListingResponse {
    items: Torrent[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

export default function TorrentsPage() {
    const [torrents, setTorrents] = useState<Torrent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortOrder, setSortOrder] = useState<string>("desc");
    const [totalCount, setTotalCount] = useState<number>(0);
    const t = useTranslations();

    const fetchTorrents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams({
                PageNumber: pageNumber.toString(),
                PageSize: pageSize.toString(),
                SearchTerm: searchTerm,
                Category: category,
                SortBy: sortBy,
                SortOrder: sortOrder,
            }).toString();
            const data: TorrentListingResponse = await fetchApi(`/api/TorrentListing?${query}`);
            setTorrents(data?.items || []);
            setTotalCount(data?.totalCount || 0);
        } catch (err: unknown) {
            setError((err as Error).message || t('error'));
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize, searchTerm, category, sortBy, sortOrder, t]);

    useEffect(() => {
        fetchTorrents();
    }, [fetchTorrents]);

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-extrabold text-[var(--color-primary)] mb-8 text-center drop-shadow-lg">{t('all_torrents')}</h1>

            {/* 筛选和搜索 */}
            <div className="card mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div>
                        <label htmlFor="search" className="block text-[var(--color-foreground)] text-sm font-bold mb-2">{t('search')}</label>
                        <input
                            type="text"
                            id="search"
                            placeholder={t('search_torrents')}
                            className="input-field"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-[var(--color-foreground)] text-sm font-bold mb-2">{t('category')}</label>
                        <select
                            id="category"
                            className="input-field"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">{t('all_torrents')}</option>
                            {/* TODO: Replace with dynamic categories from API if available */}
                            <option value="Movie">{t('Movie')}</option>
                            <option value="TV">{t('TV')}</option>
                            <option value="Anime">{t('Anime')}</option>
                            <option value="Music">{t('Music')}</option>
                            <option value="Game">{t('Game')}</option>
                            <option value="Software">{t('Software')}</option>
                            <option value="Documentary">{t('Documentary')}</option>
                            <option value="Other">{t('Other')}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="sortBy" className="block text-[var(--color-foreground)] text-sm font-bold mb-2">{t('sort_by')}</label>
                        <select
                            id="sortBy"
                            className="input-field"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="createdAt">{t('release_time')}</option>
                            <option value="name">{t('name')}</option>
                            <option value="size">{t('size')}</option>
                            <option value="seeders">{t('seeders_leechers')}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="sortOrder" className="block text-[var(--color-foreground)] text-sm font-bold mb-2">{t('sort_order')}</label>
                        <select
                            id="sortOrder"
                            className="input-field"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="desc">{t('descending')}</option>
                            <option value="asc">{t('ascending')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading && <p className="text-center text-[var(--color-foreground)] text-lg">{t('loading')}</p>}
            {error && <p className="text-center text-[var(--color-error)] text-lg">{t('error')}: {error}</p>}

            {!loading && !error && torrents.length === 0 && (
                <p className="text-center text-[var(--color-text-muted)] text-lg opacity-80">{t('no_torrents_found')}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {torrents.map((torrent) => (
                    <Link href={`/torrents/${torrent.id}`} key={torrent.id}>
                        <div className="card p-6 hover:border-[var(--color-primary)] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col h-full">
                            <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-3 leading-tight">{torrent.name}</h3>
                            <div className="text-[var(--color-foreground)] text-sm space-y-1 flex-grow">
                                <p><span className="font-semibold">{t('category')}:</span> {torrent.category}</p>
                                <p><span className="font-semibold">{t('size')}:</span> {formatBytes(torrent.size)}</p>
                                <p><span className="font-semibold">{t('uploader')}:</span> {torrent.uploadedByUser?.userName || "未知"}</p>
                                <p><span className="font-semibold">{t('release_time')}:</span> {new Date(torrent.createdAt).toLocaleDateString()}</p>
                                <p><span className="font-semibold">{t('seeders_leechers')}:</span> {torrent.seeders || 0} / {torrent.leechers || 0}</p>
                            </div>
                            {torrent.isFree && (
                                <span className="inline-block bg-[var(--color-success)] text-white text-xs px-3 py-1 rounded-full mt-4 self-start shadow-md">{t('free')}</span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {/* 分页 */}
            {!loading && !error && totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-10">
                    <button
                        onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                        disabled={pageNumber === 1}
                        className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('previous_page')}
                    </button>
                    <span className="text-[var(--color-foreground)] text-lg font-semibold">{t('page')} {pageNumber} / {totalPages}</span>
                    <button
                        onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))}
                        disabled={pageNumber === totalPages}
                        className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('next_page')}
                    </button>
                    <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="input-field"
                    >
                        <option value={5}>5 {t('per_page')}</option>
                        <option value={10}>10 {t('per_page')}</option>
                        <option value={20}>20 {t('per_page')}</option>
                    </select>
                </div>
            )}
        </div>
    );
}
